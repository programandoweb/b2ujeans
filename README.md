# Gaspronal

Modernización tecnológica del activo digital de **Gaspronal Industrias y Servicios S.A.S.**

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
- colores base e identidad visual de Gaspronal.

## Arquitectura objetivo

- **Web pública / PWA:** Next.js + TypeScript.
- **Sistema visual:** Tailwind CSS.
- **Backend / CRM / CMS:** Laravel.
- **Base de datos:** MariaDB.
- **Dashboard:** privado, autenticado y autorizado.
- **SEO:** metadatos dinámicos, JSON-LD, sitemap, canonical, Open Graph y redirecciones 301.
- **Integraciones:** WhatsApp, mapas, analítica y proveedores externos mediante adaptadores.

## Principio UX

La experiencia móvil es prioritaria. No basta con que el sitio "responda" a diferentes anchos: cada flujo público y administrativo debe diseñarse y validarse específicamente para teléfonos.

## Documentación obligatoria

Antes de modificar código, cualquier desarrollador o agente de IA debe leer:

1. `Agent.md`
2. `docs/PLAN_TRABAJO.md`
3. `docs/ARQUITECTURA.md`
4. `docs/SEO_MIGRATION.md`

`Agent.md` es la autoridad operativa del repositorio.
