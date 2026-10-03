<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CatalogItem extends Model {
 protected $fillable=['category_id','type','name','reference','slug','short_description','description','specifications','gallery','applications','status','seo_title','seo_description','og_image','whatsapp_message','published_at'];
 protected $casts=['specifications'=>'array','gallery'=>'array','published_at'=>'datetime'];
 protected $appends=['public_url'];
 public function category():BelongsTo{return $this->belongsTo(CatalogCategory::class,'category_id');}
 public function getPublicUrlAttribute():string{return $this->type==='service'?"/2019/servicios/{$this->slug}":"/2019/productos/{$this->slug}";}
}