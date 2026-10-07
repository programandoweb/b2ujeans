# Tools — Jorge

Las herramientas operativas de Jorge viven en Laravel y se ejecutan mediante el worker `agent:jorge:research-next`.

## Controles
- Play: establece la investigación en `running`.
- Pausa: conserva el avance y deja de procesar nuevos productos.
- Stop: detiene la ejecución y conserva todo lo ya migrado.

## Persistencia
- Estado global: `agent_research_runs`.
- Estado por producto: campos `legacy_research_*` de `catalog_items`.
- Imágenes: `backend/public/images/uploads/agente/{id_producto}/`.
- Fuente oficial inicial: `https://www.b2ujean.com/`.

No simular herramientas ni afirmar que una ficha fue migrada si Laravel no la marcó como `completed`.
