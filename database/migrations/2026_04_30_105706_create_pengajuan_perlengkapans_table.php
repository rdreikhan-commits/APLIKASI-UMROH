<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_perlengkapans', function (Blueprint $table) {
            $table->id();
            $table->string('jenis_barang');
            $table->integer('qty');
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('total_harga', 15, 2);
            $table->enum('status', ['pending', 'acc_manager', 'dicairkan', 'diambil'])->default('pending');
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_perlengkapans');
    }
};
