<?php

/**
 * ═══════════════════════════════════════════════════════════
 * API ROUTES — SISTEM ERP TRAVEL UMROH
 * ═══════════════════════════════════════════════════════════
 *
 * Struktur endpoint berdasarkan aktor:
 *
 * PUBLIC (tanpa auth):
 *   /api/auth/*           → Register, Login
 *   /api/katalog/*        → Browsing paket & jadwal
 *
 * JAMAAH (auth + role:jamaah):
 *   /api/jamaah/*         → Booking, Bayar, Tracking
 *
 * ADMIN TRAVEL (auth + role:admin_travel):
 *   /api/admin/travel/*   → CRUD Paket, Jadwal, Verifikasi Dokumen
 *
 * ADMIN KEUANGAN (auth + role:admin_keuangan):
 *   /api/admin/keuangan/* → Verifikasi Pembayaran, Laporan
 *
 * ADMIN PERLENGKAPAN (auth + role:admin_perlengkapan):
 *   /api/admin/perlengkapan/* → CRUD Inventory, Distribusi, Laporan Stok
 */

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TravelAdminController;
use Illuminate\Support\Facades\Route;

// ═════════════════════════════════════════════
// PUBLIC ROUTES (Tanpa Autentikasi)
// ═════════════════════════════════════════════

// Auth
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Katalog (Public)
Route::prefix('katalog')->group(function () {
    Route::get('/paket', [CatalogController::class, 'paketList']);
    Route::get('/paket/{id}', [CatalogController::class, 'paketDetail']);
    Route::get('/jadwal', [CatalogController::class, 'jadwalList']);
    Route::get('/jadwal/{id}', [CatalogController::class, 'jadwalDetail']);
});


// ═════════════════════════════════════════════
// PROTECTED ROUTES (Harus Login — Sanctum)
// ═════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    // ─── Auth (Profile) ───
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/upload-dokumen', [AuthController::class, 'uploadDokumen']);
    });

    // ═════════════════════════════════════════
    // JAMAAH ROUTES
    // ═════════════════════════════════════════
    Route::prefix('jamaah')->middleware('role:jamaah')->group(function () {
        Route::get('/bookings', [BookingController::class, 'myBookings']);
        Route::get('/bookings/{kodeBooking}', [BookingController::class, 'show']);
        Route::post('/bookings', [BookingController::class, 'checkout']);
        Route::post('/bookings/{kodeBooking}/bayar', [BookingController::class, 'uploadBuktiPembayaran']);
        Route::post('/bookings/{kodeBooking}/cancel', [BookingController::class, 'cancel']);
    });

    // ═════════════════════════════════════════
    // ADMIN TRAVEL ROUTES
    // ═════════════════════════════════════════
    Route::prefix('admin/travel')->middleware('role:admin_travel')->group(function () {

        // Paket CRUD
        Route::get('/paket', [TravelAdminController::class, 'paketIndex']);
        Route::post('/paket', [TravelAdminController::class, 'paketStore']);
        Route::put('/paket/{id}', [TravelAdminController::class, 'paketUpdate']);
        Route::delete('/paket/{id}', [TravelAdminController::class, 'paketDestroy']);

        // Jadwal CRUD
        Route::get('/jadwal', [TravelAdminController::class, 'jadwalIndex']);
        Route::post('/jadwal', [TravelAdminController::class, 'jadwalStore']);
        Route::put('/jadwal/{id}', [TravelAdminController::class, 'jadwalUpdate']);
        Route::delete('/jadwal/{id}', [TravelAdminController::class, 'jadwalDestroy']);

        // Verifikasi Dokumen
        Route::get('/dokumen', [TravelAdminController::class, 'dokumenIndex']);
        Route::post('/dokumen/{bookingId}/verify', [TravelAdminController::class, 'verifyDokumen']);

        // Manifest
        Route::get('/manifest/{jadwalId}', [TravelAdminController::class, 'manifest']);

        // Dashboard Stats
        Route::get('/dashboard-stats', [TravelAdminController::class, 'dashboardStats']);
    });

    // ═════════════════════════════════════════
    // ADMIN KEUANGAN ROUTES
    // ═════════════════════════════════════════
    Route::prefix('admin/keuangan')->middleware('role:admin_keuangan')->group(function () {

        // List & Detail Pembayaran
        Route::get('/pembayaran', [PaymentController::class, 'index']);
        Route::get('/pembayaran/{id}', [PaymentController::class, 'show']);

        // ✅ CORE: Verifikasi & Reject Pembayaran
        Route::post('/pembayaran/{id}/verify', [PaymentController::class, 'verifyPayment']);
        Route::post('/pembayaran/{id}/reject', [PaymentController::class, 'rejectPayment']);

        // Laporan
        Route::get('/laporan/pendapatan', [PaymentController::class, 'laporanPendapatan']);
    });

    // ═════════════════════════════════════════
    // ADMIN PERLENGKAPAN ROUTES
    // ═════════════════════════════════════════
    Route::prefix('admin/perlengkapan')->middleware('role:admin_perlengkapan')->group(function () {

        // Master Inventory CRUD
        Route::get('/master', [EquipmentController::class, 'index']);
        Route::post('/master', [EquipmentController::class, 'store']);
        Route::put('/master/{id}', [EquipmentController::class, 'update']);
        Route::delete('/master/{id}', [EquipmentController::class, 'destroy']);

        // Distribusi Perlengkapan
        Route::get('/distribusi', [EquipmentController::class, 'distribusiList']);

        // ✅ CORE: Handover Equipment
        Route::post('/distribusi/{id}/handover', [EquipmentController::class, 'handoverEquipment']);
        Route::post('/distribusi/batch-handover', [EquipmentController::class, 'batchHandover']);

        // Laporan Stok
        Route::get('/laporan/stok', [EquipmentController::class, 'laporanStok']);
    });

    // ═════════════════════════════════════════
    // MASTER DATA ROUTES (Multi-role)
    // ═════════════════════════════════════════
    $masterData = \App\Http\Controllers\Api\MasterDataController::class;

    Route::prefix('admin/travel')->middleware('role:admin_travel')->group(function () use ($masterData) {
        // Maskapai
        Route::get('/maskapai', [$masterData, 'maskapaiIndex']);
        Route::post('/maskapai', [$masterData, 'maskapaiStore']);
        Route::put('/maskapai/{id}', [$masterData, 'maskapaiUpdate']);
        Route::delete('/maskapai/{id}', [$masterData, 'maskapaiDestroy']);

        // Hotel
        Route::get('/hotel', [$masterData, 'hotelIndex']);
        Route::post('/hotel', [$masterData, 'hotelStore']);
        Route::put('/hotel/{id}', [$masterData, 'hotelUpdate']);
        Route::delete('/hotel/{id}', [$masterData, 'hotelDestroy']);

        // Agent
        Route::get('/agent', [$masterData, 'agentIndex']);
        Route::post('/agent', [$masterData, 'agentStore']);
        Route::put('/agent/{id}', [$masterData, 'agentUpdate']);
        Route::delete('/agent/{id}', [$masterData, 'agentDestroy']);

        // Karyawan
        Route::get('/karyawan', [$masterData, 'karyawanIndex']);
        Route::post('/karyawan', [$masterData, 'karyawanStore']);
        Route::put('/karyawan/{id}', [$masterData, 'karyawanUpdate']);
        Route::delete('/karyawan/{id}', [$masterData, 'karyawanDestroy']);

        // Mitra
        Route::get('/mitra', [$masterData, 'mitraIndex']);
        Route::post('/mitra', [$masterData, 'mitraStore']);
        Route::put('/mitra/{id}', [$masterData, 'mitraUpdate']);
        Route::delete('/mitra/{id}', [$masterData, 'mitraDestroy']);

        // Layanan
        Route::get('/layanan', [$masterData, 'layananIndex']);
        Route::post('/layanan', [$masterData, 'layananStore']);
        Route::put('/layanan/{id}', [$masterData, 'layananUpdate']);
        Route::delete('/layanan/{id}', [$masterData, 'layananDestroy']);
    });

    // Keuangan — Pengeluaran, Pemasukan, Bonus, Laporan
    Route::prefix('admin/keuangan')->middleware('role:admin_keuangan')->group(function () use ($masterData) {
        Route::get('/pengeluaran', [$masterData, 'pengeluaranIndex']);
        Route::post('/pengeluaran', [$masterData, 'pengeluaranStore']);
        Route::put('/pengeluaran/{id}', [$masterData, 'pengeluaranUpdate']);
        Route::delete('/pengeluaran/{id}', [$masterData, 'pengeluaranDestroy']);

        Route::get('/pemasukan', [$masterData, 'pemasukanIndex']);
        Route::post('/pemasukan', [$masterData, 'pemasukanStore']);
        Route::delete('/pemasukan/{id}', [$masterData, 'pemasukanDestroy']);

        Route::get('/bonus-agent', [$masterData, 'bonusIndex']);
        Route::post('/bonus-agent/{id}/bayar', [$masterData, 'bayarBonus']);

        Route::get('/laporan/keuangan', [$masterData, 'laporanKeuangan']);
    });
});
