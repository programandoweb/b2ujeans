# Agent.md — Metodología obligatoria de Gaspronal

## 1. Propósito

Este archivo es la autoridad operativa para desarrolladores, agentes de IA y automatizaciones que trabajen en Gaspronal.

Orden de prioridad:

1. solicitud explícita del usuario;
2. este `Agent.md`;
3. documentación de `docs/`;
4. contratos y patrones existentes;
5. decisiones técnicas registradas más recientemente.

## 2. Principio rector

Gaspronal es un activo digital existente. Está prohibido tratar este proyecto como una landing nueva o una reconstrucción destructiva.

Se debe conservar y migrar, salvo decisión documentada:

- arquitectura conceptual de navegación;
- categorías;
- productos;
- fotografías;
- fichas y especificaciones técnicas;
- servicios;
- Gaspro-notas;
- información institucional;
- sedes;
- canales comerciales;
- contenido indexado;
- URLs con valor SEO;
- identidad de marca;
- colores base utilizados actualmente por Gaspronal.

La modernización se concentra en tecnología, velocidad, UX, SEO, conversión, analítica, CRM y administración.

## 3. Stack objetivo

### Web pública

- Next.js.
- TypeScript.
- App Router.
- Server Components por defecto.
- Client Components solo cuando la interacción lo requiera.
- PWA donde aporte valor real.

### Sistema visual

- Tailwind CSS es la base obligatoria.
- No introducir un segundo framework visual.
- No duplicar estilos locales que deban ser tokens o primitives.
- Los colores base de la web actual de Gaspronal deben preservarse.
- Antes de fijar valores HEX/RGB definitivos, se deben obtener de los activos/CSS actuales o del material corporativo. **No inventar colores.**
- La paleta se centraliza como tokens semánticos de Tailwind/CSS variables.

Ejemplo conceptual, no valores definitivos:

```text
brand-primary
brand-secondary
brand-accent
surface
surface-muted
foreground
foreground-muted
border
success
warning
danger
```

### Backend / CRM / CMS

- Laravel.
- API REST versionada.
- MariaDB como fuente de verdad.
- Form Requests para validación.
- Policies/Gates para autorización.
- Resources/DTOs para contratos.
- Actions/Services para lógica de negocio.
- Transacciones cuando una operación afecte varios agregados.

## 4. Dashboard restringido

Debe existir un dashboard administrativo privado.

Ninguna pantalla o API administrativa podrá depender únicamente de que el frontend oculte botones.

Obligatorio:

- autenticación;
- autorización server-side;
- roles y permisos;
- protección de rutas;
- rate limiting en autenticación y operaciones sensibles;
- CSRF cuando corresponda;
- sesiones seguras;
- validación de entrada;
- auditoría de operaciones críticas;
- cierre de sesión;
- recuperación de acceso segura;
- no filtrar secretos o datos administrativos en bundles públicos.

El dashboard administrará progresivamente:

- productos;
- categorías;
- imágenes;
- especificaciones;
- servicios;
- Gaspro-notas;
- sedes;
- formularios;
- leads;
- solicitudes de cotización;
- estados comerciales;
- usuarios y permisos;
- metadatos SEO;
- redirecciones;
- métricas de conversión.

## 5. Mobile-first estricto

"Responsive" no es suficiente.

Gaspronal debe ofrecer una experiencia móvil de primer nivel porque catálogo, WhatsApp y búsqueda comercial tienen un uso natural desde teléfonos.

Toda feature visible debe validarse primero en móvil y luego ampliarse a tablet y desktop.

Reglas obligatorias:

- diseñar desde el viewport móvil;
- navegación usable con una mano;
- objetivos táctiles cómodos;
- tipografía legible sin zoom;
- cero overflow horizontal;
- evitar tablas públicas que obliguen a desplazamiento lateral;
- galerías táctiles;
- filtros móviles en Sheet/Drawer o pantalla dedicada;
- CTA de cotización accesible sin recorrer toda la ficha;
- WhatsApp contextual por producto;
- formularios cortos, teclado correcto por tipo de campo y autocomplete;
- imágenes responsivas con tamaños correctos;
- lazy loading donde corresponda;
- no descargar recursos desktop innecesarios en móvil;
- probar menús, filtros, buscador, ficha de producto, formularios y dashboard en viewport móvil;
- considerar conexiones móviles lentas y dispositivos de gama media;
- estados de loading, error y vacío diseñados también en móvil;
- el dashboard debe ser totalmente operable desde teléfono, no solo visible.

## 6. Identidad visual

La nueva interfaz debe sentirse como una evolución de Gaspronal.

No se permite:

- cambiar arbitrariamente la paleta;
- sustituir identidad corporativa por tendencias visuales genéricas;
- inventar branding;
- usar gradientes o efectos sin relación con la marca;
- utilizar emojis como iconografía;
- mezclar familias de iconos;
- hardcodear colores repetidos en features.

Sí se permite:

- mejorar contraste;
- ordenar jerarquías;
- modernizar tipografía;
- normalizar espaciado;
- mejorar cards, listados y navegación;
- adaptar componentes al comportamiento móvil;
- corregir inconsistencias siempre que se conserve identidad.

## 7. Estructura pública a conservar

La primera versión moderna debe conservar la estructura conceptual:

- Inicio;
- Somos Gaspronal;
- Servicios;
- Productos;
- categorías;
- fichas de producto;
- Gaspro-notas;
- Contacto;
- sedes.

No cambiar taxonomías o nombres históricos sin evidencia y decisión registrada.

## 8. Catálogo

El catálogo es una pieza comercial central.

Cada producto debe poder manejar:

- nombre comercial;
- referencia/tipo;
- slug;
- categoría;
- descripción corta;
- descripción extensa;
- especificaciones estructuradas;
- galería;
- aplicaciones/uso;
- estado de publicación;
- productos relacionados;
- SEO;
- Open Graph;
- CTA de WhatsApp;
- trazabilidad de conversiones.

Los datos técnicos existentes se preservan durante la migración.

## 9. SEO como requisito de arquitectura

SEO no es una tarea posterior.

Obligatorio:

- inventariar URLs actuales;
- conservar o redirigir cada URL relevante;
- usar 301 para cambios permanentes;
- canonical correcto;
- metadata única por entidad;
- sitemap;
- robots.txt;
- breadcrumbs;
- JSON-LD cuando aplique;
- Open Graph por producto/artículo;
- evitar contenido duplicado;
- preservar intención y contenido técnico;
- verificar 404 antes del lanzamiento.

Nunca eliminar una URL indexada sin decidir su destino.

## 10. Conversión y CRM

Todo contacto debe poder atribuirse al contexto que lo originó.

Registrar cuando corresponda:

- producto;
- categoría;
- página;
- fuente/UTM;
- clic a WhatsApp;
- clic telefónico;
- formulario;
- solicitud de cotización;
- fecha/hora;
- estado comercial.

La analítica no debe bloquear la navegación ni degradar Core Web Vitals.

## 11. Backend

- Código técnico en inglés.
- UI y textos visibles en español.
- Controladores delgados.
- Validación explícita.
- Policies/Gates para autorización.
- Paginación.
- índices según consultas reales.
- migraciones claras.
- no esconder reglas críticas en helpers genéricos.
- no introducir una segunda fuente de persistencia.
- secretos solo por configuración segura.
- logs sin credenciales ni tokens.

## 12. Frontend

- Reutilizar primitives.
- Tailwind mediante tokens centralizados.
- Server Components cuando no se requiera estado del navegador.
- Evitar waterfalls evitables.
- Metadata generada server-side.
- formularios accesibles.
- imágenes optimizadas.
- enlaces navegables reales.
- estados de carga y error.
- no sacrificar SEO por convertir innecesariamente páginas públicas en Client Components.

### Organización de assets del frontend

- `frontend/src/app/` se reserva para rutas, layouts, componentes de ruta y archivos especiales reconocidos por Next.js.
- No dejar imágenes, SVG o iconos genéricos sueltos dentro de `frontend/src/app/`.
- Excepción: archivos especiales que Next.js requiere por convención en esa ubicación, por ejemplo `favicon.ico`, `icon.*`, `apple-icon.*`, `opengraph-image.*` o `twitter-image.*` cuando realmente se utilicen.
- Los assets públicos reutilizables deben vivir bajo `frontend/public/programandoweb/` agrupados por propósito.
- Estructura recomendada: `brand/` para logos e identidad, `auth/` para recursos de autenticación, `icons/` para iconografía estática y carpetas de feature cuando exista un dominio claro.
- No duplicar variantes de favicon, PWA o branding si no están referenciadas por metadata, manifest o código.
- Antes de agregar un asset, comprobar si ya existe una versión equivalente y reutilizarla.
- SVG propios deben almacenarse como assets organizados o convertirse en componentes solo cuando necesiten manipulación dinámica; no dispersarlos entre rutas.
- Los assets del backend destinados a correos o recursos servidos por Laravel deben permanecer bajo `backend/public/programandoweb/`, organizados por propósito y con rutas documentadas.

## 13. Rendimiento

El sitio debe priorizar rendimiento real en móvil.

Revisar como mínimo:

- LCP;
- CLS;
- INP;
- peso de imágenes;
- fuentes;
- JavaScript cliente;
- caché;
- compresión;
- lazy loading;
- payload inicial.

No afirmar métricas que no hayan sido medidas.

## 14. Seguridad

- dashboard y APIs administrativas privadas;
- autorización backend obligatoria;
- contraseñas hasheadas;
- tokens rotables;
- secrets fuera del repositorio;
- rate limiting;
- validación de uploads;
- restricciones MIME/tamaño;
- protección contra spam;
- no exponer stack traces en producción;
- headers de seguridad;
- dependencias mantenidas.

## 15. Metodología obligatoria para IA

Antes de implementar:

1. Leer este archivo.
2. Revisar el área afectada.
3. Identificar comportamiento existente que debe preservarse.
4. Determinar impacto SEO.
5. Determinar impacto móvil.
6. Determinar impacto de seguridad si toca dashboard/API.
7. Definir el cambio mínimo.
8. Implementar.
9. Ejecutar pruebas posibles.
10. Verificar visualmente los breakpoints relevantes.
11. Documentar riesgos y pendientes.
12. No afirmar pruebas no ejecutadas.

## 16. Definición de terminado

Una tarea solo está terminada cuando:

- cumple el alcance;
- no destruye contenido existente;
- no rompe URLs o existe redirección;
- respeta la identidad y colores base;
- funciona correctamente en móvil;
- respeta autenticación/autorización cuando aplica;
- no introduce secretos;
- pasa los checks ejecutables;
- el diff es explicable y revisable.

## 17. Prohibiciones

Sin autorización explícita, no:

- rediseñar desde cero la estructura comercial;
- borrar contenido histórico útil;
- cambiar categorías arbitrariamente;
- inventar colores de marca;
- publicar el dashboard;
- confiar en validaciones del navegador como seguridad;
- introducir un segundo framework CSS;
- reemplazar Tailwind por estilos aislados;
- modificar URLs sin estrategia 301;
- hacer una reescritura masiva para resolver una tarea puntual;
- afirmar resultados de QA no ejecutados.
