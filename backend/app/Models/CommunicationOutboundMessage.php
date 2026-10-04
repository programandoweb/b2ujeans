<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunicationOutboundMessage extends Model
{
    protected $fillable = [
        'provider_id',
        'channel',
        'recipient',
        'subject',
        'body',
        'status',
        'attempts',
        'fallback_used',
        'external_message_id',
        'last_error',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'fallback_used' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }
}
