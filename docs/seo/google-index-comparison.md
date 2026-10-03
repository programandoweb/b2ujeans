# Comparación de índice Google vs. inventario legado

Fecha: 2026-10-03

## Fuente secundaria

Consulta de referencia:

`site:gaspronal.com`

El enlace directo de resultados de Google puede variar por sesión, dispositivo y personalización. La verificación se realizó contra resultados públicos indexados para el dominio y consultas auxiliares por familias de URL.

## Gaspro-notas visibles en el índice consultado

Se confirmaron 13 publicaciones editoriales en los resultados recuperables:

1. `gaspronal-industrias-y-servicios-sas-ahora-es-una-marca-registrada`
2. `recomendaciones-para-abrir-tu-pizzeria`
3. `13-anos-de-gaspronal-la-marca-de-amor-calidad-y-esfuerzo-`
4. `si-gaspronal-en-maridaje-2019`
5. `rancho-de-occidente-vivio-la-experiencia-con-gaspronal-en-la-fabricacion-de-cocina`
6. `gaspronal-ya-forma-parte-del-tour-gastronomico-de-medellin-un-fascinante-sabor-al-paladar`
7. `come-y-conoce-4-datos-curiosos-de-los-restaurantes`
8. `la-freidora-como-equipo-ideal-para-las-salchipapas-la-comida-rapida-preferida-en-medellin`
9. `conoce-las-ventajas-de-los-equipos-mixtos-para-empotrar`
10. `gaspronal-presenta-la-nueva-opcion-para-los-amantes-de-los-asados`
11. `conoce-las-ventajas-de-tener-un-asador-y-arma-tu-plan-de-fin-de-semana`
12. `caso-de-exito-fabricamos-el-sistema-de-extraccion-para-twins-american-style-food`
13. `el-carro-ideal-para-preparar-perros-calientes-`

## Comparación con el primer seeder

- Publicaciones históricas del primer seeder: **26**.
- Publicaciones recuperadas desde la segunda fuente: **13**.
- Coincidencias por slug: **13**.
- Publicaciones nuevas: **0**.
- Duplicados que se insertarían: **0**.

`GoogleIndexedGasproNotasSeeder` consulta el slug antes de crear el registro. Por tanto, ejecutar `DatabaseSeeder` después de `GasproNotasSeeder` no duplica ninguna publicación.

## Diferencia SEO no editorial

Google también devuelve la raíz:

`/`

El manifiesto inicial comenzaba en `/2019/`. La raíz es una URL SEO independiente y debe mantenerse con HTTP 200 en la nueva aplicación o recibir una decisión explícita de canonical/redirect. **No se convierte en un Post**, porque no es una publicación editorial.

## Observaciones

- Google confirma además URLs ya inventariadas de productos, categorías, servicios y productos destacados.
- Se mantiene la regla de preservar slugs históricos exactamente, incluso cuando terminan en guion.
- La búsqueda `site:` no sustituye Google Search Console ni garantiza exponer el 100% del índice; sirve como segunda fuente de contraste.
