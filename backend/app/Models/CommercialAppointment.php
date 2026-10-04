<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommercialAppointment extends Model
{
    protected $fillable = ['lead_id', 'scheduled_at', 'status', 'channel', 'notes', 'created_by_agent'];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime'];
    }

    public function lead(): BelongsTo { return $this->belongsTo(CommercialLead::class, 'lead_id'); }
}
