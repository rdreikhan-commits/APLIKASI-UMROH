<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL JADWAL
     * =====================================================
     * Jadwal keberangkatan per paket. Mengelola kuota.
     * kuota_total = kapasitas awal saat dibuat.
     * sisa_kuota = kapasitas tersisa (di-decrement saat booking confirmed).
     *
     * ⚠️ CONCURRENCY NOTE:
     * sisa_kuota harus di-update menggunakan atomic decrement
     * dalam DB Transaction untuk mencegah race condition
     * (2 jamaah booking di waktu bersamaan → overbooking).
     */
    public function up(): void
    {
        Schema::create('jadwal', function (Blueprint $table) {
            $table->id();

            $table->foreignId('paket_id')
                  ->constrained('paket_umroh')
                  ->onDelete('cascade');

            $table->string('kode_jadwal', 30)->unique();   // e.g. JDW-2026-06-A
            $table->date('tanggal_berangkat');
            $table->date('tanggal_pulang');
            $table->string('kota_keberangkatan', 100)->default('Jakarta');

            // Kuota management
            $table->unsignedInteger('kuota_total');
            $table->unsignedInteger('sisa_kuota');          // = kuota_total saat create

            $table->enum('status', [
                'upcoming',      // Belum berangkat
                'open',          // Pendaftaran dibuka
                'closed',        // Kuota penuh / ditutup manual
                'departed',      // Sudah berangkat
                'completed'      // Sudah pulang
            ])->default('open')->index();

            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index untuk query katalog
            $table->index(['tanggal_berangkat', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal');
    }
};
