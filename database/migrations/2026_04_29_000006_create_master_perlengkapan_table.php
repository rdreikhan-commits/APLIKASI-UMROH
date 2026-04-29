<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL MASTER_PERLENGKAPAN
     * =====================================================
     * Master inventory barang perlengkapan umroh.
     * Dikelola oleh Admin Perlengkapan (CRUD stok).
     *
     * ⚠️ CONCURRENCY NOTE:
     * stok_gudang di-decrement secara atomic saat barang
     * diserahkan ke jamaah (handoverEquipment).
     */
    public function up(): void
    {
        Schema::create('master_perlengkapan', function (Blueprint $table) {
            $table->id();

            $table->string('nama_barang', 150);
            $table->string('kode_barang', 30)->unique();    // e.g. BRG-KOPER
            $table->text('deskripsi')->nullable();
            $table->string('satuan', 30)->default('pcs');   // pcs, set, pasang
            $table->unsignedInteger('stok_gudang')->default(0);
            $table->unsignedInteger('stok_minimum')->default(10); // Alert threshold

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_perlengkapan');
    }
};
