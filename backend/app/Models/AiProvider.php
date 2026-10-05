<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiProvider extends Model
{
    protected $fillable = [
        'code', 'name', 'driver', 'base_url', 'credentials', 'timeout_seconds',
        'max_retries', 'verify_tls', 'allow_private_network', 'is_active',
        'health_status', 'health_checked_at', 'health_message', 'metadata',
    ];

    protected $hidden = ['credentials'];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
            'verify_tls' => 'boolean',
            'allow_private_network' => 'boolean',
            'is_active' => 'boolean',
            'health_checked_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function models(): HasMany
    {
        return $this->hasMany(AiModel::class);
    }
}
