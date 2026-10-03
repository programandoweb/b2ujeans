# Inventario SEO y estructura pública histórica de Gaspronal

Fecha de revisión: 2026-10-03

## Regla de migración

Este archivo es la matriz base de preservación SEO del sitio legado. Una URL histórica se mantiene exactamente y responde 200, o si cambia debe existir una redirección HTTP 301 en `seo_redirects`. No se permite convertir silenciosamente una URL indexada en 404.

## Rutas estructurales

- `/2019/`
- `/2019/somos-gaspronal`
- `/2019/contactenos`
- `/2019/productos`
- `/2019/servicios`
- `/2019/gaspro-notas`

## Categorías de producto

- `/2019/productos/categoria/carros-para-comidas-y-bebidas` — 48 fichas enlazadas.
- `/2019/productos/categoria/equipos-mixtos` — 39 fichas enlazadas.
- `/2019/productos/categoria/estufas-industriales` — 47 fichas enlazadas.
- `/2019/productos/categoria/hornos-industriales` — 43 fichas enlazadas.
- `/2019/productos/categoria/campanas-extractoras` — 6 fichas enlazadas.
- `/2019/productos/categoria/equipos-bano-maria` — 12 fichas detectadas por el índice actual.
- `/2019/productos/categoria/mesas-y-mesones` — 34 fichas enlazadas.
- `/2019/productos/categoria/marmitas` — 6 fichas enlazadas.
- `/2019/productos/categoria/freidoras-de-alto-rendimiento` — 22 fichas enlazadas.
- `/2019/productos/categoria/fabricas-de-arepas` — 11 fichas enlazadas.
- `/2019/productos/categoria/asadores-y-planchas-asadoras` — 31 fichas enlazadas.
- `/2019/productos/categoria/panaderia` — 6 fichas enlazadas.

Total con URL individual confirmada: **304 fichas de producto**. El índice reciente de Baño María anuncia un TIPO 12 adicional cuyo href de detalle no pudo resolverse desde el HTML rastreable; se conserva como anomalía pendiente y no se inventa su slug.

Las fichas conservan la familia histórica `/2019/productos/{slug}`. Durante la migración del catálogo se debe comparar cada slug importado contra el enlace legado antes de publicar.

## Servicios encontrados

- `/2019/servicios/fabricacion-de-equipos-industriales`
- `/2019/servicios/asesoria-y-entrenamiento-tecnico`
- `/2019/servicios/instalacion-reparacion-y-mantenimiento-de-equipos-a-gas-domesticos-e-industriales`
- `/2019/servicios/servicio-correctivo-de-equipos-industriales`
- `/2019/servicios/instalacion-de-redes-de-gas-propano-y-natural`
- `/2019/servicios/montajes-de-sistemas-de-extraccion-industrial`
- `/2019/servicios/desarrollo-de-equipos-especiales-a-medida`

## Productos destacados encontrados

- `/2019/productos-destacados/marmita-con-agitador`
- `/2019/productos-destacados/carro-de-comidas-de-cuatro-servicios`

La portada histórica contiene además accesos a Mueble de cocina con horno, Horno para pizzas, Mueble de cocina con gratinador y Asador BBQ empotrado. Sus destinos deben cotejarse en la importación de catálogo para evitar duplicar fichas que ya estén bajo `/2019/productos/{slug}`.

## Gaspro-notas — rutas históricas localizadas

El crawl por navegación e índice de buscador se repitió con consultas diferentes hasta que las pasadas finales dejaron de aportar slugs nuevos. Estas son las rutas editoriales localizadas y sembradas:

1. `/2019/gaspro-notas/no-mas-microondas-conozcan-el-horno-calentador-de-recipientes-plasticos-gaspronal`
2. `/2019/gaspro-notas/gaspronal-industrias-y-servicios-sas-ahora-es-una-marca-registrada`
3. `/2019/gaspro-notas/caso-de-exito-fabricamos-el-sistema-de-extraccion-para-twins-american-style-food`
4. `/2019/gaspro-notas/recomendaciones-para-abrir-tu-pizzeria`
5. `/2019/gaspro-notas/ella-es-margarita-porras-ramirez-nuestra-almacenista`
6. `/2019/gaspro-notas/13-anos-de-gaspronal-la-marca-de-amor-calidad-y-esfuerzo-`
7. `/2019/gaspro-notas/si-gaspronal-en-maridaje-2019`
8. `/2019/gaspro-notas/rancho-de-occidente-vivio-la-experiencia-con-gaspronal-en-la-fabricacion-de-cocina`
9. `/2019/gaspro-notas/gaspronal-ya-forma-parte-del-tour-gastronomico-de-medellin-un-fascinante-sabor-al-paladar`
10. `/2019/gaspro-notas/come-y-conoce-4-datos-curiosos-de-los-restaurantes`
11. `/2019/gaspro-notas/la-freidora-como-equipo-ideal-para-las-salchipapas-la-comida-rapida-preferida-en-medellin`
12. `/2019/gaspro-notas/conoce-las-ventajas-de-los-equipos-mixtos-para-empotrar`
13. `/2019/gaspro-notas/gaspronal-presenta-la-nueva-opcion-para-los-amantes-de-los-asados`
14. `/2019/gaspro-notas/conoce-las-ventajas-de-tener-un-asador-y-arma-tu-plan-de-fin-de-semana`
15. `/2019/gaspro-notas/el-carro-ideal-para-preparar-perros-calientes-`
16. `/2019/gaspro-notas/cocinas-modernas-2019-`
17. `/2019/gaspro-notas/nota-para-gaspronal`
18. `/2019/gaspro-notas/gaspronal-se-lucio-en-maridaje`
19. `/2019/gaspro-notas/gaspronal-en-la-feria-del-hogar`
20. `/2019/gaspro-notas/conoce-el-encanto-de-la-comida-navidena`
21. `/2019/gaspro-notas/que-debe-incluir-una-cocina-de-restaurante`
22. `/2019/gaspro-notas/carlos-adrian-villa-conozcan-a-uno-de-los-talentos-de-gaspronal`
23. `/2019/gaspro-notas/equipos-industriales-a-la-medida-el-exito-de-un-buen-restaurante`
24. `/2019/gaspro-notas/comidas-rapidas-un-negocio-apetecido`
25. `/2019/gaspro-notas/el-nuevo-panadero-tips-para-abrir-una-panaderia`
26. `/2019/gaspro-notas/gaspronal-y-fao-en-alianza-con-la-comunidad-de-llano-grande`

## Seeder editorial

`backend/database/seeders/GasproNotasSeeder.php` crea de forma idempotente:

- categoría `gaspro-notas`;
- 26 publicaciones históricas;
- título;
- slug histórico exacto;
- resumen;
- contenido base;
- estado `published`;
- título y descripción SEO.

`DatabaseSeeder` ejecuta este seeder antes de la creación opcional del usuario administrador.

## Validación antes del reemplazo del sitio

1. Exportar sitemap generado por la nueva aplicación.
2. Compararlo contra esta matriz y contra el crawl final del dominio legado.
3. Cada URL histórica debe responder 200 o 301.
4. Ninguna URL de esta matriz puede responder 404 sin una decisión documentada.
5. Verificar especialmente slugs que terminan en guion, porque forman parte de la URL histórica.
6. Validar canonical, metadata, Open Graph, breadcrumbs y JSON-LD.
