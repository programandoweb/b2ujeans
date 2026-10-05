<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentInteraction extends Model
{
    protected $fillable = [
        'agent_id',
        'request_id',
        'question',
        'answer',
        'status',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return ['duration_ms' => 'integer'];
    }
}
