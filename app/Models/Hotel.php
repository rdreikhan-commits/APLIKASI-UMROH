<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $fillable = ['nama_hotel', 'kota', 'rating', 'alamat', 'jarak_ke_masjid', 'foto_path', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}
