# Estrategia de migración SEO

## Objetivo

Modernizar Gaspronal sin perder el valor de URLs, contenido y señales acumuladas por el sitio actual.

## Regla de oro

**Ninguna URL pública existente se elimina o cambia sin conocer su destino.**

## Inventario previo

Antes del lanzamiento se debe generar una matriz:

```text
old_url
status_actual
tipo
title
h1
canonical_actual
indexable
new_url
accion
http_status_objetivo
observaciones
```

## Acciones posibles

- conservar URL;
- 301 a equivalente nuevo;
- 301 a categoría superior cuando no exista reemplazo exacto y sea semánticamente correcto;
- mantener 404/410 únicamente con decisión justificada.

No hacer redirecciones masivas de cualquier URL hacia Home.

## Elementos obligatorios

- title único;
- meta description;
- canonical;
- robots;
- sitemap XML;
- breadcrumbs;
- Open Graph;
- imágenes sociales;
- Schema.org cuando corresponda;
- headings semánticos;
- alt útil en imágenes;
- contenido renderizable/indexable sin depender de interacción cliente.

## Productos

Cada producto debe preservar su contenido técnico y mejorar su estructura semántica.

Separar:

- nombre comercial;
- referencia histórica;
- descripción;
- especificaciones;
- aplicaciones;
- categoría;
- imágenes;
- relacionados.

La referencia antigua puede conservarse aunque el título SEO se adapte a intención de búsqueda.

## Sedes / SEO local

Cada sede debe poder publicar:

- nombre;
- dirección;
- teléfono;
- WhatsApp cuando aplique;
- horario;
- mapa;
- coordenadas;
- servicios;
- datos estructurados LocalBusiness/Organization según corresponda.

Los datos deben provenir de una fuente administrativa única para evitar inconsistencias.

## Checklist pre-lanzamiento

- inventario completo de URLs;
- matriz de redirecciones;
- pruebas de 301;
- cero cadenas de redirecciones evitables;
- sitemap válido;
- robots válido;
- canonical correcto;
- metadata de productos;
- OG de productos;
- noindex del dashboard;
- no exposición de endpoints administrativos;
- revisión de 404;
- revisión de enlaces internos;
- verificación móvil;
- medición de rendimiento.

## Post-lanzamiento

Monitorear:

- 404;
- errores 5xx;
- URLs excluidas;
- cobertura/indexación;
- tráfico orgánico;
- Core Web Vitals;
- conversiones por landing/producto.

No declarar éxito SEO solo por publicar la nueva plataforma.
