# Archivo para subir a Webuzo

**[Descargar polifonia-del-cuidado-web.zip](https://github.com/vtomik/uvsf-narrativas/raw/refs/heads/main/publicacion/polifonia-del-cuidado-web.zip)**

Si se abre la página del archivo, pulsa **Download raw** (el icono de descarga).

Este ZIP contiene la web ya compilada, lista para publicar. Sube el archivo a la carpeta `narrativas` dentro de la raíz de tu dominio en Webuzo (normalmente `public_html/narrativas`) y pulsa **Extract / Extraer**. Dentro de esa carpeta deben quedar `index.html`, `favicon.svg`, `assets/`, `licencias/` y `materiales/`.

Después visita tu dominio con `/narrativas/` al final.

El archivo corresponde a la versión inmersiva: poemas originales, animaciones, ambiente sonoro opcional, QR y fanzine. Para actualizarlo después de cambiar el código, compila con `npm run build` y crea un ZIP con el contenido de `dist/`.
