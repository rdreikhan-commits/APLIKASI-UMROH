<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL PEMBAYARAN
     * =====================================================
     * Mencatat setiap transaksi pembayaran dari jamaah.
     * Satu booking bisa memiliki BANYAK pembayaran
     * (DP + cicilan + pelunasan).
     *
     * Dikelola oleh Admin Keuangan.
     * Proses verifikasi ada di PaymentController@verifyPayment.
     */
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                  ->constrained('bookings')
                  ->onDelete('cascade');

            // Jenis pembayaran
            $table->enum('jenis_pembayaran', [
                'dp',        // Down Payment
                'cicilan',   // Pembayaran cicilan
                'lunas'      // Pelunasan
            ]);

            $table->decimal('nominal', 15, 2);
            $table->string('bukti_transfer_path');          // Upload bukti transfer
            $table->text('keterangan')->nullable();         // Catatan tambahan

            // Status verifikasi oleh admin keuangan
            $table->enum('status_pembayaran', [
                'pending',     // Menunggu verifikasi
                'verified',    // Sudah diverifikasi & valid
                'rejected'     // Ditolak (bukti tidak valid)
            ])->default('pending')->index();

            $table->text('alasan_reject')->nullable();      // Alasan jika ditolak

            // Siapa admin keuangan yang memverifikasi
            $table->foreignId('verified_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();   // Waktu verifikasi
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
