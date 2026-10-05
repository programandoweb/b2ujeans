<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppLoginCode extends Model
{
    protected $table = 'whatsapp_login_codes';

    protected $fillable = ['user_id', 'phone', 'code_hash', 'expires_at', 'attempts', 'used_at'];

    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
