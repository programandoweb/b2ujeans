# Autodeploy de Gaspronal

Este directorio documenta el acceso externo al despliegue de Gaspronal.

## Endpoint

`POST https://backend.gaspronal.programandoweb.net/api/v1/autodeploy/deploy`

Autenticación:

`Authorization: Bearer <AUTODEPLOY_TOKEN>`

El token nunca se almacena en Git. Debe vivir únicamente en `backend/.env`.

## Seguridad

- el endpoint no acepta comandos;
- solo dispara el flujo fijo de Gaspronal;
- máximo 2 intentos por minuto;
- rechaza un nuevo despliegue si ya existe uno en cola o ejecución;
- el despliegue queda registrado en la tabla `deployments`;
- la respuesta nunca devuelve el token.

## Configuración del servidor

Generar un token fuerte directamente en el VPS:

```bash
php -r 'echo bin2hex(random_bytes(48)), PHP_EOL;'
```

Agregarlo manualmente a `backend/.env`:

```dotenv
AUTODEPLOY_ENABLED=true
AUTODEPLOY_TOKEN=<token-generado-en-el-servidor>
```

Después ejecutar el despliegue normal una vez para cargar el nuevo código/configuración.

El script raíz `autodeploy.sh` es un wrapper fijo sobre `scripts/deploy.sh`.
