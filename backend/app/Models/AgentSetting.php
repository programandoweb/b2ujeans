<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentSetting extends Model
{
    protected $fillable = [
        'agent_id',
        'provider',
        'api_key',
        'model',
    ];

    protected $hidden = [
        'api_key',
    ];

    protected function casts(): array
    {
        return [
            'api_key' => 'encrypted',
        ];
    }
}
