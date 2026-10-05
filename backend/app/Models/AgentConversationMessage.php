<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentConversationMessage extends Model
{
    protected $fillable = ['session_id', 'role', 'content', 'request_id'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AgentConversationSession::class, 'session_id');
    }
}
