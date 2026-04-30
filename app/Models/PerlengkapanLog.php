<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerlengkapanLog extends Model
{
    use HasFactory;
    
    protected $fillable = ['perlengkapan_id', 'jenis_log', 'qty', 'catatan'];

    public function perlengkapan()
    {
        return $this->belongsTo(MasterPerlengkapan::class, 'perlengkapan_id');
    }
}
