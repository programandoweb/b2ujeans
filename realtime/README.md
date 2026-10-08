# B2uJeans Realtime & Agent Runtime

Servicio NestJS del monorepo B2uJeans para comunicación en tiempo real con agentes.

## Agentes iniciales

- Cristina
- Jorge
- Claudio

Las definiciones viven en `realtime/agents/<id>/`. Por ahora solo están creados; sus responsabilidades se definirán después.

## Socket.IO (canal principal)

Namespace:

```text
/agents
```

Eventos:

- `agent:list`: solicita/lista los agentes disponibles.
- `agent:message`: envía `{ "agentId": "cristina", "message": "..." }`.
- `agent:response`: respuesta del agente.
- `agent:error`: error de protocolo o autorización.

Si `AGENT_SHARED_SECRET` está configurado, conectar con:

```js
io("/agents", { auth: { token: "..." } })
```

## REST JSON (fallback)

```http
GET  /health
GET  /api/agents
POST /api/agents/:id/messages
Content-Type: application/json

{"message":"Hola","requestId":"opcional"}
```

Cuando `AGENT_SHARED_SECRET` está configurado, REST usa `Authorization: Bearer <secret>`.

## Desarrollo

```bash
npm install
npm run start:dev
```

Puerto por defecto: `4100`.
