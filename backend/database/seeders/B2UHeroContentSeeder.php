<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class B2UHeroContentSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'sort_order' => 0,
                'image_url' => 'https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg',
                'background_position' => 'center',
                'eyebrow' => 'B2U Jeans · Tienda en Línea',
                'title' => 'Nueva',
                'accent' => 'Colección',
                'description' => 'Descubre la nueva colección B2U Jeans y encuentra denim, siluetas y estilos creados para acompañar a la mujer venezolana.',
                'primary_label' => 'Ver nueva colección',
                'primary_href' => '/productos',
                'secondary_label' => 'Explorar categorías',
                'secondary_href' => '/productos',
                'cards' => [
                    ['title' => 'Mom Jeans', 'text' => 'Un clásico imprescindible de B2U.'],
                    ['title' => 'Wide Leg', 'text' => 'Silueta amplia, actual y versátil.'],
                    ['title' => 'Flared Jeans', 'text' => 'Denim con una silueta icónica.'],
                ],
            ],
            [
                'sort_order' => 1,
                'image_url' => 'https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_yuh0d4yuh0d4yuh0-1.jpg',
                'background_position' => 'center',
                'eyebrow' => 'B2U Jeans · Venezuela desde 2015',
                'title' => 'La prenda perfecta para',
                'accent' => 'la mujer venezolana.',
                'description' => 'B2U Jeans nació en Venezuela en 2015 con la visión de crear denim con identidad propia y demostrar que el talento local puede competir con estándares globales.',
                'primary_label' => 'Descubrir B2U',
                'primary_href' => '/productos',
                'secondary_label' => 'Hablar por WhatsApp',
                'secondary_href' => 'https://wa.me/584123694856',
                'cards' => [
                    ['title' => 'Hecho para ti', 'text' => 'Siluetas pensadas para la mujer venezolana.'],
                    ['title' => 'Identidad B2U', 'text' => 'Diseño, actitud y estilo propio.'],
                    ['title' => 'Desde 2015', 'text' => 'Una marca venezolana con visión global.'],
                ],
            ],
            [
                'sort_order' => 2,
                'image_url' => 'https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg',
                'background_position' => 'center 35%',
                'eyebrow' => 'B2U Jeans · Categorías',
                'title' => 'Encuentra tu',
                'accent' => 'fit favorito.',
                'description' => 'Explora Mom Jeans, Palazzo, Skinny, Cargo, Flared, Corte Recto, Top de Jeans, Wide Leg y más estilos disponibles en B2U.',
                'primary_label' => 'Explorar productos',
                'primary_href' => '/productos',
                'secondary_label' => 'Atención por WhatsApp',
                'secondary_href' => 'https://wa.me/584123694856',
                'cards' => [
                    ['title' => 'Cargo Jeans', 'text' => 'Actitud urbana y funcionalidad.'],
                    ['title' => 'Palazzo Jeans', 'text' => 'Movimiento y amplitud en denim.'],
                    ['title' => 'Corte Recto', 'text' => 'Una silueta limpia y atemporal.'],
                ],
            ],
        ];

        foreach ($slides as $slideData) {
            $slide = HeroSlide::query()
                ->where('section_key', 'home.hero')
                ->where('option', 2)
                ->where('sort_order', $slideData['sort_order'])
                ->first();

            if (! $slide) {
                $slide = HeroSlide::create([
                    'section_key' => 'home.hero',
                    'option' => 2,
                    'sort_order' => $slideData['sort_order'],
                    'is_active' => true,
                    'interval_ms' => 3000,
                    ...$slideData,
                ]);

                continue;
            }

            $slide->update([
                ...$slideData,
                'is_active' => true,
                'interval_ms' => $slide->interval_ms ?: 3000,
            ]);
        }

        HeroSlide::query()
            ->where('section_key', 'home.hero')
            ->where('option', 2)
            ->whereNotIn('sort_order', [0, 1, 2])
            ->update(['is_active' => false]);
    }
}
