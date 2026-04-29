<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL DISTRIBUSI_PERLENGKAPAN (LOGIKA INTEGRASI)
     * =====================================================
     * Menghubungkan booking jamaah dengan barang perlengkapan.
     * Record di-generate otomatis saat pembayaran di-verify
     * (lihat PaymentController@verifyPayment).
     *
     * Admin Perlengkapan mengubah status menjadi 'diserahkan'
     * saat barang sudah diberikan ke jamaah.
     */
    public function up(): void
    {
        Schema::create('distribusi_perlengkapan', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                  ->constrained('bookings')
                  ->onDelete('cascade');

            $table->foreignId('perlengkapan_id')
                  ->constrained('master_perlengkapan')
                  ->onDelete('cascade');

            $table->unsignedInteger('jumlah')->default(1);

            // Status penyerahan barang
            $table->enum('status_penyerahan', [
                'pending',       // Belum diserahkan
                'diserahkan',    // Sudah diserahkan langsung
                'dikirim'        // Dikirim via ekspedisi
            ])->default('pending')->index();

            $table->timestamp('tgl_penyerahan')->nullable();

            // Admin perlengkapan yang menyerahkan
            $table->foreignId('distributed_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->text('catatan')->nullable();
            $table->timestamps();

            // Prevent duplicate distribusi per booking per barang
            $table->unique(
                ['booking_id', 'perlengkapan_id'],
                'unique_distribusi_per_booking'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribusi_perlengkapan');
    }
};
