<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunicationProvider extends Model
{
    protected $fillable = [
        'name',
        'channel',
        'driver',
        'is_fallback',
        'priority',
        'auto_connect',
        'enabled',
        'settings',
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'is_fallback' => 'boolean',
            'priority' => 'integer',
            'auto_connect' => 'boolean',
            'enabled' => 'boolean',
            'settings' => 'array',
            'credentials' => 'encrypted:array',
        ];
    }
}
