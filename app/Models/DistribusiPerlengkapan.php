<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistribusiPerlengkapan extends Model
{
    use HasFactory;

    protected $table = 'distribusi_perlengkapan';

    protected $fillable = [
        'booking_id', 'perlengkapan_id', 'jumlah',
        'status_penyerahan', 'tgl_penyerahan', 'distributed_by', 'catatan',
    ];

    protected $casts = [
        'tgl_penyerahan' => 'datetime',
        'jumlah'         => 'integer',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Distribusi milik satu booking.
     * DistribusiPerlengkapan → belongsTo → Booking
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Distribusi merujuk ke satu barang.
     * DistribusiPerlengkapan → belongsTo → MasterPerlengkapan
     */
    public function perlengkapan()
    {
        return $this->belongsTo(MasterPerlengkapan::class, 'perlengkapan_id');
    }

    /**
     * Siapa admin yang menyerahkan barang.
     * DistribusiPerlengkapan → belongsTo → User (admin_perlengkapan)
     */
    public function distributor()
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status_penyerahan', 'pending');
    }

    public function scopeDiserahkan($query)
    {
        return $query->where('status_penyerahan', 'diserahkan');
    }

    public function scopeDikirim($query)
    {
        return $query->where('status_penyerahan', 'dikirim');
    }

    /**
     * Scope: distribusi untuk jadwal tertentu (untuk laporan per kloter).
     */
    public function scopeByJadwal($query, int $jadwalId)
    {
        return $query->whereHas('booking', function ($q) use ($jadwalId) {
            $q->where('jadwal_id', $jadwalId);
        });
    }
}
