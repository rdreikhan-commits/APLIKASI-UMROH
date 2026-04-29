<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maskapai extends Model
{
    protected $table = 'maskapai';
    protected $fillable = ['kode_maskapai', 'nama_maskapai', 'logo_path', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function paket() { return $this->hasMany(PaketUmroh::class); }
}
