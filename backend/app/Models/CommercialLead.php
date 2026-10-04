<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommercialLead extends Model
{
    protected $fillable = ['name', 'email', 'whatsapp', 'source', 'status', 'notes', 'human_followup_at'];

    protected function casts(): array
    {
        return ['human_followup_at' => 'datetime'];
    }

    public function quotes(): HasMany { return $this->hasMany(CommercialQuote::class, 'lead_id'); }
    public function appointments(): HasMany { return $this->hasMany(CommercialAppointment::class, 'lead_id'); }
}
