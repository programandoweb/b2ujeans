<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentKnowledgeEntry extends Model
{
    protected $fillable = [
        'agent_id',
        'category',
        'title',
        'question',
        'answer',
        'keywords',
        'source_url',
        'source_type',
        'confidence',
        'status',
        'created_by_agent',
        'created_by',
    ];

    protected function casts(): array
    {
        return ['confidence' => 'integer'];
    }
}
