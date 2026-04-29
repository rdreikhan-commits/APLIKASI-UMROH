<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MasterPerlengkapan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'master_perlengkapan';

    protected $fillable = [
        'nama_barang', 'kode_barang', 'deskripsi', 'satuan',
        'stok_gudang', 'stok_minimum', 'is_active',
    ];

    protected $casts = [
        'stok_gudang'  => 'integer',
        'stok_minimum' => 'integer',
        'is_active'    => 'boolean',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Barang ini didistribusikan ke banyak booking.
     * MasterPerlengkapan → hasMany → DistribusiPerlengkapan
     */
    public function distribusi()
    {
        return $this->hasMany(DistribusiPerlengkapan::class, 'perlengkapan_id');
    }

    /**
     * Booking-booking yang menerima barang ini.
     * MasterPerlengkapan → belongsToMany → Booking (via distribusi_perlengkapan)
     */
    public function bookings()
    {
        return $this->belongsToMany(Booking::class, 'distribusi_perlengkapan', 'perlengkapan_id', 'booking_id')
                    ->withPivot('jumlah', 'status_penyerahan', 'tgl_penyerahan')
                    ->withTimestamps();
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: barang yang stoknya di bawah minimum (perlu restock).
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stok_gudang', '<=', 'stok_minimum');
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    /**
     * Cek apakah stok cukup untuk distribusi.
     */
    public function hasStock(int $quantity = 1): bool
    {
        return $this->stok_gudang >= $quantity;
    }

    /**
     * Cek apakah stok sudah di bawah minimum.
     */
    public function isLowStock(): bool
    {
        return $this->stok_gudang <= $this->stok_minimum;
    }
}
