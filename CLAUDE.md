# Portfolio "Archivo" — mapa del proyecto

Sitio estático de **Matías Cornara**. HTML/CSS/JS puro, sin build step ni
package.json. Actualizado: **2026-08-20**.

**Dos nombres, no los mezcles.** **ARCHIVO** es la versión express y es lo que se
muestra hoy: `index.html`, una sola página. **MI CAJÓN** es el proyecto grande a
largo plazo (el sistema completo con las 8 páginas de proyecto). El nombre que va
a la vista del público es **Archivo**; si aparece "Mi Cajón" en algo visible, es
un resto del desarrollo anterior y hay que sacarlo.

## Antes de tocar nada: cómo se corre

**El sitio NO funciona abriendo los HTML con doble click.** `file://` bloquea la
carga de imágenes dentro de un canvas y las animaciones quedan muertas, aunque
el código esté perfecto. Es el error que más veces nos costó una ronda entera.

```
tools\servidor.bat          ← doble click; si el puerto ya está tomado, avisa
http://localhost:8123/proyectos/simbio.html
```

- `file:///C:/Users/...` ❌ nunca. La página ahora te avisa con una barra negra.
- `http://localhost:8123/...` ✅ siempre.
- Chequeo de 2 segundos de que el servidor está vivo:
  `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8123/assets/simbio/frames-web/0000.jpg` → tiene que decir `200`.

**Rompe-cachés:** cada `<link>` y `<script>` lleva `?v=N`. Si tocás un CSS o un
JS y no subís ese número, el navegador sirve la versión vieja. Pasó varias veces.

## Estructura

`index.html`, `css/`, `js/`, `assets/`, `proyectos/`, `sandbox/`, `notas/`, `tools/`.

| Archivo | Nodos | Rol |
|---|---|---|
| `js/simbio-scroll.js` | 18 | Scroll-scrubbing del ensamble (375 frames sobre canvas) |
| `js/main.js` | 16 | Init de todo: cursor, reveals, tilt, lupa, carpetas, aviso de file:// |
| `css/archivo.css` | — | **La portada entera.** Hero + esquina, CV, herramientas, contacto, título de transición, grid de fichas, índice. Buscá `PERILLAS`. |
| `js/archivo.js` | — | El punto de fuga de la esquina del hero, y nada más |
| `sandbox/sandbox.js` | 7 | Init del sandbox (booklet, folder, cursor) |
| `js/muestras.js` | 2 | Las 3 animaciones de pieza (`armarMuestra()`) |
| `js/smooth-scroll.js` | 1 | Lenis + puente con GSAP/ScrollTrigger. **Carga primero.** |
| `js/transiciones.js` | 1 | Swup + re-init de módulos al cambiar de página |
| `tools/*.ps1` | — | Pipelines de assets (frames, fotos, recorte de alfa) |

## Arquitectura

**`simbio-scroll.js` es el centro de gravedad**, en tres bloques:

- **Carga de frames** — `iniciar()` → `hayFrames()`, `precargar()`, `cargarUna()`,
  `actualizarProgreso()`, `mostrarMensaje()`
- **Scrubbing y render** — `activarScrubbing()` → `alScrollear()`,
  `progresoDeScroll()`, `dibujar()`, `medirCanvas()`, `pintarDebug()`
- **Texto y fases** — `actualizarFase()` → `escribirFase()`, `pasoTexto()`,
  `faseDeFrame()`, `prefijoComun()`

El escenario se clava con **`position: sticky` (CSS)**, no con el `pin` de
ScrollTrigger. El scrubbing tiene **dos motores en paralelo**: el evento `scroll`
del navegador (principal) y ScrollTrigger (secundario). Los dos llaman al mismo
dibujo, que se saltea si el cuadro no cambió.

**`main.js`** tiene un único orquestador `init()`, expuesto como
`window.initComunes` para que `transiciones.js` lo vuelva a llamar después de
cada navegación de Swup. `initCursor`, `initReveal` e `initHoverReveal` están
**duplicados** en `main.js` y `sandbox.js` — son copias, no un módulo compartido.

**La portada** reparte así el trabajo: la geometría de las tres líneas de la
esquina está escrita a mano en `index.html` (con un comentario que explica cómo
moverla), y `js/archivo.js` solo le suma el vaivén al punto de fuga. Si el JS no
corre, la esquina se ve igual, quieta.

**Ojo con los nombres de clase genéricos.** `simbio.css` se carga en TODAS las
páginas, DESPUÉS del CSS de la portada, y no todo lo suyo está apellidado con
`.pag-simbio`. Su `.bloque p` ya pisó una vez al CV entero. Antes de estrenar un
nombre como `.bloque`, `.item`, `.fila` o `.grupo`, grepealo contra `simbio.css`.

## Reglas de diseño que no se negocian

1. **Cuatro columnas para todo.** Nada se coloca a ojo. `?grid` en la URL las
   dibuja encima para verificar. La nav es la grilla: un botón por columna.
2. **En Simbio: imagen en las columnas 1-2, texto en 3-4** (invertido en las
   pantallas de pieza, donde el objeto se lleva 2-3-4).
3. **Un solo acento** (verde `#5A6E32`), idéntico en zona crema y en zona negra.
4. **Una sola familia: ARCHIVO.** Nunito + IBM Plex Mono quedaron afuera de la
   portada (20/08). Los rótulos chicos ya no son monoespaciados: el papel de
   "ficha técnica" lo hacen MAYÚSCULA + tracking `0.14em` + peso 500. La
   reasignación es una variable por página (`--font` y `--font-mono` bajo
   `.pag-archivo` en archivo.css, bajo `.pag-simbio` en simbio.css). Las 7
   páginas de proyecto viejas todavía están en Nunito.
   **Tipografía de Simbio: Archivo, cuatro tamaños y nada más** — TÍTULO /
   SUBTÍTULO / CUERPO / RÓTULO. Todo cuelga de `.pag-simbio`; buscá **"SISTEMA
   TIPOGRÁFICO"** en `css/simbio.css`.
5. **Nada "mersa" ni genérico de IA**: sin sombras de recorte falsas, sin
   rotaciones al azar (las micro-rotaciones son valores fijos), sin emojis.

## Perillas para editar a mano

Mati edita el CSS él mismo. Los números ajustables están agrupados y comentados:
buscá **`PERILLAS`** en `css/archivo.css` (la portada) y en `css/simbio.css` (la
página de proyecto). Arriba de simbio.css hay además un **manual de unidades**
(px, rem, vw, svh, ch, fr) y cómo mover/alinear cosas.
Si agregás algo ajustable, ponelo como variable con su comentario.

## Diagnóstico

| | |
|---|---|
| `?grid` | dibuja las 4 columnas |
| `?debug=1` | protocolo, frames cargados, frame actual, avance, quién mueve el scrubbing |
| `?frame=340` | dibuja ese frame del ensamble sin scrollear |

## La bitácora

**`notas/DECISIONES.md` es el documento largo del proyecto**: paleta, pipeline de
assets, catálogo de bugs que ya costaron tiempo, y el log de cada sesión. Leelo
antes de trabajar y actualizalo al terminar.

## graphify

Grafo de conocimiento en `graphify-out/` (**173 nodos, 198 aristas, 28
comunidades**).

- Para preguntas de código: `graphify query "<pregunta>"`, `graphify path "<A>" "<B>"`,
  `graphify explain "<concepto>"`. Devuelven un subgrafo chico en vez del reporte entero.
- `graphify-out/wiki/index.md` para navegación amplia; `GRAPH_REPORT.md` solo para
  revisión de arquitectura.
- Después de modificar código: `graphify update .` (sin costo de API).

**Limitación importante:** el grafo cubre **JS, PowerShell y los .md**. Los CSS y
el HTML quedaron afuera (el extractor no los parsea), así que para trabajo de CSS
—que es la mayoría— el grafo devuelve cero y hay que ir a `grep` sobre el
selector. Las comunidades tampoco tienen nombres descriptivos: `graphify label`
necesita `ANTHROPIC_API_KEY` o `GOOGLE_API_KEY`.
