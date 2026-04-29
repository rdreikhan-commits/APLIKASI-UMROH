<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL BOOKINGS (TABEL PUSAT / JUNCTION)
     * =====================================================
     * Menghubungkan jamaah (users) dengan jadwal keberangkatan.
     * Status booking diubah oleh proses verifikasi pembayaran.
     *
     * Flow status:
     * pending → waiting_payment → confirmed → (departed)
     *                           ↘ cancelled
     *
     * ⚠️ INTEGRITY NOTE:
     * - kode_booking harus unique (auto-generated).
     * - Kombinasi user_id + jadwal_id harus unique
     *   (jamaah tidak boleh double-book di jadwal yang sama).
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->foreignId('jadwal_id')
                  ->constrained('jadwal')
                  ->onDelete('cascade');

            // Kode booking auto-generated (e.g. BKG-20260429-XXXX)
            $table->string('kode_booking', 30)->unique();

            // Status utama booking
            $table->enum('status', [
                'pending',            // Baru checkout, belum bayar
                'waiting_payment',    // Menunggu verifikasi pembayaran
                'confirmed',          // Pembayaran diterima, seat reserved
                'cancelled'           // Dibatalkan
            ])->default('pending')->index();

            // Status dokumen jamaah untuk booking ini
            $table->enum('status_dokumen', [
                'incomplete',         // Belum upload dokumen
                'review',             // Sudah upload, menunggu review
                'valid',              // Dokumen disetujui
                'rejected'            // Dokumen ditolak
            ])->default('incomplete')->index();

            // Total yang harus dibayar & sudah dibayar
            $table->decimal('total_harga', 15, 2);
            $table->decimal('total_dibayar', 15, 2)->default(0);

            $table->text('catatan_jamaah')->nullable();
            $table->text('catatan_admin')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Prevent double-booking
            $table->unique(['user_id', 'jadwal_id'], 'unique_booking_per_jadwal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
