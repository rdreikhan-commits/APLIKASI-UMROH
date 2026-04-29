<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembayaran extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pembayaran';

    protected $fillable = [
        'booking_id', 'jenis_pembayaran', 'nominal', 'bukti_transfer_path',
        'keterangan', 'status_pembayaran', 'alasan_reject', 'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'nominal'     => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Pembayaran milik satu booking.
     * Pembayaran → belongsTo → Booking
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    /**
     * Siapa admin keuangan yang memverifikasi.
     * Pembayaran → belongsTo → User (admin_keuangan)
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status_pembayaran', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status_pembayaran', 'verified');
    }

    public function scopeRejected($query)
    {
        return $query->where('status_pembayaran', 'rejected');
    }
}
