<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Layanan extends Model
{
    protected $table = 'layanan';
    protected $fillable = ['nama_layanan', 'deskripsi', 'harga', 'is_active'];
    protected $casts = ['harga' => 'decimal:2', 'is_active' => 'boolean'];

    public function bookings() { return $this->belongsToMany(Booking::class, 'booking_layanan')->withPivot('qty', 'harga_satuan')->withTimestamps(); }
}
