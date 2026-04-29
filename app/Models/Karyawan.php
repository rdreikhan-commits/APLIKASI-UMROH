<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Karyawan extends Model
{
    use SoftDeletes;
    protected $table = 'karyawan';
    protected $fillable = ['user_id','kode_karyawan','nama','jabatan','departemen','no_hp','alamat','gaji','tanggal_masuk','status'];
    protected $casts = ['gaji' => 'decimal:2', 'tanggal_masuk' => 'date'];

    public function user() { return $this->belongsTo(User::class); }

    public static function generateKode()
    {
        $last = self::withTrashed()->orderBy('id', 'desc')->first();
        $num = $last ? intval(substr($last->kode_karyawan, 2)) + 1 : 1;
        return 'K-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}
