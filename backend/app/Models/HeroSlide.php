<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'option',
        'sort_order',
        'is_active',
        'interval_ms',
        'image_url',
        'background_position',
        'eyebrow',
        'title',
        'accent',
        'description',
        'primary_label',
        'primary_href',
        'secondary_label',
        'secondary_href',
        'cards',
    ];

    protected $casts = [
        'option' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'interval_ms' => 'integer',
        'cards' => 'array',
    ];
}
