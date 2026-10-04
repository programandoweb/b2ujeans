# Skill: Image Migration

Detecta imágenes relacionadas con la ficha, descarga únicamente respuestas cuyo Content-Type sea `image/*` y guárdalas localmente.
Ruta obligatoria: `public/images/uploads/agente/{id_producto}/`.
La primera imagen es `image.ext`; las siguientes `image-2.ext`, `image-3.ext`, etc.
Actualiza `gallery` y usa la primera imagen como `og_image`.
