<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Manasik extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'jadwal_id',
        'judul',
        'konten',
        'file_path',
        'urutan',
        'jadwal_detail',
    ];

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }
}
