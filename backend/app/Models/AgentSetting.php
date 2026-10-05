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
        'primary_ai_model_id',
        'fallback_ai_model_id',
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

    public function primaryAiModel()
    {
        return $this->belongsTo(AiModel::class, 'primary_ai_model_id');
    }

    public function fallbackAiModel()
    {
        return $this->belongsTo(AiModel::class, 'fallback_ai_model_id');
    }
}
