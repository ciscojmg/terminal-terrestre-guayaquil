# Terminal Terrestre Guayaquil

Sitio web con información práctica del Terminal Terrestre de Guayaquil: cooperativas, horarios, boleterías y rutas. Pensado para viajeros que consultan desde el celular.

## Descripción del proyecto

La página oficial del terminal no ofrece la información básica de forma clara. Este proyecto busca resolver eso con un sitio simple y enfocado en lo que necesitas:

- **Cooperativas:** Listado de todas las cooperativas con su número de boletería
- **Destinos:** Filtro por destino para ver qué cooperativas van a cada ciudad
- **Detalle:** Información completa de cada cooperativa (ubicación, servicios, horarios, contacto)
- **Ubicación:** Enlace directo a Google Maps del terminal

Los datos se alimentan desde archivos JSON en el repositorio y se actualizan mediante **pull requests** de la comunidad.

## Cómo ejecutar el proyecto

Es un sitio estático (HTML, CSS, JavaScript). Puedes abrirlo de dos formas:

**Opción 1: Servidor local**
```bash
python3 -m http.server 3000
```
Luego abre `http://localhost:3000` en el navegador.

**Opción 2: Abrir directamente**
Abre `index.html` en el navegador. Algunas funciones (como cargar el JSON) pueden requerir un servidor por restricciones de CORS.

## Estructura del proyecto

```
├── index.html          # Página principal
├── cooperativa.html    # Detalle de cada cooperativa
├── contribuir.html     # Guía de contribución
├── css/
├── js/
├── data/
│   └── cooperativas.json   # Datos de cooperativas (editar aquí)
├── assets/images/
├── CONTRIBUTORS.json   # Lista de contribuidores (actualizada por GitHub Action)
└── CONTRIBUTING.md     # Guía detallada de contribución
```

## Cómo contribuir

### 1. Agregar una cooperativa

1. Haz **fork** del repositorio
2. Edita el archivo `data/cooperativas.json`
3. Añade un nuevo objeto siguiendo la estructura existente:

```json
{
  "id": "slug-unico-cooperativa",
  "nombre": "Nombre de la Cooperativa",
  "boleteria": 45,
  "imagen": "https://url-de-imagen.jpg",
  "tipoServicio": "SERVICIO PREMIUM",
  "terminal": "principal",
  "ubicacion": {
    "boleteria": 45,
    "piso": "Planta Baja",
    "referencia": "Descripción para ubicarse"
  },
  "servicios": ["Wi-Fi Gratis", "Aire Acond.", "Reclinables"],
  "rutaPrincipal": {
    "origen": "Guayaquil",
    "destino": "Salinas",
    "tipo": "Directo",
    "pasaje": 5.5,
    "duracion": "2h 45m aprox.",
    "distancia": "145 km"
  },
  "horarios": {
    "descripcion": "Salidas cada hora",
    "salidas": ["05:00", "06:00", "07:00"]
  },
  "contacto": {
    "oficina": "Dirección en el terminal",
    "telefono": "(04) 213-0456",
    "web": "https://www.cooperativa.com.ec"
  }
}
```

4. Si agregas una cooperativa nueva, añade su URL en `sitemap.xml`
5. Envía un **pull request**

### 2. Aparecer como contribuidor

La lista de contribuidores se actualiza **automáticamente** cuando tu PR es aceptado. No necesitas editar nada manualmente; tu avatar aparecerá en la sección de contribuidores.

### 3. Destinos populares

Los destinos se extraen automáticamente de las cooperativas. Cada destino único en `rutaPrincipal.destino` se muestra en la pantalla. No hay que editar archivos de destinos por separado.

Para más detalles, consulta [CONTRIBUTING.md](CONTRIBUTING.md) o la página [contribuir.html](contribuir.html) en el sitio.

## Tecnologías

- HTML, CSS, JavaScript
- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [Material Symbols](https://fonts.google.com/icons) para iconos
- Datos en JSON estático

## Licencia

Este proyecto está abierto a contribuciones de la comunidad.
