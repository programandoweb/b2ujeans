<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        if (HeroSlide::query()->exists()) {
            return;
        }

        $legacyOne = 'https://www.gaspronal.com/2019/fotos/Image/cabezotesjq/Cabezote-Gaspronal-Web.jpg?1791214773376';
        $legacyTwo = 'https://www.gaspronal.com/2019/fotos/Image/cabezotesjq/Cabezote-Gaspronal-Web-2.jpg?1791214773955';
        $industrial = '/programandoweb/opengraph/home-opengraph.jpg';
        $whatsapp = 'https://wa.me/573045527575?text=Hola%20Gaspronal,%20quiero%20recibir%20asesor%C3%ADa%20para%20mi%20proyecto.';

        $slides = [
            [2, $legacyOne, 'center 38%', 'Industria alimentaria · Gas · Extracción', 'Ingeniería que', 'mueve tu negocio.', 'Diseñamos y fabricamos equipos industriales en acero inoxidable, instalamos redes de gas y desarrollamos soluciones de extracción para operaciones que exigen rendimiento.', 'Cotizar mi proyecto', $whatsapp, 'Ver productos', '#productos', [['Fabricamos','Equipos industriales en acero inoxidable'],['Instalamos','Gas natural, propano y extracción'],['Respondemos','Servicio técnico y mantenimiento']]],
            [2, $legacyTwo, 'center', 'Cocinas profesionales · Producción', 'Equipos hechos para', 'trabajar de verdad.', 'Soluciones robustas para restaurantes, panaderías y procesos de alimentos que necesitan continuidad, seguridad y alto rendimiento.', 'Hablar con un asesor', $whatsapp, 'Conocer servicios', '#servicios', [['Diseñamos','Según capacidad, espacio y proceso'],['Construimos','Acero inoxidable para trabajo continuo'],['Acompañamos','Instalación, puesta en marcha y soporte']]],
            [2, $industrial, 'center', 'Fabricación · Precisión · Experiencia', 'Acero, técnica y', 'precisión industrial.', 'Convertimos requerimientos técnicos en equipos y soluciones listas para integrarse a tu operación diaria.', 'Diseñar mi solución', $whatsapp, 'Ver ingeniería', '#ingenieria', [['A medida','Desarrollo según tu necesidad'],['AISI 304','Material para aplicaciones de alimentos'],['Integración','Equipos, gas, extracción y soporte']]],
            [3, $industrial, 'center', 'Catálogo industrial Gaspronal', 'El equipo correcto para', 'cada operación.', 'Encuentra soluciones para cocción, preparación, producción y extracción, con fabricación especial cuando el proceso lo requiere.', 'Explorar catálogo', '#productos', 'Pedir recomendación', $whatsapp, [['Cocción','Estufas, hornos y planchas'],['Producción','Marmitas, freidoras y equipos especiales'],['Preparación','Mesas, mesones y estaciones de trabajo']]],
            [3, $legacyOne, 'center 38%', 'Equipamiento para producción real', 'Más rendimiento en', 'menos espacio.', 'Configuramos estaciones y equipos pensando en flujo de trabajo, capacidad, consumo energético y facilidad de mantenimiento.', 'Ver productos', '#productos', 'Cotizar proyecto', $whatsapp, [['Rendimiento','Equipos pensados para operación continua'],['Distribución','Soluciones adaptadas al espacio disponible'],['Soporte','Instalación y mantenimiento técnico']]],
            [3, $legacyTwo, 'center', 'Soluciones estándar y especiales', 'Tu proceso define', 'el equipo.', 'Si el catálogo no resuelve exactamente tu necesidad, diseñamos una solución especial con las dimensiones y prestaciones que necesitas.', 'Solicitar asesoría', $whatsapp, 'Ver capacidades', '#servicios', [['Diagnóstico','Revisamos necesidad y capacidad'],['Diseño','Definimos configuración y dimensiones'],['Fabricación','Construimos e instalamos la solución']]],
            [5, $legacyTwo, 'center', 'Gaspronal Industrias y Servicios', 'Una empresa para resolver', 'toda tu operación.', 'Fabricación de equipos, redes de gas, extracción, instalación y soporte técnico con un mismo equipo especializado.', 'Hablar con un asesor', $whatsapp, 'Ver servicios', '#servicios', [['Equipos','Fabricación industrial en acero inoxidable'],['Infraestructura','Gas y sistemas de extracción'],['Postventa','Servicio técnico y mantenimiento']]],
            [5, $industrial, 'center', 'Ingeniería aplicada a tu negocio', 'De la necesidad a', 'la operación.', 'Integramos diseño, fabricación e instalación para que cada solución llegue lista para aportar productividad a tu negocio.', 'Contar mi proyecto', $whatsapp, 'Conocer Gaspronal', '#nosotros', [['Planeamos','Necesidad, espacio y requerimientos'],['Ejecutamos','Fabricación e instalación coordinadas'],['Soportamos','Acompañamiento después de la entrega']]],
            [5, $legacyOne, 'center 38%', 'Soluciones que trabajan juntas', 'Menos proveedores.', 'Más control.', 'Centraliza fabricación, instalación de gas, extracción y mantenimiento con un único aliado técnico para tu operación.', 'Solicitar asesoría', $whatsapp, 'Ver productos', '#productos', [['Un solo equipo','Coordinación técnica de principio a fin'],['Más trazabilidad','Responsabilidad clara sobre la solución'],['Más continuidad','Soporte para mantener la operación activa']]],
        ];

        foreach ($slides as $index => [$option,$image,$position,$eyebrow,$title,$accent,$description,$primaryLabel,$primaryHref,$secondaryLabel,$secondaryHref,$cards]) {
            HeroSlide::create([
                'option' => $option,
                'sort_order' => $index % 3,
                'is_active' => true,
                'interval_ms' => 3000,
                'image_url' => $image,
                'background_position' => $position,
                'eyebrow' => $eyebrow,
                'title' => $title,
                'accent' => $accent,
                'description' => $description,
                'primary_label' => $primaryLabel,
                'primary_href' => $primaryHref,
                'secondary_label' => $secondaryLabel,
                'secondary_href' => $secondaryHref,
                'cards' => array_map(fn ($card) => ['title' => $card[0], 'text' => $card[1]], $cards),
            ]);
        }
    }
}
