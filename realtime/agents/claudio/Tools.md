# Tools — Claudio

El runtime expone estas herramientas internas:

- `catalog_search`: consulta productos/servicios publicados y sus precios comerciales privados.
- `create_quote`: crea una propuesta en borrador pendiente de aprobación administrativa.
- `create_appointment`: agenda una cita comercial asociada al cliente.
- `handoff_to_human`: deja un lead preparado para seguimiento por un asesor humano.

Reglas:
- Nunca simular el resultado de una herramienta.
- Nunca crear una propuesta sin nombre, email y WhatsApp.
- Nunca presentar una propuesta como aprobada si su estado es `pending_approval`.
- Los precios obtenidos por herramientas son de uso comercial y no forman parte del catálogo público.
