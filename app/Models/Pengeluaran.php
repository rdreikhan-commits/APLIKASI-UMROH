<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';
    protected $fillable = ['jadwal_id','kategori','deskripsi','nominal','tanggal','bukti_path','created_by'];
    protected $casts = ['nominal' => 'decimal:2', 'tanggal' => 'date'];

    public function jadwal() { return $this->belongsTo(Jadwal::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
