# Inventario SEO y estructura pública actual de Gaspronal

Fecha de revisión: 2026-10-03

## Objetivo

Este inventario es la base de migración del sitio actual a la nueva plataforma. Ninguna URL indexada debe eliminarse sin conservar exactamente su ruta o registrar una redirección HTTP 301 hacia su reemplazo.

## Familias de URL detectadas

- `/2019/` — inicio histórico.
- `/2019/somos-gaspronal` — página institucional.
- `/2019/contactenos` — contacto.
- `/2019/productos` — índice de catálogo.
- `/2019/productos/categoria/{slug}` — categorías de producto.
- `/2019/productos/{slug}` — fichas de producto.
- `/2019/productos-destacados/{slug}` — fichas históricas destacadas; deben inventariarse antes de reemplazarlas.
- `/2019/servicios` — índice de servicios.
- `/2019/servicios/{slug}` — fichas de servicio.
- `/2019/gaspro-notas` — índice editorial.
- `/2019/gaspro-notas/{slug}` — artículos.

## Categorías de producto detectadas

1. carros-para-comidas-y-bebidas
2. equipos-mixtos
3. estufas-industriales
4. hornos-industriales
5. campanas-extractoras
6. equipos-bano-maria
7. mesas-y-mesones
8. marmitas
9. freidoras-de-alto-rendimiento
10. fabricas-de-arepas
11. asadores-y-planchas-asadoras
12. panaderia

## Servicios detectados como contenido indexable

Ejemplos confirmados:

- `/2019/servicios/fabricacion-de-equipos-industriales`
- `/2019/servicios/asesoria-y-entrenamiento-tecnico`
- `/2019/servicios/instalacion-reparacion-y-mantenimiento-de-equipos-a-gas-domesticos-e-industriales`
- `/2019/servicios/servicio-correctivo-de-equipos-industriales`

El crawler y la importación definitiva deben completar el inventario antes del cambio de dominio o de estructura.

## Gaspro-notas

La categoría editorial histórica se conserva con slug exacto `gaspro-notas`.

Rutas:

- índice: `/2019/gaspro-notas`
- detalle: `/2019/gaspro-notas/{slug}`

La nueva base de datos crea esta categoría por defecto.

## Estrategia de catálogo

Productos y servicios comparten el agregado `catalog_items` y se diferencian por `type`:

- `product` -> `/2019/productos/{slug}`
- `service` -> `/2019/servicios/{slug}`

Las categorías comerciales se almacenan en `catalog_categories`.

## Regla obligatoria de migración

1. Si una URL histórica se conserva exactamente, responde 200 en la misma ruta y no requiere redirección.
2. Si una URL cambia, se registra en `seo_redirects`.
3. Los cambios permanentes usan 301.
4. Antes del lanzamiento se compara este inventario con las URLs generadas por el nuevo sitemap.
5. No se acepta un 404 para una URL histórica con valor SEO sin una decisión documentada.
6. Canonical, Open Graph, metadata, breadcrumbs y JSON-LD se generan desde la entidad correspondiente.

## Pendientes de la fase de migración pública

- crawling exhaustivo de todas las fichas de producto;
- crawling exhaustivo de servicios;
- crawling exhaustivo de Gaspro-notas;
- identificar rutas históricas bajo `productos-destacados`;
- registrar imágenes y documentos asociados;
- construir matriz URL origen -> URL destino;
- generar sitemap dinámico desde entidades publicadas;
- validar códigos 200/301/404 antes de puesta en producción.
