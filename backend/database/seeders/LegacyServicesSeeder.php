<?php

namespace Database\Seeders;

use App\Models\CatalogCategory;
use App\Models\CatalogItem;
use Illuminate\Database\Seeder;

class LegacyServicesSeeder extends Seeder
{
    public function run(): void
    {
        $category = CatalogCategory::query()->firstOrCreate(
            ['slug' => 'servicios'],
            [
                'name' => 'Servicios',
                'description' => 'Servicios históricos publicados por Gaspronal.',
                'is_active' => true,
            ],
        );

        $services = [
            [
                'name' => 'Fabricación de equipos industriales',
                'slug' => 'fabricacion-de-equipos-industriales',
                'short_description' => 'Fabricación de equipos industriales en acero inoxidable y desarrollo de soluciones especiales a medida.',
                'description' => 'Gaspronal fabrica equipos industriales en acero inoxidable según las necesidades de cada proyecto, con capacidad de diseñar e innovar soluciones para la industria alimenticia. También desarrolla equipos especiales a medida para arepas, panaderías, restaurantes y comidas rápidas.',
            ],
            [
                'name' => 'Instalación, reparación y mantenimiento de equipos a gas domésticos e industriales',
                'slug' => 'instalacion-reparacion-y-mantenimiento-de-equipos-a-gas-domesticos-e-industriales',
                'short_description' => 'Mantenimiento preventivo y correctivo, reparación e instalación de equipos a gas domésticos e industriales.',
                'description' => 'Servicio técnico profesional para mantenimiento preventivo y correctivo, reparación e instalación de equipos industriales y domésticos para cocina, con atención a equipos de distintas marcas y enfoque en servicio al cliente.',
            ],
            [
                'name' => 'Instalación de redes de gas propano y natural',
                'slug' => 'instalacion-de-redes-de-gas-propano-y-natural',
                'short_description' => 'Reformas, revisión, corrección e instalación de redes de gas natural y propano.',
                'description' => 'Servicio de reformas, revisión, corrección e instalación de redes de gas natural y propano. Gaspronal informa contar con certificación activa para trabajos de redes de gas natural con autorización de E.P.M.',
            ],
            [
                'name' => 'Asesoría y entrenamiento técnico',
                'slug' => 'asesoria-y-entrenamiento-tecnico',
                'short_description' => 'Entrenamiento técnico para manipulación, cuidado y limpieza de equipos Gaspronal.',
                'description' => 'Asesoría y entrenamiento al personal operativo para la manipulación, cuidado y limpieza de los equipos, orientados a reducir riesgos, optimizar recursos, prolongar la vida útil de los equipos y facilitar su operación.',
            ],
            [
                'name' => 'Servicio correctivo de equipos industriales',
                'slug' => 'servicio-correctivo-de-equipos-industriales',
                'short_description' => 'Recuperación, reparación y mantenimiento correctivo de equipos industriales.',
                'description' => 'Servicio correctivo para recuperar equipos industriales afectados por desgaste o daño. Incluye mantenimiento general, reparación, limpieza, desengrase, soldadura y pruebas cuando corresponda, buscando prolongar la vida útil del equipo.',
            ],
        ];

        foreach ($services as $service) {
            CatalogItem::query()->firstOrCreate(
                ['slug' => $service['slug']],
                [
                    'category_id' => $category->id,
                    'type' => 'service',
                    'name' => $service['name'],
                    'reference' => null,
                    'short_description' => $service['short_description'],
                    'description' => $service['description'],
                    'status' => 'published',
                    'seo_title' => $service['name'],
                    'seo_description' => $service['short_description'],
                    'whatsapp_message' => 'Hola, quiero información sobre el servicio: '.$service['name'].'.',
                    'published_at' => now(),
                ],
            );
        }
    }
}
