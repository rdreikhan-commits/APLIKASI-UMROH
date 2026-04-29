<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'kode_agent', 'nama_agent', 'no_hp', 'alamat',
        'persentase_bonus', 'nominal_bonus_per_jamaah', 'tipe_bonus', 'status'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function bookings() { return $this->hasMany(Booking::class); }
    public function bonuses() { return $this->hasMany(BonusAgent::class); }

    public function totalBonusPending()
    {
        return $this->bonuses()->where('status', 'pending')->sum('nominal_bonus');
    }

    public function totalBonusDibayar()
    {
        return $this->bonuses()->where('status', 'dibayar')->sum('nominal_bonus');
    }

    public function hitungBonus($hargaPaket)
    {
        if ($this->tipe_bonus === 'persentase') {
            return $hargaPaket * ($this->persentase_bonus / 100);
        }
        return $this->nominal_bonus_per_jamaah;
    }

    public static function generateKode()
    {
        $last = self::withTrashed()->orderBy('id', 'desc')->first();
        $num = $last ? intval(substr($last->kode_agent, 2)) + 1 : 1;
        return 'A-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}
