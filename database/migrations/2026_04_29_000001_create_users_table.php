<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =====================================================
     * TABEL USERS
     * =====================================================
     * Tabel utama untuk autentikasi dan identitas semua aktor.
     * Role menentukan hak akses: jamaah, admin_travel,
     * admin_keuangan, admin_perlengkapan.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Role-based access control
            $table->enum('role', [
                'jamaah',
                'admin_travel',
                'admin_keuangan',
                'admin_perlengkapan'
            ])->default('jamaah')->index();

            // Data identitas
            $table->string('nik', 16)->nullable()->unique();
            $table->string('no_paspor', 20)->nullable()->unique();
            $table->string('nama', 150);
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->string('no_hp', 20)->nullable();

            // Profiling & dokumen
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->text('alamat')->nullable();

            // Upload paths dokumen jamaah
            $table->string('foto_ktp_path')->nullable();
            $table->string('foto_paspor_path')->nullable();
            $table->string('foto_buku_nikah_path')->nullable();

            // Status dokumen jamaah (diverifikasi oleh admin_travel)
            $table->enum('status_dokumen', [
                'incomplete',     // Belum lengkap
                'review',         // Sedang direview admin
                'valid',          // Sudah disetujui
                'rejected'        // Ditolak, perlu upload ulang
            ])->default('incomplete');

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabel untuk password reset (Laravel default requirement)
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabel sessions (diperlukan untuk session driver: database)
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
