<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LegacyProductsSeeder extends Seeder
{
    public function run(): void
    {
        $files = glob(database_path('seeders/data/legacy_products/*.php')) ?: [];

        foreach ($files as $file) {
            $definition = require $file;

            $category = CatalogCategory::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                ['name' => $definition['name'], 'is_active' => true],
            );

            foreach ($definition['products'] as $product) {
                $slug = Str::slug($product['reference'].' '.$product['name']);

                CatalogItem::query()->firstOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'type' => 'product',
                        'name' => $product['reference'].': '.$product['name'],
                        'reference' => $product['reference'],
                        'status' => 'published',
                        'seo_title' => $product['reference'].': '.$product['name'],
                        'whatsapp_message' => 'Hola, quiero información sobre '.$product['reference'].': '.$product['name'].'.',
                        'published_at' => now(),
                    ],
                );
            }
        }
    }
}
