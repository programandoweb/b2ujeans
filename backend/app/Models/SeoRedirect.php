<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SeoRedirect extends Model {
 protected $fillable=['source_path','target_path','status_code','is_active','reason'];
 protected $casts=['status_code'=>'integer','is_active'=>'boolean'];
}