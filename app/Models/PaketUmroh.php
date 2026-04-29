<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaketUmroh extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'paket_umroh';

    protected $fillable = [
        'nama_paket', 'kode_paket', 'tipe', 'deskripsi',
        'durasi_hari', 'maskapai', 'hotel_madinah', 'hotel_makkah',
        'rating_hotel', 'harga', 'dp_minimum', 'fasilitas',
        'gambar_path', 'is_active',
    ];

    protected $casts = [
        'harga'       => 'decimal:2',
        'dp_minimum'  => 'decimal:2',
        'fasilitas'   => 'array',   // Auto JSON encode/decode
        'is_active'   => 'boolean',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Satu paket memiliki banyak jadwal keberangkatan.
     * PaketUmroh → hasMany → Jadwal
     */
    public function jadwal()
    {
        return $this->hasMany(Jadwal::class, 'paket_id');
    }

    /**
     * Melalui jadwal, paket bisa mengakses semua booking.
     * PaketUmroh → hasManyThrough → Booking (melalui Jadwal)
     */
    public function bookings()
    {
        return $this->hasManyThrough(Booking::class, Jadwal::class, 'paket_id', 'jadwal_id');
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    /**
     * Scope: hanya paket yang aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: paket yang masih ada jadwal tersedia (kuota > 0).
     */
    public function scopeAvailable($query)
    {
        return $query->active()
                     ->whereHas('jadwal', function ($q) {
                         $q->where('sisa_kuota', '>', 0)
                           ->where('status', 'open');
                     });
    }
}
