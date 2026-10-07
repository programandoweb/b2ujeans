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
- Los colores corporativos oficiales extraídos del arte `LOGO GASPRONAL 2026` son: azul `#005C99` y naranja `#F37021`.
- El azul `#005C99` es el color primario de interfaz y navegación; el naranja `#F37021` funciona como acento de marca, énfasis y estados interactivos complementarios.
- No inventar ni sustituir estos colores corporativos sin una decisión documentada basada en material oficial posterior.
- La paleta se centraliza como tokens semánticos de Tailwind/CSS variables.
- La fuente de verdad visual vigente es el manual oficial **Manual Uso Marca Gaspronal** y sus archivos maestros.
- Color base **Acero Oscuro**: `#1F252B` (Pantone 432 C), usado para texto principal, fondos oscuros y contraste institucional.
- En interfaces, **Source Sans 3** es la familia tipográfica corporativa de apoyo para títulos, textos, formularios, dashboard y contenido editorial.
- Montserrat y Sinhala Sangam MN forman parte de la firma de marca y del descriptor en los archivos maestros; el logotipo no debe reconstruirse con texto HTML/CSS.
- Sobre fondos claros se usa preferentemente el logotipo full color. Sobre fondos azul, acero oscuro o fotografía oscurecida se usa la versión blanca aprobada.
- El logotipo completo no debe reproducirse por debajo de 120 px en pantalla. En espacios compactos se utiliza el isotipo aprobado, sin comprimir el logotipo.
- Debe respetarse un área de reserva mínima equivalente a 1X alrededor de la firma y conservar siempre sus proporciones.
- No aplicar al logotipo degradados, sombras, transparencias, contornos, recoloreados, filtros CSS ni deformaciones.

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
- los correos y notificaciones no deben generar URLs de assets usando hostnames internos de Docker; toda URL pública del backend debe salir de `PUBLIC_BACKEND_URL` y ser configurable por entorno.

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

### Lineamientos obligatorios del dashboard administrativo

- Las rutas administrativas de listado deben ocupar el 100% del ancho útil disponible después del sidebar; evitar `max-w-*` que limite artificialmente el contenido.
- Los formularios de creación y edición deben vivir en rutas dedicadas, no embebidos dentro de la pantalla de listado, salvo una excepción funcional explícitamente aprobada.
- Patrón recomendado: listado en la ruta índice, creación en `/nuevo` y edición en `/{id}/editar`.
- Los formularios administrativos deben usar una grilla responsive y aprovechar el ancho disponible; en desktop se permiten múltiples columnas cuando mejore la densidad sin sacrificar legibilidad.
- Cuando el formulario mezcle inputs/selects con áreas de texto extensas, priorizar una composición de dos columnas principales: controles estructurados a la izquierda y `textarea`/contenido largo a la derecha; en móvil deben apilarse.
- La iconografía de formularios y acciones administrativas debe ser consistente y semántica, usando `react-icons` como librería preferida del dashboard. No mezclar familias visuales dentro de una misma pantalla.
- Las entidades administrativas comparables deben presentarse como tablas o listados compactos; reservar cards para KPIs, resúmenes o agrupaciones con significado propio.
- Mantener siempre mobile-first: 1 columna en móvil y escalado progresivo a tablet/desktop sin overflow horizontal.

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


## 18. Pendiente temporal de recuperación de contraseña

Existe un tema temporal con el flujo de recuperación de contraseña que debe cerrarse por seguridad.

Reglas obligatorias:

- no documentar ni almacenar contraseñas temporales en este archivo;
- no convertir excepciones temporales de recuperación en comportamiento permanente;
- después de cada nueva programación, cambio relevante o push del proyecto Gaspronal, recordar explícitamente: **"hay un tema con la recuperación de contraseña que hay que cerrar"**;
- cuando el flujo temporal sea retirado y validado, eliminar este recordatorio mediante decisión explícita del responsable del proyecto.


## 19. Flujo obligatorio de despliegue después de un push

Gaspronal utiliza exclusivamente el mecanismo de despliegue autenticado ya existente en `/dashboard/configuracion`.

Reglas obligatorias para agentes de IA que realicen cambios y push a `main`:

- no crear ni reutilizar endpoints públicos de autodeploy por token, Bearer key o webhook alternativo;
- no almacenar secretos de despliegue en Git ni enviarlos en conversaciones;
- después de completar cada push a `main`, enviar al responsable del proyecto un correo de notificación de despliegue;
- el correo debe incluir el SHA del commit o revisión final y un enlace a:
  `https://gaspronal.programandoweb.net/dashboard/configuracion?deploy=1&ref=<commit_sha>`;
- si el usuario no tiene una sesión activa, el sistema debe redirigirlo a `/login` conservando el destino original en `next`;
- después de autenticarse correctamente, debe regresar a la URL de Configuración solicitada;
- `deploy=1` debe disparar una sola vez el mismo `POST /deployments` que utiliza el botón **Desplegar ahora** de Configuración;
- la URL debe limpiarse inmediatamente después de consumir la intención de despliegue para evitar repetir el POST al refrescar;
- el endpoint backend de despliegue debe seguir protegido por autenticación y por el permiso `deployments.manage`;
- el historial y estado del despliegue deben seguir siendo los existentes en Configuración; no mantener una segunda fuente de verdad;
- el agente no debe afirmar que producción fue desplegada solo porque realizó el push. El despliegue depende de que el responsable abra el enlace del correo y autorice el acceso mediante su sesión;
- cuando el usuario confirme o cuando exista evidencia verificable del resultado, informar si el despliegue terminó correctamente o falló y reportar el error disponible;
- este flujo no usa GitHub Actions y no debe introducir dependencia de créditos de ejecución de GitHub.

El botón manual de `/dashboard/configuracion` continúa disponible y es la vía de recuperación si el enlace del correo no puede utilizarse.


## 20. Impersonación de usuarios

La función **Iniciar sesión como usuario** es una capacidad administrativa excepcional y queda restringida exclusivamente al rol `root`.

Reglas obligatorias:

- solo una sesión autenticada cuyo usuario tenga el rol `root` puede solicitar impersonación;
- el control debe validarse siempre en backend; ocultar el botón en frontend no es una medida de seguridad suficiente;
- no se permite impersonar la propia cuenta root ni otra cuenta con rol `root`;
- al iniciar la impersonación, el JWT original del root debe conservarse únicamente en una cookie `HttpOnly`, `Secure` en producción y `SameSite=Lax`;
- la cookie activa debe pasar a representar al usuario objetivo, de modo que todas las Policies, Gates, roles y permisos se evalúen exactamente como para ese usuario;
- mientras exista impersonación debe mostrarse una acción visible **Volver a cuenta root** en el dashboard;
- no se permiten impersonaciones encadenadas;
- cerrar sesión durante una impersonación debe eliminar tanto la sesión activa como la sesión root preservada;
- el backend debe registrar el inicio de la impersonación con el identificador del root y del usuario objetivo, sin registrar tokens;
- nunca se deben exponer JWT, cookies de sesión o credenciales en logs, UI, URLs o correos;
- esta capacidad no puede extenderse a `admin` ni a permisos configurables sin una decisión explícita del responsable del proyecto.


## 21. Constructor reutilizable de heroes

Los heroes y carruseles administrables deben gestionarse desde `/dashboard/heroes`. El constructor es reutilizable por ubicación mediante `section_key`; `home.hero` es la primera ubicación conectada, no una restricción del módulo.

Reglas:

- los slides administrados se almacenan en `hero_slides` y cada registro pertenece a una ubicación mediante `section_key`;
- el home consume únicamente slides activos y respeta su orden;
- el home consulta explícitamente `section_key=home.hero`; las propuestas 2, 3 y 5 utilizan ese contenido administrado y conservan fallback en código si la API pública falla;
- nuevas páginas pueden reutilizar el mismo constructor definiendo claves como `productos.hero`, `servicios.hero`, `gaspro-notas.hero` o cualquier clave válida acordada;
- cada slide puede gestionar imagen, posición de fondo, badge, título, texto destacado, descripción, CTAs, tres bloques derechos, orden, estado e intervalo;
- las imágenes cargadas desde el dashboard se almacenan en el backend y se sirven por una ruta pública controlada;
- `heroes.view` permite consultar el módulo;
- `heroes.manage` permite crear, editar, eliminar, ordenar, activar/desactivar y subir imágenes;
- el backend debe validar siempre ambos permisos; ocultar opciones del menú no sustituye la autorización;
- el sidebar solo debe mostrar **Heroes del home** a usuarios con `heroes.view`;
- cualquier nuevo rol o usuario debe recibir estos permisos únicamente de acuerdo con la política de acceso definida por el responsable del proyecto.


## 22. Recolector web y agente creador de contenido

El agente `lucia` utiliza `extensions/gaspronal-browser-collector` para recolectar fuentes web y producir borradores de Gaspro-notas.

- Las fuentes se declaran en `realtime/agents/lucia/Tools.md`.
- Realtime expone WebSocket nativo en `BROWSER_SOCKET_PATH` sin sustituir Socket.IO de los chats.
- `REALTIME_CORS_ORIGIN` admite varios orígenes separados por coma; inicialmente `https://gaspronal.programandoweb.net`.
- La primera versión no autentica la extensión contra el orquestador por decisión explícita del responsable.
- Cada corrida se registra en `content_creator_runs` y sus artefactos en `content_creator_artifacts`.
- Las imágenes se guardan en `backend/public/images/uploads/agente-contenido/{uuid}/`.
- Se producen exactamente cinco imágenes y cada una debe persistirse antes de solicitar la siguiente.
- El post final se crea como `draft`, nunca se publica automáticamente.
- `GEMINI_IMAGE_MODEL` controla el modelo visual y no se hardcodean API keys.
- Lucía emite progreso operativo en tiempo real mediante el evento Socket.IO `agent:progress`; el dashboard debe mostrar cada paso como un item independiente del chat sin incluir esos items en el historial enviado al modelo.
- El progreso debe cubrir como mínimo: inicio, apertura de la extensión, respuesta del recolector con resumen cuantitativo, persistencia de cada fuente, planificación editorial, generación y persistencia individual de cada una de las cinco imágenes, redacción y guardado final del borrador.
- Cuando `NEXT_PUBLIC_REALTIME_URL` no está configurado, el frontend usa el mismo origen del dashboard para Socket.IO; el proxy público debe enrutar `/socket.io/` al servicio realtime en el puerto 4100.
- Las Gaspro-notas administrables usan dos tabs en edición: **Formulario** y **Galería**, replicando el patrón del catálogo.
- La galería de un post se persiste en `posts.gallery`; la imagen marcada como principal actualiza simultáneamente `featured_image` y `og_image`.
- Las cinco imágenes generadas por Lucía deben quedar asociadas a la galería del post creado, no únicamente a la trazabilidad interna.
- Las imágenes de posts se sirven por `/api/post-media/{post}/{filename}`; las nuevas cargas manuales y las imágenes generadas por Lucía se copian a almacenamiento público de posts.
- La migración de backfill debe incorporar a la galería las imágenes de corridas de Lucía ya completadas cuando sus archivos originales aún existan.

## 23. Navegación pública del home

- El home utiliza `frontend/src/components/public/PublicHeader.tsx` como navegación pública reutilizable.
- La navegación debe incluir acceso visible a `/gaspro-notas` tanto en escritorio como en móvil.
- Al hacer scroll, el header permanece adherido al borde superior y utiliza Motion para suavizar reducción de altura/logo, cambio de fondo y aparición de sombra; no debe producir saltos de layout.
- Los enlaces de sección del home conservan anclas a productos, servicios, ingeniería, Gaspronal y contacto.
- El footer del home también debe mantener un acceso directo a Gaspro-notas.
- La ruta pública `/gaspro-notas` debe existir y listar únicamente posts publicados; cada nota usa `/gaspro-notas/{slug}`.
- El backend expone lectura pública mediante `/api/v1/content/public/posts` y `/api/v1/content/public/posts/{slug}`; borradores y archivados nunca deben aparecer en estas rutas.
- El header público reserva su altura en el flujo y, después de comenzar el scroll, pasa a `position: fixed` en `top: 0` para evitar que un ancestro con overflow anule el comportamiento sticky.
- Los enlaces de secciones del header usan rutas absolutas del home (`/#productos`, `/#servicios`, etc.) para funcionar también desde Gaspro-notas y otras páginas públicas.

## 24. Open Graph y SEO editorial de Gaspro-notas

Las Gaspro-notas son contenido comercial público y su presentación al compartir enlaces es una capacidad crítica del producto.

- Cada `/gaspro-notas/{slug}` debe emitir canonical absoluto, title, description, robots, Open Graph de tipo `article` y Twitter Card `summary_large_image`.
- La tarjeta social se genera en `/api/og/gaspro-notas/{slug}` con formato exacto 1200×630, identidad visual Gaspronal, título de la nota, resumen y la imagen principal cuando exista.
- El `og:image` debe ser una URL absoluta, pública y sin autenticación. Debe declarar ancho 1200, alto 630 y MIME `image/png`.
- La URL del `og:image` incorpora una versión derivada de `updated_at` o `published_at` para invalidar cachés sociales cuando la nota cambia.
- Las URLs sociales y canonical se construyen con el host real de la solicitud pública, respetando `X-Forwarded-Host` y `X-Forwarded-Proto`, para no publicar accidentalmente URLs internas o de otro dominio.
- Cada artículo incluye JSON-LD `Article` y `BreadcrumbList`, con fecha de publicación/modificación, imágenes, autor y publisher Gaspronal.
- El metadata global mantiene `metadataBase`, identidad de autor/editor y directivas para permitir previews grandes de imagen.
- No depender únicamente de la imagen editorial original como `og:image`: WhatsApp y redes deben recibir la tarjeta de marca generada específicamente para social sharing.



## 23. Atención comercial de Claudio por WhatsApp

El WhatsApp comercial conectado mediante el driver Baileys es atendido automáticamente por el agente `claudio`.

Reglas de arquitectura:

- los mensajes entrantes se reciben exclusivamente en `realtime`, se persisten en Laravel antes de ejecutar el agente y se responden por el mismo proveedor que recibió el mensaje;
- `communication_conversations` y `communication_messages` son la fuente de verdad del historial multicanal; no reutilizar las sesiones internas del chat del dashboard para clientes externos;
- cada conversación WhatsApp pertenece a `claudio`; otros agentes no deben responder ese canal sin una decisión explícita posterior;
- el runtime procesa mensajes nuevos de Baileys (`messages.upsert` tipo `notify`) y serializa el procesamiento por conversación para evitar respuestas concurrentes;
- el número del remitente se obtiene del canal y se inyecta como contexto confiable a Claudio;
- si el número coincide con un `users.whatsapp`, la conversación se vincula al usuario; `register_customer` completa esa vinculación después del consentimiento expreso;
- `handoff_to_human` cambia la conversación a `waiting_human`; `human_active` bloquea nuevas respuestas automáticas hasta que un asesor devuelva la conversación a `active`;
- el dashboard de Claudio es el único perfil de agente que muestra la bandeja de conversaciones WhatsApp;
- las respuestas humanas salen por el mismo `communication_provider` de la conversación;
- una conversación cerrada se reactiva automáticamente si el cliente vuelve a escribir;
- los mensajes entrantes se deduplican por conversación e identificador externo;
- el acceso público a WhatsApp debe conservarse visible y mobile-first en las rutas públicas, pero no en dashboard ni autenticación.


## 24. Canales WhatsApp de botón / enlace

Los canales de comunicación soportan un driver no transaccional `whatsapp_link` para CTA públicos.

Reglas:
- `whatsapp_link` pertenece al canal `whatsapp`, pero no utiliza Baileys, QR, sesión ni credenciales.
- Su configuración mínima es un `name` identificador y `settings.whatsapp` en formato internacional E.164.
- No participa en `routeAndSend`, fallback, prioridades de mensajería ni reconexión automática.
- Se utiliza como referencia administrable para botones/enlaces públicos de WhatsApp en Gaspro-notas, productos, servicios, heroes u otras secciones.
- La interfaz de Canales debe mostrarlo como “WhatsApp · Botón / enlace” y ocultar acciones de conectar/probar.
- No duplicar números de CTA dentro del frontend cuando exista un canal `whatsapp_link` destinado a ese uso.


## 25. Rama B2U Jeans y despliegue aislado

La rama `b2ujeans` es una adaptación visual y operativa separada de Gaspronal para el demo B2U Jeans. No debe mezclarse con el despliegue de `main` ni con los contenedores `gaspronal-*`.

### Infraestructura vigente

- rama obligatoria: `b2ujeans`;
- ruta VPS: `/var/www/demo.pereira.expert/public`;
- frontend público: `https://demo.pereira.expert`, host port `6500` -> container port `3000`;
- backend público: `https://backend.demo.pereira.expert`, host port `6501` -> Nginx port `80`;
- backend PHP-FPM: servicio/container `b2u-backend`, puerto interno `9000`;
- MariaDB aislada: servicio/container `b2u-mariadb`, base `b2u`;
- archivo Compose canónico: `docker-compose.b2u.yml`;
- configuración Nginx exclusiva de B2U: `backend/docker/nginx/b2u.conf`;
- script canónico de despliegue: `deploy-b2ujeans.sh`;
- nombre de proyecto Docker Compose heredado y canónico en este VPS: `public`. Se conserva deliberadamente para adoptar sin pérdida los contenedores y volúmenes creados durante la primera puesta en marcha.

El realtime no forma parte todavía del despliegue B2U. Debe incorporarse únicamente cuando el responsable lo solicite; no reutilizar silenciosamente el realtime de Gaspronal.

### Regla de despliegue B2U después de cada actualización

Después de cada cambio/push destinado al demo B2U se debe desplegar ejecutando desde la raíz del VPS:

```bash
bash deploy-b2ujeans.sh
```

El script es la fuente de verdad del despliegue B2U y debe:

1. adquirir un lock para impedir dos despliegues simultáneos;
2. hacer `git fetch origin b2ujeans`;
3. cambiar explícitamente a `b2ujeans` y sincronizar con `origin/b2ujeans` mediante `git reset --hard`;
4. preservar `backend/.env`: nunca crearlo, reemplazarlo, imprimirlo ni versionar sus secretos;
5. validar que exista una `APP_KEY` no corrupta; nunca regenerarla automáticamente en un despliegue normal porque existen datos cifrados que dependen de ella;
6. construir las imágenes de backend y frontend;
7. levantar la MariaDB aislada y recrear el backend con el entorno actual;
8. garantizar permisos de `bootstrap/cache` y `storage` dentro del contenedor;
9. ejecutar `composer install --no-dev --optimize-autoloader --no-interaction`;
10. ejecutar `php artisan optimize:clear`;
11. ejecutar siempre `php artisan migrate --force`;
12. ejecutar siempre `php artisan db:seed --force`;
13. generar caché de configuración y vistas de producción;
14. publicar/recrear Nginx y frontend;
15. verificar health local del backend en `127.0.0.1:6501/api/v1/health` y del frontend en `127.0.0.1:6500/`;
16. terminar con error no-cero si cualquier etapa falla.

### Catálogo B2U desde sitemap oficial

La fuente autorizada para poblar categorías y productos del demo B2U es:

`https://www.b2ujean.com/wp-sitemap.xml`

Reglas obligatorias:

- `B2UJeanCatalogSeeder` recorre el índice de sitemap y todos sus sitemaps hijos hasta agotar la cola, sin asumir un único archivo de productos;
- descubre URLs `/product-category/` y `/product/` y elimina duplicados antes de importar;
- procesa primero categorías y luego todos los productos;
- para cada producto intenta extraer JSON-LD `Product`, SKU, descripción, categorías WooCommerce, galería, atributos, precio/moneda de origen, disponibilidad y metadata SEO;
- las imágenes se conservan como URLs públicas de origen en `gallery` y `og_image`; no descargar copias durante el seeding salvo decisión posterior;
- el SKU de WooCommerce se guarda en `reference`;
- precio, moneda, disponibilidad y categorías originales se conservan en `specifications`/`legacy_meta`, porque el esquema B2U actual no tiene columnas comerciales específicas para precio;
- el seeder realiza hasta tres pasadas sobre productos fallidos, además de reintentos HTTP por solicitud;
- si después del loop queda una sola URL de producto sin procesar, el seeder falla y no debe registrar la importación como completada;
- nunca aceptar una importación con cero productos;
- el dominio permitido para crawling queda restringido a `b2ujean.com` / `www.b2ujean.com`;
- `B2U_SOURCE_SITEMAP` puede sobrescribir la URL del sitemap por entorno, pero el valor por defecto es el sitemap oficial anterior;
- el seeder usa `updateOrCreate`, por lo que puede relanzarse manualmente de forma idempotente con `php artisan db:seed --class=Database\\Seeders\\B2UJeanCatalogSeeder --force`;
- en el `DatabaseSeeder` general se ejecuta una sola vez mediante `seeder_runs`; para una resincronización posterior debe invocarse la clase directamente;
- en la rama `b2ujeans` no ejecutar `LegacyProductsSeeder` ni `LegacyServicesSeeder`, porque pertenecen al catálogo Gaspronal y reintroducirían categorías/productos ajenos;
- el importador no borra productos B2U que hayan desaparecido del sitio fuente; cualquier política destructiva de sincronización debe aprobarse por separado.

### Seeders y repetibilidad

El despliegue ejecuta los seeders en cada actualización. Por tanto, todo seeder nuevo que vaya a formar parte de `DatabaseSeeder` debe ser idempotente o quedar protegido por el mecanismo `seeder_runs`/`runOnce` cuando corresponda.

Actualmente `DatabaseSeeder`:

- protege con `runOnce` los seeders históricos de contenido/proveedores/modelos/permisos base;
- usa `updateOrCreate` para la cuenta administrativa cuando las variables de entorno existen;
- ejecuta `AccessControlSeeder` como sincronización idempotente de roles/permisos;
- ejecuta `HeroSlideSeeder` de forma idempotente y no destructiva.

No agregar al flujo automático seeders destructivos, truncados, borrados masivos ni fixtures de prueba.

### Variables y secretos

- `backend/.env` es el archivo real de configuración del backend B2U y se mantiene fuera de Git.
- `docker-compose.b2u.yml` se ejecuta con `--env-file backend/.env` para interpolar las credenciales de base sin hardcodearlas en el repositorio.
- `DB_HOST` dentro del contenedor siempre se fuerza a `b2u-mariadb`.
- `DEPLOYMENT_ENABLED` y `AUTODEPLOY_ENABLED` permanecen desactivados en B2U.
- No copiar claves, contraseñas, tokens SMTP, JWT, API keys o credenciales de Gaspronal al repositorio.
- En una instalación nueva debe configurarse también `DB_ROOT_PASSWORD` antes de inicializar el volumen MariaDB. Un volumen ya inicializado conserva sus credenciales originales aunque cambie una variable posteriormente.

### Decisiones tomadas durante la puesta en marcha del 6 de octubre de 2026

- El frontend B2U quedó operativo en `6500`.
- El backend B2U quedó operativo en `6501`.
- Se creó una MariaDB independiente para B2U.
- Se corrigió el upstream Nginx: B2U debe resolver `b2u-backend:9000`, no `backend:9000`.
- Se comprobó comunicación frontend -> backend y health HTTP correcto.
- Se corrigió la carga de entorno para usar `backend/.env` en lugar del antiguo `backend/.env.b2u`.
- El entorno correcto es `APP_ENV=production`, `APP_DEBUG=false`, `APP_NAME=B2U Jeans` y el URL del backend B2U configurado por entorno.
- La `APP_KEY` quedó corregida a una única clave válida; no debe volver a generarse durante despliegues ordinarios.
- Las migraciones se ejecutaron correctamente y una segunda ejecución devolvió `Nothing to migrate`.
- Los seeders terminaron correctamente y sus ejecuciones repetidas deben seguir siendo seguras.
- El home público respondió HTTP 200 y mostró identidad B2U, sin referencias visibles a Gaspronal en el HTML comprobado.
- Next.js puede advertir que imágenes de más de 2 MB no entran en Data Cache; esa advertencia no implica pérdida de conectividad con el backend y debe resolverse optimizando assets, no ocultando el error.

### Incidencia de adopción del stack inicial

- Conflicto detectado el 6 de octubre de 2026: el primer intento del script canónico creó el proyecto Compose `b2ujeans`, pero los contenedores existentes `b2u-mariadb`, `b2u-backend` y `b2u-backend-nginx` habían sido creados previamente por Compose bajo el proyecto `public`.
- Docker rechazó crear otro `/b2u-mariadb` porque el nombre ya estaba ocupado. No era un fallo de MariaDB ni de la imagen; era una incompatibilidad de ownership de Compose.
- Para preservar la base ya inicializada y sus volúmenes `public_b2u_*`, el despliegue B2U usa explícitamente el proyecto Compose `public` (`-p public` y `name: public`). No eliminar el contenedor ni el volumen de MariaDB para “resolver” este conflicto.
- El intento fallido pudo dejar una red `b2ujeans` y un volumen vacío `b2ujeans_b2u_mariadb`; no son la fuente de verdad y no deben sustituir `public_b2u_mariadb`.
- El frontend manual `b2ujeans-frontend` se elimina solo durante la primera adopción si no pertenece al proyecto Compose `public`. En ejecuciones posteriores el script lo conserva y Compose lo administra normalmente.

### Compatibilidad con el despliegue manual previo

Antes de introducir el Compose canónico, el frontend se levantó manualmente como `b2ujeans-frontend`. El script detecta ese contenedor heredado y lo elimina únicamente cuando no pertenece al proyecto Compose `public`, evitando el conflicto de nombre durante la primera migración al despliegue automatizado.

### Contraseñas en despliegues B2U
- `DatabaseSeeder` usa `ADMIN_EMAIL` / `ADMIN_PASSWORD` únicamente para bootstrap con `firstOrCreate`.
- Un despliegue nunca debe sobrescribir la contraseña de un usuario existente.
- Los cambios o recuperaciones de contraseña pertenecen al flujo de autenticación y deben persistir entre despliegues.


### Historial operativo de Jorge
- La ficha `/dashboard/agentes/jorge` muestra dos tabs en el panel de investigación: `Actual` y `History`.
- `Actual` conserva estado, progreso, producto en curso y controles Play/Pausa/Stop.
- `History` lista hasta 100 productos procesados o en proceso, con ID, referencia, estado, cantidad de imágenes, fecha y error si aplica.
- La fuente del historial es `GET /api/v1/agents/jorge/research/history` y requiere `agents.view`.
- El frontend refresca estado e historial cada 5 segundos mientras la ficha de Jorge está abierta.
