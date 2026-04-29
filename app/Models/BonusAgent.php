<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonusAgent extends Model
{
    protected $table = 'bonus_agent';
    protected $fillable = ['agent_id', 'booking_id', 'nominal_bonus', 'status', 'tgl_bayar', 'paid_by'];
    protected $casts = ['tgl_bayar' => 'datetime', 'nominal_bonus' => 'decimal:2'];

    public function agent() { return $this->belongsTo(Agent::class); }
    public function booking() { return $this->belongsTo(Booking::class); }
    public function paidByUser() { return $this->belongsTo(User::class, 'paid_by'); }
}
