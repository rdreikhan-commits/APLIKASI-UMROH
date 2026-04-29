<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\DistribusiPerlengkapan;
use App\Models\Jadwal;
use App\Models\MasterPerlengkapan;
use App\Models\Pembayaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * =====================================================
 * PAYMENT CONTROLLER (Admin Keuangan)
 * =====================================================
 *
 * Controller kritis yang menangani:
 * 1. List pembayaran pending untuk verifikasi
 * 2. Verifikasi pembayaran (CORE INTEGRATION LOGIC)
 * 3. Reject pembayaran
 * 4. Laporan pendapatan per jadwal/paket
 *
 * ⚠️ CRITICAL PROCESS: verifyPayment()
 * Proses ini melibatkan 4 tabel sekaligus dalam satu transaksi:
 * - pembayaran (update status)
 * - bookings (update total_dibayar & status)
 * - jadwal (decrement sisa_kuota)
 * - distribusi_perlengkapan (auto-generate list barang)
 */
class PaymentController extends Controller
{
    /**
     * ─────────────────────────────────────────────
     * LIST PEMBAYARAN PENDING
     * ─────────────────────────────────────────────
     * Menampilkan semua pembayaran yang menunggu verifikasi.
     * Diakses oleh Admin Keuangan.
     *
     * GET /api/admin/keuangan/pembayaran
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pembayaran::with([
            'booking.user:id,nama,email,no_hp',
            'booking.jadwal.paket:id,nama_paket,kode_paket',
            'verifier:id,nama',
        ]);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status_pembayaran', $request->status);
        } else {
            // Default: tampilkan yang pending duluan
            $query->orderByRaw("FIELD(status_pembayaran, 'pending', 'verified', 'rejected')");
        }

        // Filter by booking_id
        if ($request->has('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }

        $pembayaran = $query->orderBy('created_at', 'desc')
                           ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => $pembayaran,
        ]);
    }

    /**
     * ─────────────────────────────────────────────
     * DETAIL PEMBAYARAN
     * ─────────────────────────────────────────────
     * GET /api/admin/keuangan/pembayaran/{id}
     */
    public function show(int $id): JsonResponse
    {
        $pembayaran = Pembayaran::with([
            'booking.user',
            'booking.jadwal.paket',
            'booking.pembayaran', // Semua riwayat pembayaran di booking ini
            'verifier:id,nama',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $pembayaran,
        ]);
    }

    /**
     * ═════════════════════════════════════════════════════════
     * ✅ VERIFY PAYMENT — CORE INTEGRATION LOGIC
     * ═════════════════════════════════════════════════════════
     *
     * POST /api/admin/keuangan/pembayaran/{id}/verify
     *
     * FLOW KRITIS:
     * 1. Validasi pembayaran masih berstatus 'pending'
     * 2. Update status pembayaran → 'verified'
     * 3. Akumulasi total_dibayar di booking
     * 4. Cek apakah total_dibayar >= dp_minimum (atau lunas)
     *    → Jika YA: ubah booking status → 'confirmed'
     *    → Decrement sisa_kuota di jadwal (ATOMIC!)
     *    → Auto-generate distribusi perlengkapan
     *
     * ⚠️ SEMUA OPERASI DIBUNGKUS DALAM DB::transaction()
     *    UNTUK MENJAGA KONSISTENSI DATA.
     *
     * ⚠️ PESSIMISTIC LOCKING digunakan pada row jadwal
     *    untuk mencegah race condition saat decrement kuota.
     */
    public function verifyPayment(Request $request, int $id): JsonResponse
    {
        // Validasi input
        $request->validate([
            'catatan' => 'nullable|string|max:500',
        ]);

        // ─────────────────────────────────────────
        // MULAI DATABASE TRANSACTION
        // ─────────────────────────────────────────
        // Semua query di dalam block ini bersifat atomic.
        // Jika salah satu gagal, SEMUA di-rollback.
        try {
            $result = DB::transaction(function () use ($request, $id) {

                // ── STEP 1: Ambil pembayaran + lock row ──
                // lockForUpdate() = PESSIMISTIC LOCK
                // Mencegah pembayaran yang sama di-verify 2x secara bersamaan
                $pembayaran = Pembayaran::lockForUpdate()->findOrFail($id);

                // Validasi: hanya bisa verify yang masih pending
                if ($pembayaran->status_pembayaran !== 'pending') {
                    throw new \Exception(
                        "Pembayaran ini sudah di-{$pembayaran->status_pembayaran}. Tidak bisa diverifikasi ulang.",
                        422
                    );
                }

                // ── STEP 2: Update status pembayaran → verified ──
                $pembayaran->update([
                    'status_pembayaran' => 'verified',
                    'verified_by'       => $request->user()->id,  // Admin yang login
                    'verified_at'       => now(),
                    'keterangan'        => $request->catatan ?? $pembayaran->keterangan,
                ]);

                // ── STEP 3: Update total_dibayar di booking ──
                // Lock booking row untuk mencegah concurrent update
                $booking = Booking::lockForUpdate()->findOrFail($pembayaran->booking_id);

                // Akumulasi nominal yang baru diverifikasi
                $booking->total_dibayar += $pembayaran->nominal;
                $booking->save();

                // ── STEP 4: Cek apakah pembayaran memenuhi threshold ──
                // Load paket untuk mendapatkan dp_minimum
                $booking->load('jadwal.paket');
                $dpMinimum = $booking->jadwal->paket->dp_minimum ?? 0;

                $wasNotConfirmed = $booking->status !== 'confirmed';
                $meetsThreshold  = $booking->total_dibayar >= $dpMinimum;

                // ── STEP 5: Jika threshold terpenuhi DAN belum confirmed → CONFIRM ──
                if ($wasNotConfirmed && $meetsThreshold) {
                    // Update booking status → confirmed
                    $booking->status = 'confirmed';
                    $booking->save();

                    // ── STEP 5a: DECREMENT sisa_kuota (ATOMIC) ──
                    // Menggunakan lockForUpdate() pada row jadwal
                    // untuk mencegah 2 pembayaran ter-verify bersamaan
                    // menghasilkan over-decrement (race condition).
                    $jadwal = Jadwal::lockForUpdate()->findOrFail($booking->jadwal_id);

                    if ($jadwal->sisa_kuota <= 0) {
                        // Kuota sudah habis! Rollback semua.
                        throw new \Exception(
                            'Kuota jadwal sudah habis. Tidak bisa mengkonfirmasi booking.',
                            409
                        );
                    }

                    // Atomic decrement - aman dari race condition
                    $jadwal->decrement('sisa_kuota');

                    // Auto-close jadwal jika kuota habis
                    if ($jadwal->fresh()->sisa_kuota <= 0) {
                        $jadwal->update(['status' => 'closed']);
                    }

                    // ── STEP 5b: AUTO-GENERATE DISTRIBUSI PERLENGKAPAN ──
                    // Ambil semua barang perlengkapan aktif
                    // dan buat record distribusi untuk jamaah ini.
                    $this->generateDistribusiPerlengkapan($booking);

                    Log::info("Booking {$booking->kode_booking} CONFIRMED. Kuota jadwal decremented.", [
                        'booking_id' => $booking->id,
                        'jadwal_id'  => $jadwal->id,
                        'sisa_kuota' => $jadwal->fresh()->sisa_kuota,
                    ]);
                }

                // Jika belum memenuhi threshold, ubah status ke waiting_payment
                if ($wasNotConfirmed && !$meetsThreshold && $booking->status === 'pending') {
                    $booking->update(['status' => 'waiting_payment']);
                }

                return [
                    'pembayaran'       => $pembayaran->fresh()->load('verifier:id,nama'),
                    'booking'          => $booking->fresh()->load('jadwal.paket'),
                    'is_confirmed'     => $wasNotConfirmed && $meetsThreshold,
                    'total_dibayar'    => $booking->total_dibayar,
                    'sisa_pembayaran'  => max(0, $booking->total_harga - $booking->total_dibayar),
                ];

            }); // END DB::transaction

            return response()->json([
                'success' => true,
                'message' => $result['is_confirmed']
                    ? 'Pembayaran diverifikasi. Booking telah dikonfirmasi & perlengkapan di-generate.'
                    : 'Pembayaran diverifikasi. Menunggu pembayaran selanjutnya untuk konfirmasi.',
                'data'    => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('verifyPayment FAILED', [
                'pembayaran_id' => $id,
                'error'         => $e->getMessage(),
            ]);

            $statusCode = is_numeric($e->getCode()) && $e->getCode() >= 400
                ? (int) $e->getCode()
                : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $statusCode);
        }
    }

    /**
     * ─────────────────────────────────────────────
     * REJECT PAYMENT
     * ─────────────────────────────────────────────
     *
     * POST /api/admin/keuangan/pembayaran/{id}/reject
     */
    public function rejectPayment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'alasan_reject' => 'required|string|max:500',
        ]);

        $pembayaran = Pembayaran::findOrFail($id);

        if ($pembayaran->status_pembayaran !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => "Pembayaran sudah di-{$pembayaran->status_pembayaran}.",
            ], 422);
        }

        $pembayaran->update([
            'status_pembayaran' => 'rejected',
            'alasan_reject'     => $request->alasan_reject,
            'verified_by'       => $request->user()->id,
            'verified_at'       => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran ditolak.',
            'data'    => $pembayaran->load('verifier:id,nama'),
        ]);
    }

    /**
     * ─────────────────────────────────────────────
     * LAPORAN PENDAPATAN PER JADWAL
     * ─────────────────────────────────────────────
     *
     * GET /api/admin/keuangan/laporan/pendapatan
     */
    public function laporanPendapatan(Request $request): JsonResponse
    {
        $query = Jadwal::with('paket:id,nama_paket,kode_paket,harga')
            ->withCount(['bookings as total_jamaah' => function ($q) {
                $q->where('status', 'confirmed');
            }])
            ->withSum(['bookings as total_pendapatan' => function ($q) {
                $q->where('status', '!=', 'cancelled');
            }], 'total_dibayar');

        // Filter by paket
        if ($request->has('paket_id')) {
            $query->where('paket_id', $request->paket_id);
        }

        // Filter by date range
        if ($request->has('dari_tanggal')) {
            $query->where('tanggal_berangkat', '>=', $request->dari_tanggal);
        }
        if ($request->has('sampai_tanggal')) {
            $query->where('tanggal_berangkat', '<=', $request->sampai_tanggal);
        }

        $laporan = $query->orderBy('tanggal_berangkat', 'desc')->get();

        return response()->json([
            'success' => true,
            'data'    => $laporan,
            'summary' => [
                'total_jadwal'     => $laporan->count(),
                'total_jamaah'     => $laporan->sum('total_jamaah'),
                'total_pendapatan' => $laporan->sum('total_pendapatan'),
            ],
        ]);
    }

    /**
     * ─────────────────────────────────────────────
     * PRIVATE: Auto-Generate Distribusi Perlengkapan
     * ─────────────────────────────────────────────
     *
     * Dipanggil setelah booking di-confirm.
     * Membuat record distribusi untuk SEMUA barang aktif
     * agar Admin Perlengkapan bisa mulai tracking penyerahan.
     *
     * @param Booking $booking
     */
    private function generateDistribusiPerlengkapan(Booking $booking): void
    {
        // Ambil semua barang perlengkapan yang aktif
        $allPerlengkapan = MasterPerlengkapan::active()->get();

        $distribusiData = $allPerlengkapan->map(function ($barang) use ($booking) {
            return [
                'booking_id'       => $booking->id,
                'perlengkapan_id'  => $barang->id,
                'jumlah'           => 1,                  // Default 1 per jamaah
                'status_penyerahan'=> 'pending',
                'tgl_penyerahan'   => null,
                'distributed_by'   => null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        })->toArray();

        // Bulk insert untuk efisiensi
        // Menggunakan insertOrIgnore untuk menghindari duplikasi
        // (jika ada unique constraint booking_id + perlengkapan_id)
        DistribusiPerlengkapan::insertOrIgnore($distribusiData);

        Log::info("Distribusi perlengkapan generated for booking {$booking->kode_booking}", [
            'booking_id'   => $booking->id,
            'items_count'  => count($distribusiData),
        ]);
    }
}
