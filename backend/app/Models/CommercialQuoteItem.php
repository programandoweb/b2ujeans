<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommercialQuoteItem extends Model
{
    protected $fillable = ['quote_id', 'catalog_item_id', 'description', 'quantity', 'unit_price', 'line_total'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:2', 'unit_price' => 'decimal:2', 'line_total' => 'decimal:2'];
    }

    public function quote(): BelongsTo { return $this->belongsTo(CommercialQuote::class, 'quote_id'); }
}
