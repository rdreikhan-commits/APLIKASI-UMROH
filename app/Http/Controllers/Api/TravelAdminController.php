<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Jadwal;
use App\Models\PaketUmroh;
use App\Models\Pembayaran;
use App\Models\Pengeluaran;
use App\Models\Pemasukan;
use App\Models\Agent;
use App\Models\User;
use App\Models\Manasik;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * =====================================================
 * TRAVEL ADMIN CONTROLLER (Admin Travel / Front Office)
 * =====================================================
 * Menangani:
 * 1. CRUD Paket Umroh
 * 2. CRUD Jadwal Keberangkatan
 * 3. Verifikasi Dokumen Jamaah
 * 4. Manifest cetak (daftar jamaah confirmed)
 */
class TravelAdminController extends Controller
{
    // ═════════════════════════════════════════════
    // PAKET UMROH CRUD
    // ═════════════════════════════════════════════

    /**
     * List semua paket.
     * GET /api/admin/travel/paket
     */
    public function paketIndex(Request $request): JsonResponse
    {
        $query = PaketUmroh::withCount('jadwal');

        if ($request->has('search')) {
            $query->where('nama_paket', 'like', "%{$request->search}%");
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $paket = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['success' => true, 'data' => $paket]);
    }

    /**
     * Buat paket baru.
     * POST /api/admin/travel/paket
     */
    public function paketStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama_paket'    => 'required|string|max:200',
            'kode_paket'    => 'required|string|max:30|unique:paket_umroh,kode_paket',
            'tipe'          => 'required|in:reguler,vip,vvip',
            'deskripsi'     => 'nullable|string',
            'durasi_hari'   => 'required|integer|min:1',
            'maskapai'      => 'nullable|string|max:100',
            'hotel_madinah' => 'nullable|string|max:150',
            'hotel_makkah'  => 'nullable|string|max:150',
            'rating_hotel'  => 'nullable|in:3,4,5',
            'harga'         => 'required|numeric|min:0',
            'dp_minimum'    => 'required|numeric|min:0',
            'fasilitas'     => 'nullable|array',
        ]);

        $paket = PaketUmroh::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paket umroh berhasil ditambahkan.',
            'data'    => $paket,
        ], 201);
    }

    /**
     * Update paket.
     * PUT /api/admin/travel/paket/{id}
     */
    public function paketUpdate(Request $request, int $id): JsonResponse
    {
        $paket = PaketUmroh::findOrFail($id);

        $validated = $request->validate([
            'nama_paket'    => 'sometimes|string|max:200',
            'kode_paket'    => "sometimes|string|max:30|unique:paket_umroh,kode_paket,{$id}",
            'tipe'          => 'sometimes|in:reguler,vip,vvip',
            'deskripsi'     => 'nullable|string',
            'durasi_hari'   => 'sometimes|integer|min:1',
            'maskapai'      => 'nullable|string|max:100',
            'hotel_madinah' => 'nullable|string|max:150',
            'hotel_makkah'  => 'nullable|string|max:150',
            'rating_hotel'  => 'nullable|in:3,4,5',
            'harga'         => 'sometimes|numeric|min:0',
            'dp_minimum'    => 'sometimes|numeric|min:0',
            'fasilitas'     => 'nullable|array',
            'is_active'     => 'sometimes|boolean',
        ]);

        $paket->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paket umroh berhasil diperbarui.',
            'data'    => $paket->fresh(),
        ]);
    }

    /**
     * Hapus paket (soft delete).
     * DELETE /api/admin/travel/paket/{id}
     */
    public function paketDestroy(int $id): JsonResponse
    {
        $paket = PaketUmroh::findOrFail($id);
        $paket->delete();

        return response()->json([
            'success' => true,
            'message' => "Paket '{$paket->nama_paket}' berhasil dihapus.",
        ]);
    }

    // ═════════════════════════════════════════════
    // JADWAL CRUD
    // ═════════════════════════════════════════════

    /**
     * List jadwal keberangkatan.
     * GET /api/admin/travel/jadwal
     */
    public function jadwalIndex(Request $request): JsonResponse
    {
        $query = Jadwal::with('paket:id,nama_paket,kode_paket,tipe,harga')
            ->withCount(['bookings as total_booking'])
            ->withCount(['bookings as confirmed_booking' => function ($q) {
                $q->where('status', 'confirmed');
            }]);

        if ($request->has('paket_id')) {
            $query->where('paket_id', $request->paket_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $jadwal = $query->orderBy('tanggal_berangkat', 'asc')->get();

        return response()->json(['success' => true, 'data' => $jadwal]);
    }

    /**
     * Buat jadwal baru.
     * POST /api/admin/travel/jadwal
     */
    public function jadwalStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'paket_id'           => 'required|exists:paket_umroh,id',
            'kode_jadwal'        => 'required|string|max:30|unique:jadwal,kode_jadwal',
            'tanggal_berangkat'  => 'required|date|after:today',
            'tanggal_pulang'     => 'required|date|after:tanggal_berangkat',
            'kota_keberangkatan' => 'nullable|string|max:100',
            'kuota_total'        => 'required|integer|min:1',
            'catatan'            => 'nullable|string',
        ]);

        // sisa_kuota = kuota_total saat pertama dibuat
        $validated['sisa_kuota'] = $validated['kuota_total'];
        $validated['status'] = 'open';

        $jadwal = Jadwal::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal keberangkatan berhasil ditambahkan.',
            'data'    => $jadwal->load('paket'),
        ], 201);
    }

    /**
     * Update jadwal.
     * PUT /api/admin/travel/jadwal/{id}
     */
    public function jadwalUpdate(Request $request, int $id): JsonResponse
    {
        $jadwal = Jadwal::findOrFail($id);

        $validated = $request->validate([
            'kode_jadwal'        => "sometimes|string|max:30|unique:jadwal,kode_jadwal,{$id}",
            'tanggal_berangkat'  => 'sometimes|date',
            'tanggal_pulang'     => 'sometimes|date',
            'kota_keberangkatan' => 'nullable|string|max:100',
            'kuota_total'        => 'sometimes|integer|min:1',
            'status'             => 'sometimes|in:upcoming,open,closed,departed,completed',
            'catatan'            => 'nullable|string',
        ]);

        // Jika kuota_total berubah, adjust sisa_kuota juga
        if (isset($validated['kuota_total'])) {
            $confirmedCount = $jadwal->bookings()->where('status', 'confirmed')->count();
            $validated['sisa_kuota'] = max(0, $validated['kuota_total'] - $confirmedCount);
        }

        $jadwal->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui.',
            'data'    => $jadwal->fresh()->load('paket'),
        ]);
    }

    /**
     * Hapus jadwal.
     * DELETE /api/admin/travel/jadwal/{id}
     */
    public function jadwalDestroy(int $id): JsonResponse
    {
        $jadwal = Jadwal::findOrFail($id);

        // Cek apakah ada booking yang confirmed
        $confirmedCount = $jadwal->bookings()->where('status', 'confirmed')->count();
        if ($confirmedCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Tidak bisa menghapus jadwal yang memiliki {$confirmedCount} booking confirmed.",
            ], 422);
        }

        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => "Jadwal '{$jadwal->kode_jadwal}' berhasil dihapus.",
        ]);
    }

    // ═════════════════════════════════════════════
    // VERIFIKASI DOKUMEN JAMAAH
    // ═════════════════════════════════════════════

    /**
     * List jamaah yang dokumennya perlu diverifikasi.
     * GET /api/admin/travel/dokumen
     */
    public function dokumenIndex(Request $request): JsonResponse
    {
        $query = Booking::with('user:id,nama,email,nik,no_paspor,foto_ktp_path,foto_paspor_path,foto_buku_nikah_path')
            ->with('jadwal:id,kode_jadwal,tanggal_berangkat');

        if ($request->has('status_dokumen')) {
            $query->where('status_dokumen', $request->status_dokumen);
        } else {
            // Default: tampilkan yang perlu review dulu
            $query->orderByRaw("FIELD(status_dokumen, 'review', 'incomplete', 'valid', 'rejected')");
        }

        $bookings = $query->paginate($request->get('per_page', 15));

        return response()->json(['success' => true, 'data' => $bookings]);
    }

    /**
     * Approve / Reject dokumen jamaah.
     * POST /api/admin/travel/dokumen/{bookingId}/verify
     */
    public function verifyDokumen(Request $request, int $bookingId): JsonResponse
    {
        $request->validate([
            'status_dokumen' => 'required|in:valid,rejected',
            'catatan_admin'  => 'nullable|string|max:500',
        ]);

        $booking = Booking::with('user')->findOrFail($bookingId);

        $booking->update([
            'status_dokumen' => $request->status_dokumen,
            'catatan_admin'  => $request->catatan_admin ?? $booking->catatan_admin,
        ]);

        // Sync status_dokumen ke user juga (untuk profiling)
        $booking->user->update([
            'status_dokumen' => $request->status_dokumen,
        ]);

        return response()->json([
            'success' => true,
            'message' => $request->status_dokumen === 'valid'
                ? 'Dokumen jamaah disetujui.'
                : 'Dokumen jamaah ditolak. Jamaah perlu upload ulang.',
            'data'    => $booking->fresh()->load('user:id,nama,status_dokumen'),
        ]);
    }

    // ═════════════════════════════════════════════
    // MANIFEST (CETAK DAFTAR JAMAAH CONFIRMED)
    // ═════════════════════════════════════════════

    /**
     * Daftar jamaah confirmed per jadwal (untuk manifest maskapai/kedutaan).
     * GET /api/admin/travel/manifest/{jadwalId}
     */
    public function manifest(int $jadwalId): JsonResponse
    {
        $jadwal = Jadwal::with('paket:id,nama_paket,kode_paket,maskapai')
            ->findOrFail($jadwalId);

        $jamaahConfirmed = Booking::with('user:id,nama,nik,no_paspor,email,no_hp,jenis_kelamin,tempat_lahir,tanggal_lahir,alamat')
            ->where('jadwal_id', $jadwalId)
            ->where('status', 'confirmed')
            ->where('status_dokumen', 'valid')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($booking, $index) {
                return [
                    'no'             => $index + 1,
                    'kode_booking'   => $booking->kode_booking,
                    'nama'           => $booking->user->nama,
                    'nik'            => $booking->user->nik,
                    'no_paspor'      => $booking->user->no_paspor,
                    'jenis_kelamin'  => $booking->user->jenis_kelamin,
                    'tempat_lahir'   => $booking->user->tempat_lahir,
                    'tanggal_lahir'  => $booking->user->tanggal_lahir?->format('Y-m-d'),
                    'no_hp'          => $booking->user->no_hp,
                    'email'          => $booking->user->email,
                    'alamat'         => $booking->user->alamat,
                    'total_dibayar'  => $booking->total_dibayar,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => [
                'jadwal'         => $jadwal,
                'total_jamaah'   => $jamaahConfirmed->count(),
                'manifest'       => $jamaahConfirmed,
                'generated_at'   => now()->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    // ═════════════════════════════════════════════
    // DASHBOARD STATS (GRAFIK)
    // ═════════════════════════════════════════════

    /**
     * Dashboard overview stats.
     * GET /api/admin/travel/dashboard-stats?period=month
     * period: week, 2week, month, 3month, year
     */
    public function dashboardStats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');

        // Determine date range
        $now = now();
        $startDate = match($period) {
            'week'   => $now->copy()->subWeek(),
            '2week'  => $now->copy()->subWeeks(2),
            'month'  => $now->copy()->subMonth(),
            '3month' => $now->copy()->subMonths(3),
            'year'   => $now->copy()->subYear(),
            default  => $now->copy()->subMonth(),
        };

        // Date format for grouping
        $groupFormat = match($period) {
            'week', '2week' => '%Y-%m-%d',
            'month'         => '%Y-%m-%d',
            '3month'        => '%Y-%u',
            'year'          => '%Y-%m',
            default         => '%Y-%m-%d',
        };

        // ── Summary Cards ──
        $totalPaket = PaketUmroh::count();
        $totalJamaah = User::where('role', 'jamaah')->count();
        $totalBooking = Booking::count();
        $bookingConfirmed = Booking::where('status', 'confirmed')->count();
        $jadwalOpen = Jadwal::where('status', 'open')->count();
        $totalAgent = Agent::count();

        // ── Booking Trend ──
        $bookingTrend = Booking::where('created_at', '>=', $startDate)
            ->select(DB::raw("DATE_FORMAT(created_at, '{$groupFormat}') as label"), DB::raw('COUNT(*) as total'))
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        // ── Paket Type Distribution (Pie) ──
        $paketDistribution = PaketUmroh::select('tipe', DB::raw('COUNT(*) as total'))
            ->groupBy('tipe')
            ->get();

        // ── Booking by Status (Pie) ──
        $bookingByStatus = Booking::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get();

        // ── Cash Flow (Arus Kas) ──
        $pemasukan = Pemasukan::where('tanggal', '>=', $startDate)
            ->select(DB::raw("DATE_FORMAT(tanggal, '{$groupFormat}') as label"), DB::raw('SUM(nominal) as total'))
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        $pengeluaran = Pengeluaran::where('tanggal', '>=', $startDate)
            ->select(DB::raw("DATE_FORMAT(tanggal, '{$groupFormat}') as label"), DB::raw('SUM(nominal) as total'))
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        $pembayaranVerified = Pembayaran::where('status_pembayaran', 'verified')
            ->where('created_at', '>=', $startDate)
            ->sum('nominal');

        $totalPengeluaranPeriod = Pengeluaran::where('tanggal', '>=', $startDate)->sum('nominal');
        $totalPemasukanPeriod = Pemasukan::where('tanggal', '>=', $startDate)->sum('nominal');

        // ── Pengeluaran per Kategori (Donut) ──
        $pengeluaranKategori = Pengeluaran::where('tanggal', '>=', $startDate)
            ->select('kategori', DB::raw('SUM(nominal) as total'))
            ->groupBy('kategori')
            ->orderByDesc('total')
            ->get();

        // ── Jadwal Terdekat ──
        $jadwalTerdekat = Jadwal::with('paket:id,nama_paket,kode_paket')
            ->where('status', 'open')
            ->where('tanggal_berangkat', '>=', now())
            ->orderBy('tanggal_berangkat')
            ->limit(5)
            ->get(['id','paket_id','kode_jadwal','tanggal_berangkat','kuota_total','sisa_kuota']);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_paket' => $totalPaket,
                    'total_jamaah' => $totalJamaah,
                    'total_booking' => $totalBooking,
                    'booking_confirmed' => $bookingConfirmed,
                    'jadwal_open' => $jadwalOpen,
                    'total_agent' => $totalAgent,
                    'pembayaran_verified' => $pembayaranVerified,
                    'total_pemasukan' => $totalPemasukanPeriod,
                    'total_pengeluaran' => $totalPengeluaranPeriod,
                    'profit' => $totalPemasukanPeriod + $pembayaranVerified - $totalPengeluaranPeriod,
                ],
                'booking_trend' => $bookingTrend,
                'paket_distribution' => $paketDistribution,
                'booking_by_status' => $bookingByStatus,
                'cash_flow' => [
                    'pemasukan' => $pemasukan,
                    'pengeluaran' => $pengeluaran,
                ],
                'pengeluaran_kategori' => $pengeluaranKategori,
                'jadwal_terdekat' => $jadwalTerdekat,
                'period' => $period,
            ],
        ]);
    }

    // ════════════════════════════════════════════════════════════════
    // MODUL MANASIK
    // ════════════════════════════════════════════════════════════════

    public function manasikIndex(Request $request): JsonResponse
    {
        $query = Manasik::with('jadwal.paket')->orderBy('jadwal_id')->orderBy('urutan');
        if ($request->has('jadwal_id')) {
            $query->where('jadwal_id', $request->jadwal_id);
        }
        return response()->json([
            'success' => true,
            'data'    => $query->get(),
        ]);
    }

    public function manasikStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jadwal_id' => 'required|exists:jadwal,id',
            'judul' => 'required|string|max:255',
            'konten' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'urutan' => 'required|integer',
            'jadwal_detail' => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('manasik', 'public');
        }

        $manasik = Manasik::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Materi manasik berhasil ditambahkan.',
            'data'    => $manasik,
        ], 201);
    }

    public function manasikUpdate(Request $request, $id): JsonResponse
    {
        $manasik = Manasik::findOrFail($id);
        $validated = $request->validate([
            'judul' => 'sometimes|string|max:255',
            'konten' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'urutan' => 'sometimes|integer',
            'jadwal_detail' => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('manasik', 'public');
        }

        $manasik->update($validated);
        return response()->json([
            'success' => true,
            'message' => 'Materi manasik berhasil diupdate.',
            'data'    => $manasik,
        ]);
    }

    public function manasikDestroy($id): JsonResponse
    {
        $manasik = Manasik::findOrFail($id);
        $manasik->delete();
        return response()->json([
            'success' => true,
            'message' => 'Materi manasik berhasil dihapus.',
        ]);
    }

    public function manasikByJadwal($jadwalId): JsonResponse
    {
        $materi = Manasik::where('jadwal_id', $jadwalId)->orderBy('urutan')->get();
        return response()->json([
            'success' => true,
            'data'    => $materi,
        ]);
    }
}
