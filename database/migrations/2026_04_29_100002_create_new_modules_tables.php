<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Master Maskapai ──
        Schema::create('maskapai', function (Blueprint $table) {
            $table->id();
            $table->string('kode_maskapai', 10)->unique();
            $table->string('nama_maskapai', 100);
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Master Hotel ──
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('nama_hotel', 150);
            $table->enum('kota', ['makkah', 'madinah']);
            $table->enum('rating', ['3', '4', '5'])->default('4');
            $table->text('alamat')->nullable();
            $table->string('jarak_ke_masjid', 100)->nullable();
            $table->string('foto_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Agents ──
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kode_agent', 10)->unique();
            $table->string('nama_agent', 150);
            $table->string('no_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->decimal('persentase_bonus', 5, 2)->default(0);
            $table->decimal('nominal_bonus_per_jamaah', 15, 2)->default(0);
            $table->enum('tipe_bonus', ['persentase', 'nominal'])->default('nominal');
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Bonus Agent ──
        Schema::create('bonus_agent', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->decimal('nominal_bonus', 15, 2);
            $table->enum('status', ['pending', 'dibayar'])->default('pending');
            $table->datetime('tgl_bayar')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Tambah agent_id di bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('agent_id')->nullable()->after('jadwal_id')->constrained('agents')->nullOnDelete();
        });

        // ── Karyawan ──
        Schema::create('karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kode_karyawan', 10)->unique();
            $table->string('nama', 150);
            $table->string('jabatan', 100)->nullable();
            $table->enum('departemen', ['operasional', 'keuangan', 'marketing', 'gudang'])->default('operasional');
            $table->string('no_hp', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->decimal('gaji', 15, 2)->default(0);
            $table->date('tanggal_masuk')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });

        // ── Pengeluaran ──
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->nullable()->constrained('jadwal')->nullOnDelete();
            $table->enum('kategori', [
                'operasional', 'akomodasi', 'transportasi',
                'konsumsi', 'visa', 'handling', 'gaji', 'lainnya'
            ]);
            $table->string('deskripsi');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->string('bukti_path')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // ── Pemasukan ──
        Schema::create('pemasukan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->nullable()->constrained('jadwal')->nullOnDelete();
            $table->enum('sumber', ['pembayaran_jamaah', 'sponsor', 'lainnya']);
            $table->string('deskripsi');
            $table->decimal('nominal', 15, 2);
            $table->date('tanggal');
            $table->string('bukti_path')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // ── Mitra ──
        Schema::create('mitra', function (Blueprint $table) {
            $table->id();
            $table->string('nama_mitra', 150);
            $table->enum('jenis', ['bus', 'katering', 'handling', 'guide', 'lainnya']);
            $table->string('kontak', 50)->nullable();
            $table->text('alamat')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Layanan Tambahan ──
        Schema::create('layanan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_layanan', 150);
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 15, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Pivot: Booking ↔ Layanan ──
        Schema::create('booking_layanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('layanan_id')->constrained('layanan')->cascadeOnDelete();
            $table->integer('qty')->default(1);
            $table->decimal('harga_satuan', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_layanan');
        Schema::dropIfExists('layanan');
        Schema::dropIfExists('mitra');
        Schema::dropIfExists('pemasukan');
        Schema::dropIfExists('pengeluaran');
        Schema::dropIfExists('karyawan');
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['agent_id']);
            $table->dropColumn('agent_id');
        });
        Schema::dropIfExists('bonus_agent');
        Schema::dropIfExists('agents');
        Schema::dropIfExists('hotels');
        Schema::dropIfExists('maskapai');
    }
};
