<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class GoogleIndexedGasproNotasSeeder extends Seeder
{
    public function run(): void
    {
        $category = PostCategory::query()->firstOrCreate(
            ['slug' => 'gaspro-notas'],
            [
                'name' => 'Gaspro-notas',
                'description' => 'Notas, novedades y contenido editorial histórico de Gaspronal.',
                'is_active' => true,
            ],
        );

        /*
         * Segunda fuente: resultados públicos del operador site:gaspronal.com.
         *
         * Este seeder NO pisa ni duplica publicaciones creadas por GasproNotasSeeder.
         * Sólo crea una publicación si el slug indexado por Google no existe todavía.
         */
        $indexedPosts = [
            [
                'title' => 'Gaspronal Industrias y Servicios S.A.S ahora es una marca registrada',
                'slug' => 'gaspronal-industrias-y-servicios-sas-ahora-es-una-marca-registrada',
                'excerpt' => 'Noticia corporativa sobre el registro de la marca Gaspronal Industrias y Servicios S.A.S.',
            ],
            [
                'title' => 'Recomendaciones para abrir tu pizzería',
                'slug' => 'recomendaciones-para-abrir-tu-pizzeria',
                'excerpt' => 'Recomendaciones para emprender una pizzería y seleccionar equipos industriales adecuados.',
            ],
            [
                'title' => '13 años de Gaspronal, la marca de amor, calidad y esfuerzo',
                'slug' => '13-anos-de-gaspronal-la-marca-de-amor-calidad-y-esfuerzo-',
                'excerpt' => 'Historia de Gaspronal, su evolución y trayectoria en fabricación de equipos industriales y servicios asociados al gas.',
            ],
            [
                'title' => '¡Sí! Gaspronal en Maridaje 2019',
                'slug' => 'si-gaspronal-en-maridaje-2019',
                'excerpt' => 'Participación de Gaspronal en Maridaje 2019 y presentación de soluciones para el sector gastronómico.',
            ],
            [
                'title' => 'Rancho de Occidente vivió la experiencia con Gaspronal en la fabricación de cocina',
                'slug' => 'rancho-de-occidente-vivio-la-experiencia-con-gaspronal-en-la-fabricacion-de-cocina',
                'excerpt' => 'Caso de éxito de fabricación de una cocina en acero inoxidable para Rancho de Occidente.',
            ],
            [
                'title' => 'Gaspronal ya forma parte del Tour Gastronómico de Medellín: un fascinante sabor al paladar',
                'slug' => 'gaspronal-ya-forma-parte-del-tour-gastronomico-de-medellin-un-fascinante-sabor-al-paladar',
                'excerpt' => 'Vinculación de Gaspronal al Tour Gastronómico de Medellín como proveedor del sector gastronómico.',
            ],
            [
                'title' => 'Come y conoce 4 datos curiosos de los restaurantes',
                'slug' => 'come-y-conoce-4-datos-curiosos-de-los-restaurantes',
                'excerpt' => 'Contenido editorial con datos y curiosidades relacionados con restaurantes y gastronomía.',
            ],
            [
                'title' => 'La freidora como equipo ideal para las salchipapas, la comida rápida preferida en Medellín',
                'slug' => 'la-freidora-como-equipo-ideal-para-las-salchipapas-la-comida-rapida-preferida-en-medellin',
                'excerpt' => 'Contenido sobre freidoras industriales aplicadas a la preparación de salchipapas y comida rápida.',
            ],
            [
                'title' => 'Conoce las ventajas de los equipos mixtos para empotrar',
                'slug' => 'conoce-las-ventajas-de-los-equipos-mixtos-para-empotrar',
                'excerpt' => 'Ventajas de los equipos mixtos empotrables para cocinas de restaurantes y espacios gastronómicos.',
            ],
            [
                'title' => 'Gaspronal presenta la nueva opción para los amantes de los asados',
                'slug' => 'gaspronal-presenta-la-nueva-opcion-para-los-amantes-de-los-asados',
                'excerpt' => 'Presentación de soluciones Gaspronal para preparación de asados.',
            ],
            [
                'title' => 'Conoce las ventajas de tener un asador y arma tu plan de fin de semana',
                'slug' => 'conoce-las-ventajas-de-tener-un-asador-y-arma-tu-plan-de-fin-de-semana',
                'excerpt' => 'Contenido sobre ventajas y usos de los asadores Gaspronal.',
            ],
            [
                'title' => 'Caso de éxito: Fabricamos el sistema de extracción para Twins American Style Food',
                'slug' => 'caso-de-exito-fabricamos-el-sistema-de-extraccion-para-twins-american-style-food',
                'excerpt' => 'Caso de éxito de diseño de cocina, fabricación de equipos y sistema de extracción para Twins American Style Food.',
            ],
            [
                'title' => 'El carro ideal para preparar perros calientes',
                'slug' => 'el-carro-ideal-para-preparar-perros-calientes-',
                'excerpt' => 'Contenido comercial sobre carros de comidas para la preparación y venta de perros calientes.',
            ],
        ];

        foreach ($indexedPosts as $post) {
            if (Post::query()->where('slug', $post['slug'])->exists()) {
                continue;
            }

            Post::query()->create([
                'category_id' => $category->id,
                'title' => $post['title'],
                'slug' => $post['slug'],
                'excerpt' => $post['excerpt'],
                'content' => $post['excerpt'],
                'status' => 'published',
                'seo_title' => $post['title'],
                'seo_description' => $post['excerpt'],
            ]);
        }
    }
}
