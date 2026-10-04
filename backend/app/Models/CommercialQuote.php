<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommercialQuote extends Model
{
    protected $fillable = ['lead_id', 'number', 'status', 'currency', 'subtotal', 'total', 'notes', 'created_by_agent'];

    protected function casts(): array
    {
        return ['subtotal' => 'decimal:2', 'total' => 'decimal:2'];
    }

    public function lead(): BelongsTo { return $this->belongsTo(CommercialLead::class, 'lead_id'); }
    public function items(): HasMany { return $this->hasMany(CommercialQuoteItem::class, 'quote_id'); }
}
