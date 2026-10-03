# Stack tecnológico oficial

## Backend

- PHP 8.2 como plataforma mínima y explícita.
- Laravel 12.
- MariaDB.
- JWT mediante `php-open-source-saver/jwt-auth` para autenticación API del dashboard.
- Spatie Laravel Permission para roles y permisos.
- Laravel Sanctum se conserva como dependencia base heredada del patrón de ivoolveERP para futuros casos compatibles; no es el guard principal del dashboard en esta foundation.
- Dedoc Scramble para documentación OpenAPI.
- PHPUnit, Mockery, Collision y Laravel Pint para calidad.

## Frontend

- Next.js 16.3.3.
- React 19.3.
- TypeScript 5.9.
- Tailwind CSS 4.
- Motion.
- Lucide React.
- CVA, clsx y tailwind-merge para primitives.
- Playwright para pruebas visuales/E2E.
- ESLint.

## Seguridad de autenticación

Laravel emite el JWT. Next.js actúa como BFF para el login y conserva el token en cookie `HttpOnly`; el navegador no recibe el JWT mediante JavaScript de la aplicación.

El dashboard se protege en dos niveles:

1. proxy de Next.js para impedir navegación anónima;
2. validación real del JWT contra Laravel mediante `/api/v1/auth/me`.

La autorización definitiva siempre pertenece a Laravel/Spatie.

## Nota de origen

La foundation toma como referencia técnica el repositorio `programandoweb/ivoolveERP`: Laravel 12, PHP 8.2, Sanctum, Scramble, PHPUnit/Pint y Next.js 16/React 19/Motion/Playwright. JWT y Spatie se incorporan explícitamente por decisión del proyecto Gaspronal.
