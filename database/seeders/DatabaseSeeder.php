<?php

namespace Database\Seeders;

use App\Models\MasterPerlengkapan;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * =====================================================
 * DATABASE SEEDER
 * =====================================================
 * Seed data awal untuk development & testing:
 * - 4 User (1 per role)
 * - 5 Barang perlengkapan default
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── USERS ──
        // Password: password123
        User::create([
            'role'     => 'jamaah',
            'nama'     => 'Ahmad Jamaluddin',
            'email'    => 'jamaah@example.com',
            'password' => 'password123',
            'nik'      => '3201010101010001',
            'no_hp'    => '081234567890',
        ]);

        User::create([
            'role'  => 'admin_travel',
            'nama'  => 'Admin Travel',
            'email' => 'travel@admin.com',
            'password' => 'password123',
        ]);

        User::create([
            'role'  => 'admin_keuangan',
            'nama'  => 'Admin Keuangan',
            'email' => 'keuangan@admin.com',
            'password' => 'password123',
        ]);

        User::create([
            'role'  => 'admin_perlengkapan',
            'nama'  => 'Admin Perlengkapan',
            'email' => 'perlengkapan@admin.com',
            'password' => 'password123',
        ]);

        // ── MASTER PERLENGKAPAN ──
        $perlengkapan = [
            ['nama_barang' => 'Koper Umroh',       'kode_barang' => 'BRG-KOPER',    'stok_gudang' => 100, 'satuan' => 'pcs',   'stok_minimum' => 20],
            ['nama_barang' => 'Kain Ihram',         'kode_barang' => 'BRG-IHRAM',    'stok_gudang' => 150, 'satuan' => 'set',   'stok_minimum' => 30],
            ['nama_barang' => 'Mukena',             'kode_barang' => 'BRG-MUKENA',   'stok_gudang' => 80,  'satuan' => 'pcs',   'stok_minimum' => 15],
            ['nama_barang' => 'Buku Doa & Manasik', 'kode_barang' => 'BRG-BUKUDOA',  'stok_gudang' => 200, 'satuan' => 'pcs',   'stok_minimum' => 40],
            ['nama_barang' => 'Seragam Jamaah',     'kode_barang' => 'BRG-SERAGAM',  'stok_gudang' => 120, 'satuan' => 'pcs',   'stok_minimum' => 25],
        ];

        foreach ($perlengkapan as $item) {
            MasterPerlengkapan::create($item);
        }

        // ── KODE JAMAAH ──
        \App\Models\User::where('role', 'jamaah')->get()->each(function ($u, $i) {
            $u->update(['kode_jamaah' => 'J-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT)]);
        });

        // ── MASKAPAI ──
        foreach ([
            ['kode_maskapai' => 'GA', 'nama_maskapai' => 'Garuda Indonesia'],
            ['kode_maskapai' => 'SV', 'nama_maskapai' => 'Saudi Airlines'],
            ['kode_maskapai' => 'SQ', 'nama_maskapai' => 'Singapore Airlines'],
        ] as $m) { \App\Models\Maskapai::create($m); }

        // ── HOTEL ──
        foreach ([
            ['nama_hotel' => 'Hilton Makkah Convention', 'kota' => 'makkah', 'rating' => '5', 'jarak_ke_masjid' => '200m'],
            ['nama_hotel' => 'Pullman ZamZam Makkah', 'kota' => 'makkah', 'rating' => '5', 'jarak_ke_masjid' => '100m'],
            ['nama_hotel' => 'Oberoi Madinah', 'kota' => 'madinah', 'rating' => '5', 'jarak_ke_masjid' => '300m'],
            ['nama_hotel' => 'Shaza Madinah', 'kota' => 'madinah', 'rating' => '4', 'jarak_ke_masjid' => '500m'],
        ] as $h) { \App\Models\Hotel::create($h); }

        // ── AGENT ──
        \App\Models\Agent::create([
            'kode_agent' => 'A-00001', 'nama_agent' => 'RAIHAN', 'no_hp' => '081299887766',
            'tipe_bonus' => 'nominal', 'nominal_bonus_per_jamaah' => 2000000, 'alamat' => 'Jakarta',
        ]);

        // ── KARYAWAN ──
        \App\Models\Karyawan::create([
            'kode_karyawan' => 'K-00001', 'nama' => 'Siti Nurhaliza', 'jabatan' => 'CS Officer',
            'departemen' => 'operasional', 'no_hp' => '081366778899', 'gaji' => 5000000,
            'tanggal_masuk' => '2025-01-15',
        ]);

        // ── MITRA ──
        foreach ([
            ['nama_mitra' => 'Nusantara Handling', 'jenis' => 'handling', 'kontak' => '+966 555 0001'],
            ['nama_mitra' => 'Madinah Bus Service', 'jenis' => 'bus', 'kontak' => '+966 555 0002'],
        ] as $m) { \App\Models\Mitra::create($m); }

        // ── LAYANAN ──
        foreach ([
            ['nama_layanan' => 'Upgrade Kursi (Business)', 'harga' => 5000000, 'deskripsi' => 'Upgrade ke business class'],
            ['nama_layanan' => 'Handling VIP Bandara', 'harga' => 1500000, 'deskripsi' => 'Fast track + lounge'],
            ['nama_layanan' => 'Ziarah Tambahan', 'harga' => 2000000, 'deskripsi' => 'City tour Thaif + ziarah'],
        ] as $l) { \App\Models\Layanan::create($l); }

        $this->command->info('✅ Seeder berhasil! 4 user + 5 perlengkapan + master data lengkap telah dibuat.');
    }
}
