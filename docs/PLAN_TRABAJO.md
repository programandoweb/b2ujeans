# Plan de trabajo — Modernización Gaspronal

## Objetivo general

Migrar el activo digital actual de Gaspronal a una arquitectura moderna basada en Next.js, Tailwind CSS, Laravel y MariaDB, conservando estructura, contenidos, identidad visual y patrimonio SEO.

El proyecto debe producir una evolución reconocible de Gaspronal, no una sustitución de identidad.

## Fase 0 — Línea base y preservación

### Objetivos

- inventariar el sitio actual;
- capturar estructura, contenidos y rutas;
- determinar colores corporativos reales desde CSS/activos existentes;
- identificar categorías y productos;
- generar matriz inicial de URLs;
- documentar servicios, Gaspro-notas y sedes;
- identificar formularios, WhatsApp, mapas e integraciones.

### Entregables

- inventario de contenido;
- mapa del sitio;
- mapa de URLs;
- paleta base verificada;
- matriz SEO inicial;
- inventario de medios;
- riesgos de migración.

### Criterio de aceptación

No iniciar una sustitución masiva de contenido hasta poder demostrar qué se conserva y cómo se migrará.

---

## Fase 1 — Foundation y sistema visual

### Objetivos

- inicializar Next.js + TypeScript;
- instalar/configurar Tailwind;
- definir tokens con la paleta real de Gaspronal;
- crear primitives compartidos;
- establecer layouts públicos;
- diseñar navegación mobile-first;
- preparar accesibilidad y metadata base.

### Componentes base

- Header;
- navegación móvil;
- Footer;
- Container;
- Button;
- Input;
- Select;
- Textarea;
- Breadcrumb;
- ProductCard/ListItem;
- Badge;
- Drawer/Sheet;
- Modal de confirmación;
- Pagination;
- Skeleton;
- EmptyState;
- ErrorState.

### Criterio de aceptación

La UI base debe conservar los colores de Gaspronal, verse contemporánea y estar especialmente optimizada para teléfono.

---

## Fase 2 — Laravel, autenticación y dashboard privado

### Objetivos

- inicializar Laravel;
- configurar MariaDB;
- definir autenticación;
- implementar roles/permisos;
- proteger dashboard y API administrativa;
- crear base del CMS/CRM;
- auditoría de operaciones relevantes.

### Primeras áreas

- usuarios;
- categorías;
- productos;
- medios;
- servicios;
- artículos;
- sedes.

### Criterio de aceptación

No debe ser posible acceder o modificar información administrativa sin autorización backend válida.

---

## Fase 3 — Catálogo y fichas de producto

### Objetivos

- migrar categorías existentes;
- migrar productos y referencias;
- migrar fotografías;
- estructurar especificaciones;
- implementar búsqueda y filtros;
- productos relacionados;
- CTA WhatsApp contextual;
- ficha optimizada para móvil.

### Ficha objetivo

- galería;
- nombre;
- referencia;
- resumen;
- aplicaciones;
- especificaciones;
- relacionados;
- CTA comercial;
- metadata;
- Open Graph;
- breadcrumbs.

### Criterio de aceptación

La ficha debe preservar toda información técnica útil del producto original y mejorar claramente su consumo desde teléfono.

---

## Fase 4 — Institucional, servicios, Gaspro-notas y sedes

### Objetivos

- migrar contenido institucional;
- migrar servicios;
- migrar artículos;
- migrar sedes;
- centralizar teléfonos, correos, direcciones y horarios;
- integrar mapas;
- datos estructurados locales.

### Criterio de aceptación

No debe haber datos de contacto duplicados y divergentes escritos manualmente en múltiples páginas.

---

## Fase 5 — CRM comercial y trazabilidad

### Objetivos

- centralizar formularios;
- registrar solicitudes;
- registrar leads;
- estados comerciales;
- eventos de contacto;
- atribución por producto/categoría;
- clics WhatsApp/teléfono;
- UTMs;
- métricas.

### Flujo base

```text
Visitante
  ↓
Producto / Servicio / Artículo
  ↓
WhatsApp / Teléfono / Formulario
  ↓
Evento comercial
  ↓
Lead
  ↓
Nuevo → En gestión → Cerrado
```

### Criterio de aceptación

El equipo debe poder conocer qué contenido originó cada oportunidad cuando exista información suficiente para atribuirla.

---

## Fase 6 — SEO y preservación de URLs

### Objetivos

- cerrar matriz old → new;
- implementar 301;
- canonical;
- sitemap;
- robots;
- JSON-LD;
- metadata por entidad;
- Open Graph;
- validación de enlaces;
- revisión de 404.

### Criterio de aceptación

Toda URL relevante conocida debe conservarse o tener destino explícito y verificable.

---

## Fase 7 — PWA, rendimiento y QA móvil

### Objetivos

- manifest;
- iconografía;
- comportamiento instalable cuando aplique;
- optimización de imágenes;
- caché;
- reducción de JS cliente;
- QA móvil intensivo;
- accesibilidad;
- Core Web Vitals.

### Matriz mínima móvil

Validar como mínimo:

- Home;
- menú;
- buscador;
- categorías;
- filtros;
- listado de productos;
- ficha;
- galería;
- especificaciones;
- WhatsApp;
- formularios;
- servicios;
- Gaspro-notas;
- sedes/mapas;
- login;
- dashboard;
- edición de producto;
- gestión de leads.

### Criterio de aceptación

No se aprueba una feature porque "se adapta". Debe poder completarse cómodamente desde un teléfono real o viewport equivalente sin pérdida funcional.

---

## Fase 8 — Migración final y lanzamiento

### Antes de publicar

- backup;
- export final de contenido;
- import;
- archivos/media;
- validación de conteos;
- redirecciones;
- smoke tests;
- formularios;
- WhatsApp;
- mapas;
- permisos;
- healthcheck;
- analytics;
- robots/sitemap;
- revisión de 404/500.

### Después de publicar

- observar logs;
- comprobar redirecciones;
- revisar indexación;
- revisar conversiones;
- corregir regresiones;
- comparar métricas con línea base.

---

## Metodología de implementación para IA

Por cada tarea:

1. leer `Agent.md`;
2. ubicar el comportamiento actual;
3. identificar qué debe conservarse;
4. revisar impacto SEO;
5. revisar impacto móvil;
6. revisar seguridad;
7. implementar el cambio mínimo completo;
8. ejecutar lint/typecheck/tests/build según corresponda;
9. hacer QA del flujo afectado;
10. registrar claramente lo probado y lo no probado.

## Prioridad de trabajo

Orden recomendado:

```text
Preservación
    ↓
Foundation
    ↓
Dashboard/Auth
    ↓
Catálogo
    ↓
Contenido
    ↓
CRM
    ↓
SEO completo
    ↓
PWA/Performance
    ↓
Migración/QA
    ↓
Producción
```

## Regla final

La modernización se considera exitosa si Gaspronal conserva su reconocimiento y contenido, mejora drásticamente la experiencia móvil, gana capacidad comercial y administrativa, y no pierde patrimonio SEO durante la transición.
