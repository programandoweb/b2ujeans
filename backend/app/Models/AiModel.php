<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiModel extends Model
{
    protected $fillable = [
        'ai_provider_id', 'code', 'name', 'model_identifier',
        'priority', 'capabilities', 'settings', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'capabilities' => 'array',
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(AiProvider::class);
    }
}
