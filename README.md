# Polifonía del cuidado

Una aplicación web de Medicina Narrativa pensada primero para teléfonos, para el seminario de la Universidad de Valparaíso, Campus San Felipe, del 20 de noviembre de 2026. Cuatro pantallas con navegación inferior en teléfono, distribución amplia con barra lateral en PC, ilustraciones originales en SVG y tipografías incluidas en la app.

## Qué incluye

- Inicio, colección de poemas y presentación del proyecto.
- Inicio compacto, barra inferior permanente, lector a pantalla completa y paneles que se abren desde abajo. Las áreas de toque y el espacio inferior se adaptan a teléfonos con barra de gestos.
- Respuesta visual suave al tocar controles y transiciones cortas entre pantallas, con alternativa sin movimiento.
- Opción de añadir a la pantalla de inicio del teléfono cuando el navegador lo permite, con iconos y modo standalone. Requiere HTTPS y conexión; no ofrece uso sin internet.
- Recorrido participativo: escena ficticia → tres mensajes no enviados → elección de una voz → reflexión específica y preguntas para conversar.
- Los **tres poemas íntegros** de Joel Jara, extraídos del Word original: 60 versos, títulos, puntuación y estrofas conservados. Incluye el Word original para descargar.
- Lector con tamaño de texto ampliable, lectura continua, fanzine para imprimir y PDF descargable.
- Generación de QR en el navegador: permite ingresar la dirección publicada y descargar una imagen PNG para el stand.
- Navegación por teclado, diálogos accesibles, contraste revisado y respeto por la preferencia de movimiento reducido.
- Pantalla inicial de carga, pausas visuales breves entre escenas y revelación gradual de la pregunta, sin porcentajes de progreso ficticios. Las pausas se omiten con movimiento reducido.
- Experiencia inmersiva con 42 partículas en capas (28 visibles en teléfono), hilos que conectan las voces y colores según la perspectiva.
- Reflexión ampliada para cada voz: lectura, tensiones y gestos concretos de cuidado; fundamentos de perspectiva y focalización de Luz Aurora Pimentel e interpretación de Paul Ricoeur, con referencias desplegables.
- Paleta perla y cobalto, con un espacio azul nocturno para la experiencia. En teléfonos puedes deslizar horizontalmente los mensajes para cambiar de voz; las pestañas siguen disponibles para todos.

No necesita servidor de aplicación, base de datos, claves ni registro. No usa analítica, cookies ni almacenamiento de elecciones. Los recursos y las fuentes se sirven desde el propio sitio.

Las animaciones y transiciones se activan automáticamente; no hay controles para encenderlas ni motor de audio. Se respeta la preferencia de movimiento reducido del dispositivo y se pausa la animación ambiental al ocultar la pestaña. No se guardan preferencias.

## Publicarla sin programar

**[Descargar el ZIP listo para Webuzo](https://github.com/vtomik/uvsf-narrativas/raw/refs/heads/main/publicacion/polifonia-del-cuidado-web.zip)**. También está en la carpeta [`publicacion/`](publicacion/LEEME.md) de este repositorio.

Si recibiste `polifonia-del-cuidado-web.zip`:

1. Descomprime el ZIP. La carpeta resultante contiene `index.html`, `assets/` y `materiales/`.
2. En [Netlify Drop](https://app.netlify.com/drop), arrastra **la carpeta descomprimida completa**. Sigue los pasos del servicio para conservar la publicación.
3. Abre la dirección pública que entrega Netlify. En la web, pulsa **Compartir**, comprueba la dirección y descarga el QR.

También puedes subir el **contenido** de esa carpeta a `public_html` en cualquier hosting estático. Mantén juntos `index.html`, `assets/` y `materiales/`. No subas `src/` ni `node_modules/` como sitio público.

El sitio funciona en la raíz de un dominio o en una subcarpeta. Las rutas usan `#/experiencia`, `#/poemas` y `#/proyecto`, por lo que no necesitan reglas especiales del hosting. Para probarlo localmente, usa un servidor HTTP; abrir el HTML con doble clic (`file://`) no es el flujo soportado.

**El paquete está preparado para publicar. Crearlo no publica el sitio ni genera una URL pública.** El QR debe apuntar a la URL pública definitiva, nunca a `localhost`.

## Desarrollar

Requiere Node.js 22.12 o posterior y npm.

```sh
npm ci
npm run dev
```

Para compilar y revisar la versión que se publicará:

```sh
npm run build
npm run preview
```

La carpeta publicable es `dist/`. Para generar también el ZIP listo para Webuzo ejecuta `npm run package:web` (requiere Python 3). El resultado queda en `publicacion/polifonia-del-cuidado-web.zip`. En Netlify o Vercel con integración Git, usa `npm run build` como comando y `dist` como directorio de salida. Se incluye `netlify.toml` con estos valores.

Para GitHub Pages se incluye un workflow. Tras subir el código a `main`, selecciona **Settings → Pages → Source: GitHub Actions** en el repositorio. El workflow compila y publica `dist/` sin claves externas.

## Verificaciones

```sh
npm test
```

Compila la versión de producción y ejecuta pruebas de Playwright en escritorio y celular. Verifica las tres elecciones y sus reflexiones, lectura completa, diálogos y foco, descarga del Word, generación y descarga del QR, impresión, navegación, recursos locales, ausencia de almacenamiento de respuestas, animaciones automáticas, ausencia de audio, gestos de cambio de voz, distribución en PC, anchos de 320–1440 px y accesibilidad automática con axe. Usa Chromium del sistema cuando está disponible; en otra máquina instala el navegador con `npx playwright install chromium`.

Para comparar **el texto exacto con el Word original**, con Python 3.10 o posterior (solo biblioteca estándar):

```sh
npm run verify:poems
```

La comparación incluye contexto, títulos, estrofas, versos y los fragmentos usados como mensajes no enviados. Las preguntas y reflexiones son textos de acompañamiento, separados de los poemas.

## Fanzine PDF

`public/materiales/fanzine.pdf` es la versión imprimible de la colección. Para regenerarla después de un cambio deliberado de contenido o diseño de impresión:

```sh
npm run build
npm run export:fanzine
npm run build
```

El script utiliza Playwright y el navegador Chromium para imprimir la web en A4. La última compilación incorpora el PDF actualizado en `dist/`. También se puede usar **Imprimir fanzine** en la página Los poemas y elegir “Guardar como PDF”.

## Archivos importantes

La navegación y el feedback táctil están en `src/AppNavigation.tsx` y `src/TouchFeedback.tsx`. El diseño de teléfono está en `src/phone-app.css`; `src/install.ts` gestiona la instalación opcional. Sus pruebas están en `tests/phone.spec.ts`.

La atmósfera y sus controles están en `src/Immersion.tsx` y `src/immersion.css`. La nueva identidad visual está en `src/redesign.css` y las transiciones en `src/refinements.css`. Sus pruebas específicas están en `tests/immersion.spec.ts` y `tests/responsive-redesign.spec.ts`.

| Archivo               | Función                                             |
| --------------------- | --------------------------------------------------- |
| `src/data/poems.json` | Texto de los poemas y contexto, extraídos del Word. |
| `src/App.tsx`         | Páginas, recorrido, reflexiones, lector y QR.       |
| `src/Artwork.tsx`     | Ilustraciones vectoriales originales.               |
| `src/styles.css`      | Diseño y adaptación a diferentes pantallas.         |
| `src/print.css`       | Composición A4 del fanzine.                         |
| `public/materiales/`  | Word original, documento del seminario y fanzine.   |
| `tests/app.spec.ts`   | Pruebas de comportamiento y accesibilidad.          |

La situación clínica de la web sigue el documento de poemas: una paciente de 68 años y un diagnóstico de Alzheimer. El PDF del seminario presenta una escena más general de espera de resultados; se tomó el documento poético como fuente de la escena concreta. La fundamentación en Pimentel y Ricoeur y los roles del equipo provienen de la propuesta del seminario.

Los textos originales y documentos corresponden al material proporcionado por el equipo. Las tipografías son DM Sans y Cormorant Garamond, distribuidas bajo SIL Open Font License; sus licencias se incluyen en `public/licencias/`. Los iconos son Lucide, bajo ISC.
