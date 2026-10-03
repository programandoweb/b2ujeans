<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Database\Seeder;

class GasproNotasSeeder extends Seeder
{
    public function run(): void
    {
        $category = PostCategory::query()->updateOrCreate(
            ['slug' => 'gaspro-notas'],
            [
                'name' => 'Gaspro-notas',
                'description' => 'Notas, novedades y contenido editorial histórico de Gaspronal.',
                'is_active' => true,
            ],
        );

        $posts = [
            ['title' => '¡No más microondas! Conozcan el Horno Calentador de Recipientes Plásticos Gaspronal', 'slug' => 'no-mas-microondas-conozcan-el-horno-calentador-de-recipientes-plasticos-gaspronal', 'excerpt' => 'Presentación del horno calentador de recipientes plásticos de Gaspronal como alternativa para calentar alimentos de forma uniforme.'],
            ['title' => 'Gaspronal Industrias y Servicios S.A.S ahora es una marca registrada', 'slug' => 'gaspronal-industrias-y-servicios-sas-ahora-es-una-marca-registrada', 'excerpt' => 'Noticia corporativa sobre el registro de la marca Gaspronal Industrias y Servicios S.A.S.'],
            ['title' => 'Caso de éxito: Fabricamos el sistema de extracción para Twins American Style Food', 'slug' => 'caso-de-exito-fabricamos-el-sistema-de-extraccion-para-twins-american-style-food', 'excerpt' => 'Caso de éxito de diseño de cocina, fabricación de equipos y sistema de extracción para Twins American Style Food.'],
            ['title' => 'Recomendaciones para abrir tu pizzería', 'slug' => 'recomendaciones-para-abrir-tu-pizzeria', 'excerpt' => 'Recomendaciones para emprender una pizzería y seleccionar equipos industriales adecuados.'],
            ['title' => 'Ella es Margarita Porras Ramírez, nuestra almacenista', 'slug' => 'ella-es-margarita-porras-ramirez-nuestra-almacenista', 'excerpt' => 'Perfil de Margarita Porras Ramírez y reconocimiento al equipo humano de Gaspronal.'],
            ['title' => '13 años de Gaspronal, la marca de amor, calidad y esfuerzo', 'slug' => '13-anos-de-gaspronal-la-marca-de-amor-calidad-y-esfuerzo-', 'excerpt' => 'Historia de Gaspronal, su evolución y trayectoria en fabricación de equipos industriales y servicios asociados al gas.'],
            ['title' => '¡Sí! Gaspronal en Maridaje 2019', 'slug' => 'si-gaspronal-en-maridaje-2019', 'excerpt' => 'Participación de Gaspronal en Maridaje 2019 y presentación de soluciones para el sector gastronómico.'],
            ['title' => 'Rancho de Occidente vivió la experiencia con Gaspronal en la fabricación de cocina', 'slug' => 'rancho-de-occidente-vivio-la-experiencia-con-gaspronal-en-la-fabricacion-de-cocina', 'excerpt' => 'Caso de éxito de fabricación de una cocina en acero inoxidable para Rancho de Occidente.'],
            ['title' => 'Gaspronal ya forma parte del Tour Gastronómico de Medellín: un fascinante sabor al paladar', 'slug' => 'gaspronal-ya-forma-parte-del-tour-gastronomico-de-medellin-un-fascinante-sabor-al-paladar', 'excerpt' => 'Vinculación de Gaspronal al Tour Gastronómico de Medellín como proveedor del sector gastronómico.'],
            ['title' => 'Come y conoce 4 datos curiosos de los restaurantes', 'slug' => 'come-y-conoce-4-datos-curiosos-de-los-restaurantes', 'excerpt' => 'Contenido editorial con datos y curiosidades relacionados con restaurantes y gastronomía.'],
            ['title' => 'La freidora como equipo ideal para las salchipapas, la comida rápida preferida en Medellín', 'slug' => 'la-freidora-como-equipo-ideal-para-las-salchipapas-la-comida-rapida-preferida-en-medellin', 'excerpt' => 'Contenido sobre freidoras industriales aplicadas a la preparación de salchipapas y comida rápida.'],
            ['title' => 'Conoce las ventajas de los equipos mixtos para empotrar', 'slug' => 'conoce-las-ventajas-de-los-equipos-mixtos-para-empotrar', 'excerpt' => 'Ventajas de los equipos mixtos empotrables para cocinas de restaurantes y espacios gastronómicos.'],
            ['title' => 'Gaspronal presenta la nueva opción para los amantes de los asados', 'slug' => 'gaspronal-presenta-la-nueva-opcion-para-los-amantes-de-los-asados', 'excerpt' => 'Presentación de soluciones Gaspronal para preparación de asados.'],
            ['title' => 'Conoce las ventajas de tener un asador y arma tu plan de fin de semana', 'slug' => 'conoce-las-ventajas-de-tener-un-asador-y-arma-tu-plan-de-fin-de-semana', 'excerpt' => 'Contenido sobre ventajas y usos de los asadores Gaspronal.'],
            ['title' => 'El carro ideal para preparar perros calientes', 'slug' => 'el-carro-ideal-para-preparar-perros-calientes-', 'excerpt' => 'Contenido comercial sobre carros de comidas para la preparación y venta de perros calientes.'],
            ['title' => 'Cocinas Modernas 2019', 'slug' => 'cocinas-modernas-2019-', 'excerpt' => 'Nota histórica de Gaspronal sobre tendencias y soluciones para cocinas modernas.'],
            ['title' => 'Nota para Gaspronal', 'slug' => 'nota-para-gaspronal', 'excerpt' => 'Contenido editorial histórico conservado para preservar su URL indexada.'],
            ['title' => '¡Gaspronal se lució en Maridaje!', 'slug' => 'gaspronal-se-lucio-en-maridaje', 'excerpt' => 'Resumen de la participación de Gaspronal en Maridaje 2019 y la recepción de sus equipos industriales.'],
            ['title' => 'Gaspronal en la Feria del Hogar', 'slug' => 'gaspronal-en-la-feria-del-hogar', 'excerpt' => 'Nota histórica sobre la presencia de Gaspronal en la Feria del Hogar.'],
            ['title' => 'Conoce el encanto de la comida navideña', 'slug' => 'conoce-el-encanto-de-la-comida-navidena', 'excerpt' => 'Contenido editorial relacionado con gastronomía y preparaciones de temporada navideña.'],
            ['title' => '¿Qué debe incluir una cocina de restaurante?', 'slug' => 'que-debe-incluir-una-cocina-de-restaurante', 'excerpt' => 'Guía sobre los elementos y equipos que forman parte de una cocina profesional de restaurante.'],
            ['title' => 'Carlos Adrián Villa, conozcan a uno de los talentos de Gaspronal', 'slug' => 'carlos-adrian-villa-conozcan-a-uno-de-los-talentos-de-gaspronal', 'excerpt' => 'Perfil de Carlos Adrián Villa como parte del talento humano de Gaspronal.'],
            ['title' => 'Equipos industriales a la medida: el éxito de un buen restaurante', 'slug' => 'equipos-industriales-a-la-medida-el-exito-de-un-buen-restaurante', 'excerpt' => 'Contenido sobre el valor de diseñar y fabricar equipos industriales adaptados a cada restaurante.'],
            ['title' => 'Comidas rápidas: un negocio apetecido', 'slug' => 'comidas-rapidas-un-negocio-apetecido', 'excerpt' => 'Nota sobre el negocio de comidas rápidas y los equipos industriales utilizados en su operación.'],
            ['title' => 'El nuevo panadero: tips para abrir una panadería', 'slug' => 'el-nuevo-panadero-tips-para-abrir-una-panaderia', 'excerpt' => 'Recomendaciones para emprender una panadería y seleccionar el equipamiento necesario.'],
            ['title' => 'Gaspronal y FAO en alianza con la comunidad de Llano Grande', 'slug' => 'gaspronal-y-fao-en-alianza-con-la-comunidad-de-llano-grande', 'excerpt' => 'Nota histórica sobre una iniciativa de Gaspronal y FAO con la comunidad de Llano Grande.'],
        ];

        foreach ($posts as $post) {
            Post::query()->updateOrCreate(
                ['slug' => $post['slug']],
                [
                    'category_id' => $category->id,
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'],
                    'content' => $post['excerpt'],
                    'status' => 'published',
                    'seo_title' => $post['title'],
                    'seo_description' => $post['excerpt'],
                ],
            );
        }
    }
}
