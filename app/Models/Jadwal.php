<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Jadwal extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jadwal';

    protected $fillable = [
        'paket_id', 'kode_jadwal', 'tanggal_berangkat', 'tanggal_pulang',
        'kota_keberangkatan', 'kuota_total', 'sisa_kuota', 'status', 'catatan',
    ];

    protected $casts = [
        'tanggal_berangkat' => 'date',
        'tanggal_pulang'    => 'date',
        'kuota_total'       => 'integer',
        'sisa_kuota'        => 'integer',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Jadwal milik satu paket umroh.
     * Jadwal → belongsTo → PaketUmroh
     */
    public function paket()
    {
        return $this->belongsTo(PaketUmroh::class, 'paket_id');
    }

    /**
     * Satu jadwal bisa memiliki banyak booking.
     * Jadwal → hasMany → Booking
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'jadwal_id');
    }

    /**
     * Jamaah yang terdaftar di jadwal ini (Many-to-Many via bookings).
     * Jadwal → belongsToMany → User (jamaah)
     */
    public function jamaahTerdaftar()
    {
        return $this->belongsToMany(User::class, 'bookings', 'jadwal_id', 'user_id')
                    ->withPivot('kode_booking', 'status', 'status_dokumen', 'total_harga')
                    ->withTimestamps();
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    /**
     * Scope: jadwal yang masih buka pendaftaran.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope: jadwal yang masih ada kuota.
     */
    public function scopeAvailable($query)
    {
        return $query->open()->where('sisa_kuota', '>', 0);
    }

    /**
     * Scope: jadwal yang akan datang (belum berangkat).
     */
    public function scopeUpcoming($query)
    {
        return $query->where('tanggal_berangkat', '>=', now()->toDateString());
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    /**
     * Cek apakah kuota masih tersedia.
     */
    public function hasAvailableQuota(): bool
    {
        return $this->sisa_kuota > 0 && $this->status === 'open';
    }

    /**
     * Hitung jumlah jamaah yang sudah confirmed.
     */
    public function confirmedBookingsCount(): int
    {
        return $this->bookings()->where('status', 'confirmed')->count();
    }
}
