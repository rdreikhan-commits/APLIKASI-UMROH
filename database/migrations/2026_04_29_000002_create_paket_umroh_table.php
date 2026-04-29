<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL PAKET_UMROH
     * =====================================================
     * Master data paket umroh. Dikelola oleh Admin Travel.
     * Satu paket bisa memiliki banyak jadwal keberangkatan.
     */
    public function up(): void
    {
        Schema::create('paket_umroh', function (Blueprint $table) {
            $table->id();

            $table->string('nama_paket', 200);
            $table->string('kode_paket', 30)->unique();    // e.g. PKT-GOLD-2026
            $table->enum('tipe', ['reguler', 'vip', 'vvip'])->default('reguler');

            // Detail paket
            $table->text('deskripsi')->nullable();
            $table->integer('durasi_hari')->default(9);      // Durasi perjalanan
            $table->string('maskapai', 100)->nullable();
            $table->string('hotel_madinah', 150)->nullable();
            $table->string('hotel_makkah', 150)->nullable();
            $table->enum('rating_hotel', ['3', '4', '5'])->default('4');

            // Harga
            $table->decimal('harga', 15, 2);                 // Harga per jamaah
            $table->decimal('dp_minimum', 15, 2)->default(0); // DP minimum

            // Fasilitas & include
            $table->json('fasilitas')->nullable();            // Array fasilitas
            $table->string('gambar_path')->nullable();

            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paket_umroh');
    }
};
