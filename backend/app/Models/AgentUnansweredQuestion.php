<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentUnansweredQuestion extends Model
{
    protected $fillable = [
        'agent_id',
        'question',
        'normalized_hash',
        'times_asked',
        'status',
        'resolution',
        'knowledge_entry_id',
        'last_asked_at',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'last_asked_at' => 'datetime',
            'resolved_at' => 'datetime',
            'times_asked' => 'integer',
        ];
    }

    public function knowledgeEntry(): BelongsTo
    {
        return $this->belongsTo(AgentKnowledgeEntry::class, 'knowledge_entry_id');
    }
}
