<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanPerlengkapan extends Model
{
    use HasFactory;
    
    protected $fillable = ['jenis_barang', 'qty', 'harga_satuan', 'total_harga', 'status', 'catatan'];
}
