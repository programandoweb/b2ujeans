<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CatalogItem extends Model {
 protected $fillable=['category_id','type','name','reference','slug','short_description','description','specifications','gallery','applications','status','commercial_price','price_currency','price_unit','seo_title','seo_description','og_image','whatsapp_message','legacy_source_url','legacy_meta','legacy_raw_html','legacy_research_status','legacy_research_error','legacy_researched_at','published_at'];
 protected $casts=['specifications'=>'array','gallery'=>'array','published_at'=>'datetime','commercial_price'=>'decimal:2','legacy_meta'=>'array','legacy_researched_at'=>'datetime'];
 protected $appends=['public_url'];
 public function category():BelongsTo{return $this->belongsTo(CatalogCategory::class,'category_id');}
 public function getPublicUrlAttribute():string{return $this->type==='service'?"/2019/servicios/{$this->slug}":"/2019/productos/{$this->slug}";}
}
