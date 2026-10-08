<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $legacyOne = 'https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg';
        $legacyTwo = 'https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_yuh0d4yuh0d4yuh0-1.jpg';
        $industrial = '/programandoweb/opengraph/home-opengraph.jpg';
        $whatsapp = 'https://wa.me/584123694856?text=Hola%20B2uJeans,%20quiero%20informacion%20de%20la%20coleccion.';

        $slides = [
            [
                'seed_key' => 'home.option2.slide1',
                'option' => 2,
                'sort_order' => 0,
                'image_url' => $legacyOne,
                'background_position' => 'center 38%',
                'eyebrow' => 'Industria alimentaria · Gas · Extracción',
                'title' => 'Ingeniería que',
                'accent' => 'mueve tu negocio.',
                'description' => 'Diseñamos y fabricamos equipos industriales en acero inoxidable, instalamos redes de gas y desarrollamos soluciones de extracción para operaciones que exigen rendimiento.',
                'primary_label' => 'Cotizar mi proyecto',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Ver productos',
                'secondary_href' => '#productos',
                'cards' => [['title' => 'Fabricamos', 'text' => 'Equipos industriales en acero inoxidable'], ['title' => 'Instalamos', 'text' => 'Gas natural, propano y extracción'], ['title' => 'Respondemos', 'text' => 'Servicio técnico y mantenimiento']],
            ],
            [
                'seed_key' => 'home.option2.slide2',
                'option' => 2,
                'sort_order' => 1,
                'image_url' => $legacyTwo,
                'background_position' => 'center',
                'eyebrow' => 'Cocinas profesionales · Producción',
                'title' => 'Equipos hechos para',
                'accent' => 'trabajar de verdad.',
                'description' => 'Soluciones robustas para restaurantes, panaderías y procesos de alimentos que necesitan continuidad, seguridad y alto rendimiento.',
                'primary_label' => 'Hablar con un asesor',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Conocer servicios',
                'secondary_href' => '#servicios',
                'cards' => [['title' => 'Diseñamos', 'text' => 'Según capacidad, espacio y proceso'], ['title' => 'Construimos', 'text' => 'Acero inoxidable para trabajo continuo'], ['title' => 'Acompañamos', 'text' => 'Instalación, puesta en marcha y soporte']],
            ],
            [
                'seed_key' => 'home.option2.slide3',
                'option' => 2,
                'sort_order' => 2,
                'image_url' => $industrial,
                'background_position' => 'center',
                'eyebrow' => 'Fabricación · Precisión · Experiencia',
                'title' => 'Acero, técnica y',
                'accent' => 'precisión industrial.',
                'description' => 'Convertimos requerimientos técnicos en equipos y soluciones listas para integrarse a tu operación diaria.',
                'primary_label' => 'Diseñar mi solución',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Ver ingeniería',
                'secondary_href' => '#ingenieria',
                'cards' => [['title' => 'A medida', 'text' => 'Desarrollo según tu necesidad'], ['title' => 'AISI 304', 'text' => 'Material para aplicaciones de alimentos'], ['title' => 'Integración', 'text' => 'Equipos, gas, extracción y soporte']],
            ],
            [
                'seed_key' => 'home.option3.slide1',
                'option' => 3,
                'sort_order' => 0,
                'image_url' => $industrial,
                'background_position' => 'center',
                'eyebrow' => 'Colección de denim B2uJeans',
                'title' => 'El equipo correcto para',
                'accent' => 'cada operación.',
                'description' => 'Encuentra soluciones para cocción, preparación, producción y extracción, con fabricación especial cuando el proceso lo requiere.',
                'primary_label' => 'Explorar catálogo',
                'primary_href' => '#productos',
                'secondary_label' => 'Pedir recomendación',
                'secondary_href' => $whatsapp,
                'cards' => [['title' => 'Cocción', 'text' => 'Estufas, hornos y planchas'], ['title' => 'Producción', 'text' => 'Marmitas, freidoras y equipos especiales'], ['title' => 'Preparación', 'text' => 'Mesas, mesones y estaciones de trabajo']],
            ],
            [
                'seed_key' => 'home.option3.slide2',
                'option' => 3,
                'sort_order' => 1,
                'image_url' => $legacyOne,
                'background_position' => 'center 38%',
                'eyebrow' => 'Equipamiento para producción real',
                'title' => 'Más rendimiento en',
                'accent' => 'menos espacio.',
                'description' => 'Configuramos estaciones y equipos pensando en flujo de trabajo, capacidad, consumo energético y facilidad de mantenimiento.',
                'primary_label' => 'Ver productos',
                'primary_href' => '#productos',
                'secondary_label' => 'Cotizar proyecto',
                'secondary_href' => $whatsapp,
                'cards' => [['title' => 'Rendimiento', 'text' => 'Equipos pensados para operación continua'], ['title' => 'Distribución', 'text' => 'Soluciones adaptadas al espacio disponible'], ['title' => 'Soporte', 'text' => 'Instalación y mantenimiento técnico']],
            ],
            [
                'seed_key' => 'home.option3.slide3',
                'option' => 3,
                'sort_order' => 2,
                'image_url' => $legacyTwo,
                'background_position' => 'center',
                'eyebrow' => 'Soluciones estándar y especiales',
                'title' => 'Tu proceso define',
                'accent' => 'el equipo.',
                'description' => 'Si el catálogo no resuelve exactamente tu necesidad, diseñamos una solución especial con las dimensiones y prestaciones que necesitas.',
                'primary_label' => 'Solicitar asesoría',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Ver capacidades',
                'secondary_href' => '#servicios',
                'cards' => [['title' => 'Diagnóstico', 'text' => 'Revisamos necesidad y capacidad'], ['title' => 'Diseño', 'text' => 'Definimos configuración y dimensiones'], ['title' => 'Fabricación', 'text' => 'Construimos e instalamos la solución']],
            ],
            [
                'seed_key' => 'home.option5.slide1',
                'option' => 5,
                'sort_order' => 0,
                'image_url' => $legacyTwo,
                'background_position' => 'center',
                'eyebrow' => 'B2uJeans Industrias y Servicios',
                'title' => 'Una empresa para resolver',
                'accent' => 'toda tu operación.',
                'description' => 'Fabricación de equipos, redes de gas, extracción, instalación y soporte técnico con un mismo equipo especializado.',
                'primary_label' => 'Hablar con un asesor',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Ver servicios',
                'secondary_href' => '#servicios',
                'cards' => [['title' => 'Equipos', 'text' => 'Fabricación industrial en acero inoxidable'], ['title' => 'Infraestructura', 'text' => 'Gas y sistemas de extracción'], ['title' => 'Postventa', 'text' => 'Servicio técnico y mantenimiento']],
            ],
            [
                'seed_key' => 'home.option5.slide2',
                'option' => 5,
                'sort_order' => 1,
                'image_url' => $industrial,
                'background_position' => 'center',
                'eyebrow' => 'Ingeniería aplicada a tu negocio',
                'title' => 'De la necesidad a',
                'accent' => 'la operación.',
                'description' => 'Integramos diseño, fabricación e instalación para que cada solución llegue lista para aportar productividad a tu negocio.',
                'primary_label' => 'Contar mi proyecto',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Conocer B2uJeans',
                'secondary_href' => '#nosotros',
                'cards' => [['title' => 'Planeamos', 'text' => 'Necesidad, espacio y requerimientos'], ['title' => 'Ejecutamos', 'text' => 'Fabricación e instalación coordinadas'], ['title' => 'Soportamos', 'text' => 'Acompañamiento después de la entrega']],
            ],
            [
                'seed_key' => 'home.option5.slide3',
                'option' => 5,
                'sort_order' => 2,
                'image_url' => $legacyOne,
                'background_position' => 'center 38%',
                'eyebrow' => 'Soluciones que trabajan juntas',
                'title' => 'Menos proveedores.',
                'accent' => 'Más control.',
                'description' => 'Centraliza fabricación, instalación de gas, extracción y mantenimiento con un único aliado técnico para tu operación.',
                'primary_label' => 'Solicitar asesoría',
                'primary_href' => $whatsapp,
                'secondary_label' => 'Ver productos',
                'secondary_href' => '#productos',
                'cards' => [['title' => 'Un solo equipo', 'text' => 'Coordinación técnica de principio a fin'], ['title' => 'Más trazabilidad', 'text' => 'Responsabilidad clara sobre la solución'], ['title' => 'Más continuidad', 'text' => 'Soporte para mantener la operación activa']],
            ],
        ];

        foreach ($slides as $slide) {
            $existing = HeroSlide::query()->where('seed_key', $slide['seed_key'])->first();

            if ($existing) {
                continue;
            }

            $legacyMatch = HeroSlide::query()
                ->whereNull('seed_key')
                ->where('section_key', 'home.hero')
                ->where('option', $slide['option'])
                ->where('sort_order', $slide['sort_order'])
                ->where('title', $slide['title'])
                ->first();

            if ($legacyMatch) {
                $legacyMatch->update(['seed_key' => $slide['seed_key']]);
                continue;
            }

            HeroSlide::create([
                ...$slide,
                'section_key' => 'home.hero',
                'is_active' => true,
                'interval_ms' => 3000,
            ]);
        }
    }
}
