<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoBanner extends Model
{
    protected $fillable = [
        'title',
        'image_path',
        'is_active',
    ];
}
