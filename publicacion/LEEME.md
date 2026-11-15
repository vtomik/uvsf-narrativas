# Archivo para subir a Webuzo

**[Descargar polifonia-del-cuidado-web.zip](https://github.com/vtomik/uvsf-narrativas/raw/refs/heads/main/publicacion/polifonia-del-cuidado-web.zip)**

Si se abre la página del archivo, pulsa **Download raw** (el icono de descarga).

Este ZIP contiene la web ya compilada, lista para publicar. Sube el archivo a la carpeta `narrativas` dentro de la raíz de tu dominio en Webuzo (normalmente `public_html/narrativas`) y pulsa **Extract / Extraer**. Dentro de esa carpeta deben quedar `index.html`, `favicon.svg`, `assets/`, `licencias/` y `materiales/`.

Después visita tu dominio con `/narrativas/` al final.

El archivo corresponde a la versión para teléfonos y PC: interfaz perla y cobalto, navegación inferior móvil y barra lateral en PC, pantalla de carga inicial, pausas visuales entre escenas, 42 partículas (28 en móvil), revelación gradual de la pregunta, reflexión ampliada por voz con fundamentos de Pimentel y Ricoeur, animaciones automáticas, cambio de voz al deslizar, lector a pantalla completa, poemas originales y QR. Se eliminó por completo el sonido ambiental. La interfaz se centra en la lectura: no muestra enlaces de descarga al seminario, al fanzine ni al Word, y tampoco un botón de instalación. Para actualizarlo después de cambiar el código, ejecuta `npm run package:web`; esto compila y regenera este ZIP.
