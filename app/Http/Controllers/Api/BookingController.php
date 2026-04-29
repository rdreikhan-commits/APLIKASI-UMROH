<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Jadwal;
use App\Models\Pembayaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * =====================================================
 * BOOKING CONTROLLER (Jamaah)
 * =====================================================
 * Menangani proses booking oleh jamaah:
 * 1. Lihat katalog paket & jadwal (real-time kuota)
 * 2. Checkout / buat booking baru
 * 3. Upload bukti pembayaran
 * 4. Tracking status booking
 */
class BookingController extends Controller
{
    /**
     * List booking milik jamaah yang sedang login.
     * GET /api/jamaah/bookings
     */
    public function myBookings(Request $request): JsonResponse
    {
        $bookings = Booking::with([
            'jadwal.paket:id,nama_paket,kode_paket,tipe,harga',
            'pembayaran:id,booking_id,jenis_pembayaran,nominal,status_pembayaran,created_at',
            'distribusiPerlengkapan.perlengkapan:id,nama_barang',
        ])
        ->where('user_id', $request->user()->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data'    => $bookings,
        ]);
    }

    /**
     * Detail satu booking.
     * GET /api/jamaah/bookings/{kodeBooking}
     */
    public function show(Request $request, string $kodeBooking): JsonResponse
    {
        $booking = Booking::with([
            'jadwal.paket',
            'pembayaran.verifier:id,nama',
            'distribusiPerlengkapan.perlengkapan',
        ])
        ->where('user_id', $request->user()->id)
        ->where('kode_booking', $kodeBooking)
        ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $booking,
        ]);
    }

    /**
     * ─────────────────────────────────────────────
     * CHECKOUT / BUAT BOOKING BARU
     * ─────────────────────────────────────────────
     *
     * POST /api/jamaah/bookings
     *
     * ⚠️ Menggunakan DB Transaction + Pessimistic Lock
     *    untuk mencegah race condition kuota.
     *    Kuota BELUM di-decrement di sini — hanya di-reserve.
     *    Decrement terjadi saat pembayaran di-verify (PaymentController).
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'jadwal_id'      => 'required|exists:jadwal,id',
            'catatan_jamaah' => 'nullable|string|max:500',
        ]);

        try {
            $booking = DB::transaction(function () use ($request) {

                // Lock jadwal untuk cek kuota secara aman
                $jadwal = Jadwal::lockForUpdate()
                    ->with('paket')
                    ->findOrFail($request->jadwal_id);

                // Validasi jadwal masih open
                if ($jadwal->status !== 'open') {
                    throw new \Exception('Jadwal ini sudah ditutup untuk pendaftaran.', 422);
                }

                // Validasi kuota tersedia
                if ($jadwal->sisa_kuota <= 0) {
                    throw new \Exception('Maaf, kuota jadwal ini sudah habis.', 409);
                }

                // Validasi user belum punya booking aktif di jadwal yang sama
                $existing = Booking::where('user_id', $request->user()->id)
                    ->where('jadwal_id', $jadwal->id)
                    ->whereNotIn('status', ['cancelled'])
                    ->exists();

                if ($existing) {
                    throw new \Exception('Anda sudah memiliki booking aktif di jadwal ini.', 409);
                }

                // Buat booking baru
                $booking = Booking::create([
                    'user_id'        => $request->user()->id,
                    'jadwal_id'      => $jadwal->id,
                    'status'         => 'pending',
                    'status_dokumen' => 'incomplete',
                    'total_harga'    => $jadwal->paket->harga,
                    'total_dibayar'  => 0,
                    'catatan_jamaah' => $request->catatan_jamaah,
                ]);

                // NOTE: sisa_kuota TIDAK di-decrement di sini.
                // Decrement dilakukan saat pembayaran diverifikasi (PaymentController@verifyPayment)
                // untuk memastikan hanya jamaah yang sudah bayar yang mendapat seat.

                return $booking->load('jadwal.paket');
            });

            return response()->json([
                'success' => true,
                'message' => 'Booking berhasil dibuat. Silakan lakukan pembayaran.',
                'data'    => $booking,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], is_numeric($e->getCode()) && $e->getCode() >= 400 ? (int) $e->getCode() : 500);
        }
    }

    /**
     * ─────────────────────────────────────────────
     * UPLOAD BUKTI PEMBAYARAN
     * ─────────────────────────────────────────────
     *
     * POST /api/jamaah/bookings/{kodeBooking}/bayar
     */
    public function uploadBuktiPembayaran(Request $request, string $kodeBooking): JsonResponse
    {
        $request->validate([
            'jenis_pembayaran'  => 'required|in:dp,cicilan,lunas',
            'nominal'           => 'required|numeric|min:1',
            'bukti_transfer'    => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'keterangan'        => 'nullable|string|max:500',
        ]);

        $booking = Booking::where('user_id', $request->user()->id)
            ->where('kode_booking', $kodeBooking)
            ->whereNotIn('status', ['cancelled'])
            ->firstOrFail();

        // Upload bukti transfer
        $buktiPath = $request->file('bukti_transfer')
            ->store("pembayaran/{$booking->id}", 'public');

        // Buat record pembayaran
        $pembayaran = Pembayaran::create([
            'booking_id'          => $booking->id,
            'jenis_pembayaran'    => $request->jenis_pembayaran,
            'nominal'             => $request->nominal,
            'bukti_transfer_path' => $buktiPath,
            'keterangan'          => $request->keterangan,
            'status_pembayaran'   => 'pending',
        ]);

        // Update status booking ke waiting_payment jika masih pending
        if ($booking->status === 'pending') {
            $booking->update(['status' => 'waiting_payment']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin keuangan.',
            'data'    => $pembayaran,
        ], 201);
    }

    /**
     * Cancel booking (oleh jamaah).
     * POST /api/jamaah/bookings/{kodeBooking}/cancel
     */
    public function cancel(Request $request, string $kodeBooking): JsonResponse
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->where('kode_booking', $kodeBooking)
            ->whereIn('status', ['pending', 'waiting_payment'])
            ->firstOrFail();

        $booking->update([
            'status'       => 'cancelled',
            'catatan_admin' => 'Dibatalkan oleh jamaah.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
        ]);
    }
}
