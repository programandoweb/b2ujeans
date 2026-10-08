# B2uJeans

Modernización tecnológica del activo digital de **B2uJeans Industrias y Servicios S.A.S.**

## Objetivo

Este proyecto no busca reemplazar la identidad ni reconstruir arbitrariamente el portal existente. El objetivo es **modernizar el activo digital conservando su estructura, contenido, catálogo, identidad visual y patrimonio SEO**.

Se preservarán como punto de partida:

- estructura conceptual del sitio actual;
- categorías y productos;
- fotografías y fichas técnicas;
- servicios;
- Gaspro-notas;
- contenido institucional;
- sedes y canales de contacto;
- URLs con valor SEO mediante redirecciones controladas;
- colores base e identidad visual de B2uJeans.

## Arquitectura objetivo

- **Web pública / PWA:** Next.js + TypeScript.
- **Sistema visual:** Tailwind CSS.
- **Backend / CRM / CMS:** Laravel.
- **Base de datos:** MariaDB.
- **Dashboard:** privado, autenticado y autorizado.
- **SEO:** metadatos dinámicos, JSON-LD, sitemap, canonical, Open Graph y redirecciones 301.
- **Integraciones:** WhatsApp, mapas, analítica y proveedores externos mediante adaptadores.

## Recuperación de contraseña

El flujo utiliza el Password Broker estándar de Laravel:

- `POST /api/v1/auth/forgot-password`: respuesta neutra y rate limit de 5 solicitudes cada 15 minutos por IP/correo.
- `POST /api/v1/auth/reset-password`: valida token, correo, contraseña y confirmación; el token usado queda invalidado.
- Frontend público: `/forgot-password` y `/reset-password?token=...&email=...`.
- Correo Blade: `resources/views/emails/auth/reset-password.blade.php`.
- Imagen definitiva: `backend/public/images/programandoweb/default/recover.png`; mientras no exista se muestra un fallback.
- Configuración: `FRONTEND_URL` y variables `MAIL_*` estándar. Tras cambiar el `.env` en producción ejecutar `php artisan optimize:clear`.

El JWT actual no dispone de blacklist/revocación global por cambio de contraseña. El reset no inventa un mecanismo paralelo: los JWT previamente emitidos conservan su vigencia configurada; los nuevos inicios de sesión requieren la contraseña nueva.

## Principio UX

La experiencia móvil es prioritaria. No basta con que el sitio "responda" a diferentes anchos: cada flujo público y administrativo debe diseñarse y validarse específicamente para teléfonos.

## Documentación obligatoria

Antes de modificar código, cualquier desarrollador o agente de IA debe leer:

1. `Agent.md`
2. `docs/PLAN_TRABAJO.md`
3. `docs/ARQUITECTURA.md`
4. `docs/SEO_MIGRATION.md`

`Agent.md` es la autoridad operativa del repositorio.
