<?php
namespace App\Http\Requests\Catalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class CatalogItemRequest extends FormRequest {
 public function authorize():bool{return true;}
 public function rules():array{
  $item=$this->route('catalogItem');
  return [
   'category_id'=>['nullable','integer','exists:catalog_categories,id'],
   'type'=>['required',Rule::in(['product','service'])],
   'name'=>['required','string','max:190'],
   'reference'=>['nullable','string','max:120'],
   'slug'=>['required','string','max:210',Rule::unique('catalog_items','slug')->ignore($item?->id)],
   'short_description'=>['nullable','string'],
   'description'=>['nullable','string'],
   'specifications'=>['nullable','array'],
   'gallery'=>['nullable','array'],
   'applications'=>['nullable','string'],
   'status'=>['required',Rule::in(['draft','published','archived'])],
   'seo_title'=>['nullable','string','max:190'],
   'seo_description'=>['nullable','string'],
   'og_image'=>['nullable','string','max:2048'],
   'whatsapp_message'=>['nullable','string','max:500'],
   'published_at'=>['nullable','date'],
  ];
 }
}