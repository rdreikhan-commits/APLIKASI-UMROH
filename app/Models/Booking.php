<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bookings';

    protected $fillable = [
        'user_id', 'jadwal_id', 'agent_id', 'kode_booking', 'status', 'status_dokumen',
        'total_harga', 'total_dibayar', 'catatan_jamaah', 'catatan_admin',
    ];

    protected $casts = [
        'total_harga'   => 'decimal:2',
        'total_dibayar' => 'decimal:2',
    ];

    // ─────────────────────────────────────────────
    // BOOT (Auto-generate kode booking)
    // ─────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->kode_booking)) {
                // Format: BKG-YYYYMMDD-XXXX (random 4 huruf uppercase)
                $booking->kode_booking = 'BKG-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));
            }
        });
    }

    // ─────────────────────────────────────────────
    // RELATIONSHIPS
    // ─────────────────────────────────────────────

    /**
     * Booking milik satu jamaah.
     * Booking → belongsTo → User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Alias: Booking milik satu jamaah.
     */
    public function jamaah()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Booking milik satu jadwal.
     * Booking → belongsTo → Jadwal
     */
    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'jadwal_id');
    }

    /**
     * Satu booking bisa memiliki banyak pembayaran (DP + cicilan + lunas).
     * Booking → hasMany → Pembayaran
     */
    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'booking_id');
    }

    /**
     * Satu booking bisa memiliki banyak distribusi perlengkapan.
     * Booking → hasMany → DistribusiPerlengkapan
     */
    public function distribusiPerlengkapan()
    {
        return $this->hasMany(DistribusiPerlengkapan::class, 'booking_id');
    }

    /**
     * Barang-barang yang didistribusikan untuk booking ini.
     * Booking → belongsToMany → MasterPerlengkapan (via distribusi_perlengkapan)
     */
    public function perlengkapan()
    {
        return $this->belongsToMany(MasterPerlengkapan::class, 'distribusi_perlengkapan', 'booking_id', 'perlengkapan_id')
                    ->withPivot('jumlah', 'status_penyerahan', 'tgl_penyerahan', 'distributed_by')
                    ->withTimestamps();
    }

    /**
     * Booking melalui agent tertentu.
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Bonus agent dari booking ini.
     */
    public function bonusAgent()
    {
        return $this->hasOne(BonusAgent::class);
    }

    /**
     * Layanan tambahan yang diambil.
     */
    public function layanan()
    {
        return $this->belongsToMany(Layanan::class, 'booking_layanan')
                    ->withPivot('qty', 'harga_satuan')
                    ->withTimestamps();
    }

    // ─────────────────────────────────────────────
    // SCOPES
    // ─────────────────────────────────────────────

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeWaitingPayment($query)
    {
        return $query->where('status', 'waiting_payment');
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    /**
     * Hitung total pembayaran yang sudah terverifikasi.
     */
    public function totalVerifiedPayments(): float
    {
        return (float) $this->pembayaran()
            ->where('status_pembayaran', 'verified')
            ->sum('nominal');
    }

    /**
     * Cek apakah booking sudah lunas (total_dibayar >= total_harga).
     */
    public function isLunas(): bool
    {
        return $this->total_dibayar >= $this->total_harga;
    }

    /**
     * Cek apakah DP sudah terpenuhi.
     */
    public function isDpTerpenuhi(): bool
    {
        $dpMinimum = $this->jadwal?->paket?->dp_minimum ?? 0;
        return $this->total_dibayar >= $dpMinimum;
    }
}
