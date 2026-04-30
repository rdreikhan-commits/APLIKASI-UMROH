<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perlengkapan_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perlengkapan_id')->constrained('master_perlengkapan')->cascadeOnDelete();
            $table->enum('jenis_log', ['masuk', 'keluar', 'rusak', 'hilang', 'pinjam']);
            $table->integer('qty');
            $table->string('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perlengkapan_logs');
    }
};
