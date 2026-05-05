<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'image_path',
        'author_id',
        'is_published',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
