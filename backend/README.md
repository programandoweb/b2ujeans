# Gaspronal Backend

Laravel 12 compatible con PHP 8.2.

## Instalación

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
php artisan serve
```

Healthcheck:

```text
GET /api/v1/health
```

Autenticación JWT:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

El dashboard debe autorizarse siempre desde Laravel/Spatie; la protección del frontend no reemplaza la autorización del backend.
