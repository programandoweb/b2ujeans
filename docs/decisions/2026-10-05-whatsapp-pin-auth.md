# Autenticación alternativa por PIN de WhatsApp

Fecha: 2026-10-05

## Decisión

Gaspronal mantiene correo/contraseña como autenticación principal y agrega WhatsApp como método alternativo mediante un PIN de 4 dígitos.

El botón **Ingresar con WhatsApp** se muestra únicamente cuando existe al menos un proveedor WhatsApp habilitado y el runtime Baileys reporta estado `connected`.

## Contrato del usuario

- `users.whatsapp` es nullable y único.
- Se persiste en formato internacional E.164, por ejemplo `+573115000926`.
- El formulario administrativo expone el campo WhatsApp y el backend vuelve a validar el formato.

## Seguridad

- PIN de 4 dígitos.
- Hash del PIN en base de datos; nunca se persiste el valor plano.
- Vigencia configurable, 5 minutos por defecto.
- Máximo configurable de intentos, 5 por defecto.
- Un solo uso.
- Solicitar un PIN invalida los anteriores del usuario.
- Rate limit en solicitud y verificación.
- Respuesta neutra al solicitar para no revelar si el teléfono existe.
- El resultado exitoso genera el mismo JWT que el login tradicional.

## Infraestructura

Laravel consulta y utiliza el servicio `realtime` ya existente mediante `REALTIME_INTERNAL_URL`. El envío se realiza por `POST /api/channels/send/whatsapp`, reutilizando el ruteo y la conexión Baileys existentes.

No se crea un segundo sistema de proveedores ni una conexión WhatsApp paralela.
