<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'role', 'nik', 'no_paspor', 'nama', 'email', 'password', 'no_hp',
        'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'alamat',
        'foto_ktp_path', 'foto_paspor_path', 'foto_buku_nikah_path',
        'status_dokumen',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'password'      => 'hashed', // Auto-hash pada Laravel 10+
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Jamaah memiliki banyak booking.
     * User (role: jamaah) → hasMany → Booking
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Admin Keuangan memverifikasi banyak pembayaran.
     * User (role: admin_keuangan) → hasMany → Pembayaran (via verified_by)
     */
    public function verifiedPayments()
    {
        return $this->hasMany(Pembayaran::class, 'verified_by');
    }

    /**
     * Admin Perlengkapan mendistribusikan banyak barang.
     * User (role: admin_perlengkapan) → hasMany → DistribusiPerlengkapan (via distributed_by)
     */
    public function distributedItems()
    {
        return $this->hasMany(DistribusiPerlengkapan::class, 'distributed_by');
    }

    /**
     * Jamaah bisa mengakses jadwal melalui booking (Many-to-Many via bookings).
     * User → belongsToMany → Jadwal (melalui tabel bookings)
     */
    public function jadwalDiikuti()
    {
        return $this->belongsToMany(Jadwal::class, 'bookings', 'user_id', 'jadwal_id')
                    ->withPivot('kode_booking', 'status', 'status_dokumen', 'total_harga', 'total_dibayar')
                    ->withTimestamps();
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    public function isJamaah(): bool
    {
        return $this->role === 'jamaah';
    }

    public function isAdminTravel(): bool
    {
        return $this->role === 'admin_travel';
    }

    public function isAdminKeuangan(): bool
    {
        return $this->role === 'admin_keuangan';
    }

    public function isAdminPerlengkapan(): bool
    {
        return $this->role === 'admin_perlengkapan';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin_travel', 'admin_keuangan', 'admin_perlengkapan']);
    }
}
