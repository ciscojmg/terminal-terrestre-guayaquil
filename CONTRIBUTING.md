# Guía para contribuir

Gracias por tu interés en mejorar la información del Terminal Terrestre de Guayaquil.

**Nota:** Si despliegas el sitio (ej. GitHub Pages), reemplaza `https://terminal-terrestre-guayaquil.example.com` por tu URL real en: `index.html`, `cooperativa.html`, `sitemap.xml` y `robots.txt`. Este proyecto se alimenta de la comunidad a través de pull requests.

## Cómo agregar una cooperativa

1. **Edita** el archivo `data/cooperativas.json`
2. **Añade** un nuevo objeto siguiendo la estructura existente:

```json
{
  "id": "slug-unico-cooperativa",
  "nombre": "Nombre de la Cooperativa",
  "boleteria": 45,
  "imagen": "https://url-de-imagen-o-assets/images/nombre.jpg",
  "tipoServicio": "SERVICIO PREMIUM",
  "terminal": "principal",
  "ubicacion": {
    "boleteria": 45,
    "piso": "Planta Baja",
    "referencia": "Descripción para ubicarse en el terminal"
  },
  "servicios": ["Wi-Fi Gratis", "Aire Acond.", "Peliculas", "Reclinables"],
  "rutaPrincipal": {
    "origen": "Guayaquil",
    "destino": "Destino",
    "tipo": "Directo",
    "pasaje": 5.5,
    "duracion": "2h 45m aprox.",
    "distancia": "145 km"
  },
  "horarios": {
    "descripcion": "Salidas cada hora desde Guayaquil",
    "salidas": ["05:00", "06:00", "07:00"]
  },
  "contacto": {
    "oficina": "Dirección en el terminal",
    "telefono": "(04) 213-0456 / 099-123-4567",
    "web": "https://www.cooperativa.com.ec"
  }
}
```

3. **Imágenes:** Si usas una imagen local, súbela en `assets/images/` y referencia la ruta en el campo `imagen`. Puedes usar URLs externas (ej. Unsplash) mientras tanto.

4. **Sitemap:** Si agregas una cooperativa nueva, añade su URL en `sitemap.xml`:

```xml
<url>
  <loc>https://tu-dominio.com/cooperativa.html?id=slug-unico-cooperativa</loc>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

## Cómo aparecer como contribuidor

La lista de contribuidores se actualiza **automáticamente** desde la API de GitHub cuando se hace merge de un pull request en el repositorio [ciscojmg/terminal-terrestre-guayaquil](https://github.com/ciscojmg/terminal-terrestre-guayaquil).

**No necesitas editar CONTRIBUTORS.json manualmente.** Cuando tu PR sea aceptado y fusionado, un GitHub Action actualizará la lista y tu avatar aparecerá en la sección de contribuidores.

## Destinos populares

Los destinos de la sección "Destinos Populares" se **extraen automáticamente** de las cooperativas. Cada destino único en `rutaPrincipal.destino` se muestra. No es necesario editar archivos de destinos por separado.

## Formato del JSON

- El `id` debe ser único, en minúsculas y sin espacios (usar guiones).
- Los campos `nombre`, `ubicacion`, `contacto` son obligatorios para una cooperativa útil.
- `terminal` puede ser `"principal"` o `"pascuales"`.
- `servicios` es un array de strings.
- `horarios.salidas` es un array de strings con formato "HH:MM".

## Validación

Antes de enviar tu PR, verifica que:

1. El JSON es válido (puedes usar [jsonlint.com](https://jsonlint.com))
2. No hay cooperativas duplicadas (mismo `id`)
3. Las URLs de imágenes son accesibles

¡Gracias por contribuir!
