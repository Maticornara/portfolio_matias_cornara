# ARCHIVO / MI CAJÓN — bitácora del proyecto

Portfolio de **Matías Cornara**, diseñador integral.
HTML/CSS/JS puro, sin build tools. Última actualización: **2026-08-20**.

> **Dos nombres, dos alcances.** **ARCHIVO** es la versión express: la portada de
> una sola página que se muestra hoy (`index.html`). **MI CAJÓN** es el proyecto
> grande a largo plazo — el sistema completo con las 8 páginas de proyecto. Las
> secciones viejas de esta bitácora dicen "Mi Cajón" porque son de antes de que
> se separaran los dos; el nombre que va a la vista del público es **Archivo**.

> **Para retomar en una sesión nueva:** leé "Cómo levantar el sitio", "Estado
> actual" y "Bugs que costaron tiempo". El resto es referencia para cuando
> toques cada parte.
>
> **Cómo está organizado esto:** las secciones 0 a 12 describen **cómo están las
> cosas hoy** y se actualizan cuando algo cambia. Las secciones 13 en adelante
> son el **log cronológico** de cada sesión y no se editan: son historia, y por
> eso pueden contradecir a las de arriba. Si hay desacuerdo, **manda la parte de
> arriba**.

---

## 0. Cómo levantar el sitio

**El sitio NO funciona abriendo los HTML con doble click.** Chrome trata cada
archivo local como un origen distinto y bloquea la carga de imágenes al canvas:
las animaciones de SIMBIO quedan muertas aunque el código esté perfecto.

**ABRIR EL ARCHIVO NO ES ABRIR EL SERVIDOR LOCAL.** Esto ya costó dos rondas
completas de "no anda la animación del scroll":

| | |
|---|---|
| `file:///C:/Users/.../proyectos/simbio.html` | ❌ nunca. La página scrollea, pero ninguna animación de canvas puede cargar. |
| `http://localhost:8123/proyectos/simbio.html` | ✅ siempre. |

Se reconoce en un segundo: con `?debug=1`, el panel dice `protocolo : file: << MAL`.
Y desde el 13/08 la propia página dibuja una barra negra arriba con un link ya
armado a localhost (`avisarSiEsArchivo()` en `main.js`).

**Y antes de debuggear cualquier cosa: ¿está vivo el servidor?** Sin servidor no
carga ni un frame. Chequeo de 2 segundos:
`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8123/assets/simbio/frames-web/0000.jpg`
Tiene que decir `200`. Si dice `000`, levantá `tools/servidor.bat`.

```
tools\servidor.bat        ← doble click, abre el navegador solo
http://localhost:8123/
```

Mientras la ventana negra esté abierta, el sitio anda.

**Rompe-cachés:** los `<link>` y `<script>` llevan `?v=N`. Cuando toques un CSS
o un JS, **subí ese número** o el navegador te sigue sirviendo la versión vieja.
Ya perdimos tiempo con esto varias veces.

---

## 1. El mundo

No es un portfolio formal: es **un cajón desordenado pero con lógica propia**.
El tono de textos y microcopys puede ser informal. "Trabajos", no "Portafolio".

---

## 2. Paleta — zonas + un solo acento

```css
--crema: #F3EDE1    --crema-2: #EAE1CF
--negro: #0B0B0B    --negro-2: #161614    --linea-oscura: #2a2a27
--verde: #5A6E32    --verde-claro: #7C9448   --verde-oscuro: #41501f
--tinta: #1A1A18    --gris: #8a8578        --gris-claro: #c8c3b5
```

**No hay más colores que estos.** Un acento (verde) + neutros.

El sitio tiene **zonas**: `.zona--crema` (archivo, lectura) y `.zona--negro`
(exhibición). Cada una reasigna cuatro variables (`--zona-fondo`,
`--zona-texto`, `--zona-texto-2`, `--zona-linea`) y todo el CSS lee esas. Cambiar
una sección de mundo es cambiar una clase.

**El verde es el mismo valor exacto en las dos zonas** — es el hilo que las
conecta sin necesitar variantes.

---

## 3. Tipografía

**Hay dos sistemas conviviendo, a propósito.**

### Simbio: Archivo, cuatro tamaños y nada más (desde 12/08/2026)

Una sola familia (Archivo variable, 400..700) y cuatro usos:

| Uso | Para qué |
|---|---|
| TÍTULO | "Simbio", nombre de cada pieza, títulos de carpeta, nombre de fase |
| SUBTÍTULO | solo el enunciado de la traducción (al tamaño de título ocupaba media pantalla; al de cuerpo parecía una nota al pie) |
| CUERPO | bajada, párrafos del liquen, descripciones de las piezas, notas del proceso |
| RÓTULO | 2023, Diseño industrial, LA TRADUCCIÓN, 01/04, fichas técnicas, créditos |

**La jerarquía la hacen el peso, la caja (mayúscula o no) y el color, no el
tamaño.** Antes había como diez tamaños y aun así no se leía qué era más
importante.

Todo vive en **un solo bloque** al final de `css/simbio.css`: buscá **"SISTEMA
TIPOGRÁFICO"**. Cuelga de `.pag-simbio` (clase en el `<body>`), así que gana por
especificidad y pisa a propósito los tamaños viejos que quedaron más arriba en el
archivo. Regla para agregar algo nuevo: preguntate cuál de los cuatro usos es. Si
sentís que necesitás un quinto tamaño, casi siempre lo que falta es peso o color.

### La portada: Archivo también (20/08/2026) — decisión cerrada

**El sitio se llama Archivo y la tipografía es Archivo.** Nunito e IBM Plex Mono
salieron de la portada. Lo que quedaba pendiente acá abajo ("si Archivo se lleva
todo el sitio o el índice se queda en Nunito") está resuelto para `index.html`:
se lleva todo.

Se hace con **dos variables**, igual que en Simbio: `--font` y `--font-mono`
reasignadas bajo `.pag-archivo`, arriba de todo en `archivo.css`. No hubo que
tocar ni una regla de familia: todo el CSS del sistema ya leía esas variables.

**El rótulo sin monoespaciada.** Los letreros chicos (`.etiqueta`, `.dato`, la
pestaña de la ficha, las filas del índice) se leían como ficha técnica gracias a
la Plex Mono. Con una sola familia ese papel lo hacen tres cosas JUNTAS:
**mayúscula + `letter-spacing: 0.14em` + peso 500**, a 11px fijos. Las tres, no
una: en Archivo, una etiqueta en mayúscula sin tracking es solo texto chico
gritado. Lo que NO lleva ese tratamiento son las listas de herramientas: son
nombres para leer, y cinco programas seguidos en mayúscula con tracking se
vuelven un cartel.

**El `<link>` pide 300..900**, más ancho que el 400..700 de Simbio, porque el
nombre del hero va en 900 y la frase en 300. Si no se piden, el navegador los
inventa engordando o afinando el 700 y se ve sucio.

**El `--medida` de los textos cambió de sensación**: Archivo tiene la x más alta
que Nunito, así que al mismo valor en rem se ve bastante más grande. El párrafo
de entrada del CV bajó de `1.6rem` a `1.35rem` de máximo por eso.

### Las 7 páginas de proyecto viejas: siguen en Nunito + IBM Plex Mono

```css
--font: 'Nunito', system-ui, sans-serif;                    /* títulos y textos */
--font-mono: 'IBM Plex Mono', ui-monospace, monospace;      /* rótulos chicos */
```

Nunito llega a 900, así que la escala usa hasta `--peso-maximo: 900`. La mono va
**solo en los letreros** — es textura, no una voz para leer.

Estos siguen siendo los valores de `variables.css`, o sea el **default** del
sitio: es lo que ve cualquier página que no reasigne las dos variables. Hoy eso
son las 7 páginas de proyecto viejas. `index.html` (`.pag-archivo`) y
`simbio.html` (`.pag-simbio`) las pisan con Archivo.

**Lo que falta para cerrarlo del todo:** pasar esas 7 páginas a Archivo y
entonces sí cambiar el default en `variables.css`. Mientras el default siga
siendo Nunito, no lo toques sin revisarlas.

### Historial, para no volver a dar la vuelta completa

| Probado | Resultado |
|---|---|
| Serif itálica fina (Fraunces liviana) | descartado |
| Nunito + Space Grotesk | descartado, sobraba la segunda familia |
| Alegreya Sans / Fraunces 700 / Bricolage | los tres rechazados como titular |
| Source Sans 3 | gustó como cuerpo, quedó afuera igual |
| Nunito sola | bien, pero los letreros sin carácter |
| Nunito + IBM Plex Mono en rótulos | lo que quedó en el índice |
| IBM Plex Sans en todo | probado y descartado |
| IBM Plex Mono en todo | probado y descartado: cansa la lectura |
| **Archivo sola, 4 usos** | **lo que quedó en Simbio** |

---

## 4. La grilla

**Cuatro columnas** en todo el sitio (`--cols`, baja a 2 y a 1 en pantallas
chicas). Cualquier bloque con `.grilla` queda apoyado en ellas.

- Utilidades `.col-1`, `.col-2-3`, `.col-todo`, etc.
- **`?grid` en la URL** dibuja las columnas encima para verificar.
- La nav es la grilla: un botón por columna.

Principios de composición (críticos, están en el brief de Mati):
contraste de escala · radio de esquina asimétrico · anclaje a bordes ·
micro-rotación de 1–3° con **valores fijos, nunca al azar** · llenar vacíos con
datos sueltos.

---

## 5. Estado actual — qué está hecho

### `index.html` (la portada "Archivo") — rehecha el 20/08/2026
Una sola página, **un hero y cuatro tramos**:

1. **HERO** — las tres líneas de la esquina en perspectiva con el punto de fuga
   animado, la caja con las hojitas y las polaroids apoyada en el vértice, y
   abajo, centrado y en verde, el nombre con la frase y la flecha.
2. **SOBRE MÍ** — el CV.
3. **HERRAMIENTAS** — por categoría.
4. **CONTACTO** — el mail.
5. **TRABAJOS** — las 5 fichas (Simbio, Mobiliario de Museo, +54, Amigos Tipines,
   Tesis), ordenadas y rectas sobre las columnas 2 y 3.

Los cuatro tramos comparten el mismo esqueleto (`.tramo`): rótulo chico en la
columna 1 y el contenido a la derecha. **No hay títulos grandes fuera del hero,
ni divisores, ni cambios de fondo**: lo único que separa una sección de otra es
el aire. Y **cada sección ocupa como mínimo una pantalla** (`100svh`), con su
contenido centrado. El detalle está en las secciones 18, 19 y 20.

`renderFichas()` sigue en `main.js` para generar las 8 desde `PROYECTOS`, pero
**está desconectada a propósito**: las 5 fichas están escritas a mano para poder
corregirlas fácil.

### `proyectos/simbio.html` — la única página de proyecto hecha

**La columna de identidad ya NO es fija.** Era `position: sticky` y acompañaba
todo el scroll; ahora es un bloque de apertura en las columnas 1 y 2 que se lee
una vez y se va con la página. Eso habilitó lo importante: el flujo es
`grid-column: 1 / -1` y **todas las pantallas usan las 4 columnas de la página**.

> **Regla de composición: IMAGEN en las columnas 1-2 · TEXTO en las 3-4.**
> En las pantallas de pieza está invertido y desbalanceado a propósito: texto en
> la 1, objeto en las 2-3-4, porque ahí lo que hay que mirar es la pieza.

Estructura, en orden (confirmado 12/08):

1. **Bloque de apertura** — flecha de volver (pastilla redonda), título, datos en
   pastillas, bajada. Solo identidad: los textos de cada sección van CON sus
   imágenes.
2. **Portada** — el render con alfa. Sube y se corre a la izquierda con las
   perillas `--portada-sube` / `--portada-izq`, y lleva `pointer-events: none`
   porque cruza por detrás del link de volver.
3. **El liquen** — rótulo "Caso de estudio", polaroids en la columna 2
   (perilla `--polaroid-ancho`), texto en la 3.
4. **Intro de la traducción** — foto REAL3 a la izquierda, enunciado a la
   derecha, las dos como celdas de la grilla (ya no hay `position: absolute`).
5. **Tres pantallas de pieza** (árbol, hongo, alga) — texto en la columna 1,
   animación en las 2-3-4. Texto en tinta, no en gris.
6. **El ensamble** — scroll-scrubbing de 375 frames, ancho completo, escenario
   clavado con `position: sticky`.
7. **Las carpetas** — Proceso (con capa de vectores decorativos) y Prototipo
   (timelapse + las 4 fotos FRAN a doble tamaño).

Cada pantalla mide `min-height: calc(100svh - var(--s-9))` y su contenido se
centra. El aire grande va **solo entre filas**: el `column-gap` es el mismo
`--grid-gap` de `.grilla`, si no las columnas de la pantalla no coinciden con las
de la página.

### Las otras 7 páginas de proyecto
Solo el esqueleto del primer día. Cargan el CSS nuevo y la tipografía nueva,
pero su estructura es la vieja.

---

## 6. Las imágenes — el pipeline

**Los PNG de Blender no se usan directo nunca.** 375 PNG a 1920px son 549 MB y
~2,9 GB de RAM: ningún navegador lo aguanta.

```
tools\optimizar-frames.ps1
```

Convierte cada secuencia a JPG en una carpeta hermana `-web`. Lee de
`/assets/simbio/`, no toca los originales, y saltea lo ya convertido (para
forzar, borrar la carpeta `-web`).

| Secuencia | Origen | Rango | Salida | Peso |
|---|---|---|---|---|
| ensamble | `frames/` (4 subcarpetas) | 0000–0374 | 1600×900 | 23 MB |
| hongos | `muestra-piezas-hongos/` | 0450–0550 | 1280×720 | 5,5 MB |
| algas | `muestra-alga/` | 0350–0450 | 1100×1100 | 2,8 MB |
| árbol | `muestra-pieza-arbol/` | 0551–0651 | 1280×720 | 1,8 MB |

**Los rangos NO empiezan en 0000.** Son los números con los que Blender exportó
cada secuencia y se respetan tal cual — están configurados en `MUESTRAS` dentro
de `js/muestras.js`. No hace falta renombrar nada.

**`$ColorFondo` en el script tiene que coincidir con el fondo de la página**
(hoy `#F3EDE1`). Si no coinciden, se ve el rectángulo de la imagen recortado.
Si cambia el fondo, hay que reconvertir.

### La foto de portada
`assets/simbio/foto/REAL2.png` (el original de Blender, **con canal alfa**) →
recortada a su contenido real y escalada a `portada.png` (2200×918, 1,1 MB).
El recorte se hizo detectando el bounding box del alfa: el archivo traía mucho
vacío alrededor y por eso la pieza se veía chica.

### Las tres muestras de pieza
`js/muestras.js` las reproduce **en loop de rebote** (va y vuelve, con pausa en
las puntas), solo mientras están a la vista, y las carga recién cuando te
acercás. El encuadre de cada una (`zoom`, `cx`, `cy`) está **medido**, no puesto
a ojo: se midió dónde cae la pieza dentro de cada render para que las tres se
vean del mismo tamaño y alineadas.

### El video de proceso
`GIF.mp4` (9,7 MB) → timelapse acelerado 8× a 10 fps → `proceso/video/proceso.mp4`
(6,3 s, 335 KB). Vive en la carpeta del Prototipo.

### Los líquenes
Fotos de terceros. En la página van con nombres neutros (`liquen1..4`); las URLs
de origen están en **`assets/simbio/liquenes/CREDITOS.txt`**.
**Pendiente legal:** verificar licencias antes de publicar, o reemplazarlas por
fotos de Wikimedia Commons.

---

## 7. Librerías (agregadas 2026-08-05)

Por CDN en el `<head>` de todas las páginas: **GSAP + ScrollTrigger + Lenis**.

`js/smooth-scroll.js` arma el puente entre los dos sistemas con el patrón
oficial: Lenis avisa a ScrollTrigger cuando mueve la página, GSAP pasa a ser el
único reloj, y `lagSmoothing(0)`. Sin eso van desfasados y el scrubbing tiembla.

Si las librerías no cargan, todo cae a scroll nativo en vez de romperse.

**El scrubbing de SIMBIO NO depende de ScrollTrigger** (revisado 13/08). El
escenario se clava con `position: sticky` desde el CSS, y el scrubbing tiene dos
motores en paralelo:

- **principal:** el evento `scroll` del navegador (siempre llega, y Lenis mueve
  el scroll real, así que también con scroll suave)
- **secundario:** ScrollTrigger

Los dos llaman al mismo dibujo, que se saltea si el cuadro no cambió, así que
sobra que trabaje uno solo. `?debug=1` muestra `quién mueve: nativo N ·
ScrollTrigger N` para ver cuál está laburando.

Se probó el `pin` de ScrollTrigger y se abandonó: envuelve el escenario en un
`pin-spacer` con `position: fixed`, y eso se pelea con el `overflow` del `<html>`
y con el remontaje de página de Swup. Sticky es una pieza menos que puede
romperse.

**Verificado corriendo la página** (13/08): al 10 / 50 / 90 % del recorrido el
progreso da 0.100 / 0.500 / 0.900, el escenario queda en `top = 0` y el canvas
dibuja cuadros distintos en cada punto.

---

## 8. Interacciones

| Qué | Dónde | Cómo |
|---|---|---|
| Hover-reveal | fichas del índice | un solo gesto: el hover sostenido 850ms revela **y** entra al proyecto |
| Cursor | índice y páginas viejas | anillo en reposo, punto verde lleno sobre algo tocable |
| Cursor de anillo | solo SIMBIO (`data-cursor="anillo"`) | punto chico y preciso + anillo que llega con retraso; sobre algo tocable el anillo se agranda y se tiñe de verde. La perilla del arrastre es el `0.12` en `initCursor` |
| Mostacillas | **fuera de uso** | las 4 cuentas encadenadas quedaron en el código de `initCursor` por si otra página las pide (`data-cursor="mostacillas"`) |
| Nav esquiva | todo el sitio | se esconde al bajar, vuelve al subir o al acercar el mouse al borde |
| Carpetas | collage de proceso | clic para abrir (es una decisión, no un roce); las piezas salen disparadas desde la tapa; acordeón |
| Grupos del collage | dentro de la carpeta | hover activa el grupo entero con **un** post-it |
| Muestras de pieza | pantallas de pieza | loop de rebote, hover agranda la pieza |
| Polaroids de las carpetas | dentro de la carpeta | cada foto se levanta y se endereza al hover (420ms); al clic baja de golpe con la sombra chica (90ms) |

**Sonido:** no hay nada implementado. Hay comentarios `// SOUND HOOK: <nombre>`
en los puntos exactos donde iría (`type-key`, `reveal-start`, `enter-project`,
`page-turn`, `carpeta-abrir`, `click-tick`).

---

## 9. Bugs que costaron tiempo — no repetirlos

**`hidden` no funciona si el CSS pone `display`.** El atributo es una regla del
navegador y cualquier `display` de autor le gana. Si a un elemento le das
`display` y lo ocultás con `hidden`, escribí también
`.elemento[hidden] { display: none; }`. Nos costó una sesión entera: el loader
tapaba el canvas con los 333 frames ya cargados detrás.

**`width: 100%` + margen negativo no estira, solo corre.** Con un ancho
explícito, un margen negativo desplaza el elemento sin agrandarlo. Para que
estire, el ancho tiene que ser `auto`. Esto tuvo la imagen de portada chica
durante varios intentos.

**Una máscara recorta también la `box-shadow`.** Si un elemento lleva `mask`, la
sombra va en un envoltorio con `filter: drop-shadow()`.

**`Promise.all` sin timeout se cuelga para siempre.** Una sola imagen que no
resuelve deja todo esperando. Cada carga tiene timeout de 12s y hay una red de
seguridad de 20s.

**Leer una variable `let` antes de declararla rompe la función entera.** Pasó con
el cursor: el bloque de las mostacillas estaba arriba de las declaraciones y no
aparecía ni el cursor normal.

**Reglas CSS duplicadas.** Llegó a haber dos `.portada__foto` peleándose. Si un
cambio "no hace efecto", buscá duplicados antes de tocar números.

**`overflow-x: hidden` en el `<body>` rompe cualquier `position: sticky` de
adentro.** `hidden` obliga al navegador a convertir el otro eje en
`overflow-y: auto`, y con eso el elemento pasa a ser un CONTENEDOR DE SCROLL. Un
sticky se pega a su contenedor de scroll más cercano — que pasa a ser ese body,
que nunca scrollea por dentro. Resultado: el escenario del ensamble nunca se
pegaba (medido: `top = -2412px` cuando tenía que estar en 0). Se arregla con
`overflow-x: clip`, que corta igual pero NO crea contenedor de scroll. Si algún
día falla un sticky, esto es lo PRIMERO que hay que mirar.

**Dos declaraciones del mismo color en una misma regla: manda la última.** Se
agregó `color: var(--tinta)` arriba de una regla que ya tenía `color: var(--gris)`
más abajo, y el texto seguía gris. No es especificidad, es orden dentro del
bloque.

**Un `transform` en un ancestro rompe el `sticky` de un descendiente.** Por eso la
sección del ensamble no puede llevar la clase `reveal` (el reveal anima
`transform`).

**Cada estado que escribe su propio `transform` borra a los anteriores.** Tres
cosas querían mover la misma polaroid (separación del grupo, levantar al hover,
giro de base) y la última ganaba. Se resuelve escribiendo el `transform` UNA vez y
que cada estado cambie solo variables (`--corr-x`, `--alzar`, `--escala`,
`--giro-actual`).

**`file://` bloquea la carga de imágenes al canvas.** Ver punto 0. **Pasó dos
veces**, con media hora de debug cada vez.

**El porcentaje del loader usaba `Math.round`** y mostraba 100% faltando una
imagen. Va con `Math.floor`.

---

## 10. Herramientas de diagnóstico

| | |
|---|---|
| `?grid` | dibuja las 4 columnas encima de la página |
| `?debug=1` | panel con protocolo, frames cargados, frame actual, avance y **quién mueve el scrubbing** (nativo / ScrollTrigger) |
| `?frame=340` | dibuja ese frame del ensamble sin scrollear |

---

## 11. Mapa de archivos

```
css/
  variables.css   ← el que más se toca: paleta, tipografía, sombras, grilla
  base.css        ← reset, zonas, etiquetas, cursor, scroll reveal
  layout.css      ← nav, divisor rasgado, FICHA, nota, pie; al final lo HEREDADO
                    de las 7 páginas viejas
  archivo.css     ← LA PORTADA entera (hero + esquina, CV, herramientas,
                    contacto, título de transición, grid de fichas, índice).
                    Buscá "PERILLAS" arriba de todo.
  simbio.css      ← todo lo de la página de proyecto. Arriba tiene un MANUAL DE
                    UNIDADES para editar a mano, y al final el SISTEMA
                    TIPOGRÁFICO. Buscá "PERILLAS" para los números ajustables.
js/
  smooth-scroll.js ← Lenis + GSAP. Carga PRIMERO.
  main.js          ← datos, hover-reveal, cursor, reveal, carpetas, nav, lupa, tilt
  archivo.js       ← el punto de fuga de la esquina del hero (y nada más)
  simbio-scroll.js ← el ensamble con ScrollTrigger
  muestras.js      ← las 3 animaciones de pieza
  transiciones.js  ← Swup + re-init de los módulos al cambiar de página
tools/
  servidor.bat               ← levantar el sitio (avisa si el puerto ya está tomado)
  optimizar-frames.ps1       ← secuencias de Blender a JPG (fuerza un tamaño exacto)
  optimizar-fotos.ps1        ← fotos sueltas a JPG (limita el lado más largo; sirve
                               para verticales y horizontales mezcladas)
  recortar-transparencia.ps1 ← recorta el margen transparente de un PNG
sandbox/          ← pruebas viejas de componentes, con la paleta anterior
```

---

## 12. Pendientes

> **SIMBIO NO ESTÁ CERRADO.** Está **en pausa** (13/08/2026): funciona de punta a
> punta, pero Mati lo dejó así por ahora y va a seguir. No tratarlo como terminado
> ni usarlo todavía como plantilla definitiva para las otras 7 páginas.


**De Mati:**
- Textos definitivos de los post-its del collage de proceso
- Los dos textos al pie de las fotos del prototipo (hoy provisorios, marcados con
  un comentario en el HTML)
- Los SVG de boceto de las fichas del índice
- Verificar licencias de las fotos de líquenes antes de publicar
- Decidir si Archivo se lleva todo el sitio o el índice se queda en Nunito

**Listo, ya no es pendiente:** fotos del prototipo (FRAN1-4), vectores de proceso,
textos de las tres piezas, texto del liquen.

**De código:**
- Las otras 7 páginas de proyecto y sus 7 fichas del índice
- Mudar lo genérico de `simbio.css` a `layout.css` como plantilla
- Borrar los bloques marcados **HEREDADO** en `layout.css` y `variables.css`
- **Mobile**: está preparado, no diseñado. El corte de `@media (max-width: 960px)`
  ya apila la columna de apertura, las polaroids, las pantallas de pieza y la foto
  de la intro. Falta decidir qué hacer con el ensamble en pantalla chica: 375
  frames con datos móviles es mucho.
- Verificar el fade de Swup y el tilt en la ficha del índice
- `graphify label` para que las 23 comunidades tengan nombres descriptivos, y la
  extracción semántica de imágenes y docs: las dos necesitan `ANTHROPIC_API_KEY` o
  `GOOGLE_API_KEY` exportada
- Las piezas podrían verse bastante más grandes si `optimizar-frames.ps1` recortara
  el crema sobrante de cada secuencia antes de convertir (la pieza ocupa entre un
  cuarto y la mitad del cuadro). Hay que medir el recuadro a lo largo de TODA la
  secuencia, no de un frame, porque la pieza se mueve.

**Limitación del grafo:** cubre JS, PowerShell y los `.md`. Los CSS y el HTML
quedaron afuera, así que para trabajo de CSS el grafo devuelve cero y hay que ir a
`grep` sobre el selector.

---

## 13. Perillas para editar a mano (11/08/2026)

Mati pidió poder ajustar estas dos secciones sin pedírmelo. Los dos bloques
están comentados en `css/simbio.css`: buscá **"PERILLAS PARA EDITAR A MANO"**.

**Pantalla intro de la traducción** (foto REAL3 + enunciado)
- `--intro-texto-ancho` · ancho del bloque de texto (va en dos unidades: ch
  para el texto y rem para que la foto sepa dónde termina; si cambiás uno,
  cambiá el otro)
- `--intro-foto-ancho` · ancho de la foto, en vw
- `--intro-foto-aire` · separación entre foto y texto
- `--intro-foto-y` · sube (negativo) o baja la foto

La foto va en `position: absolute` a propósito: como columna de la grilla
correría el texto hacia la derecha, y el texto tenía que quedar donde estaba.

**Pantallas de pieza** (texto izquierda / objeto derecha)
- `--pieza-cols` · reparto texto / objeto. El `minmax(24rem, …)` es el piso del
  texto: sin él, la caja de la pieza infla su columna y el texto queda en una
  palabra por renglón (pasó, está documentado en el CSS)
- `--pieza-alto` · perilla principal de tamaño de la pieza
- `--pieza-ancho-max` · freno para que no se corte a la derecha en ventanas
  medianas. Probado a 1900 y a 1280 px

**Por qué la pieza no se corre a la izquierda:** los frames son JPG con el
crema horneado adentro, no PNG transparentes. El aire del cuadro tapa lo que
tenga debajo — si el cuadro se mete sobre el texto, el texto desaparece.

**Herramienta nueva:** `tools/recortar-transparencia.ps1` recorta el margen
transparente de un PNG y guarda una copia `-recorte`. Se usó con REAL3 (tenía
242 px de aire a la izquierda y 161 abajo): con el mismo ancho en pantalla, las
piezas se ven ~14% más grandes. El original no se toca.

**Pendiente relacionado:** las piezas podrían verse bastante más grandes si
`optimizar-frames.ps1` recortara el crema sobrante de cada secuencia antes de
convertir (la pieza ocupa entre un cuarto y la mitad del cuadro). No se hizo
todavía: hay que medir el recuadro de la pieza a lo largo de TODA la secuencia,
no de un frame, porque la pieza se mueve.

---

## 14. Rebranding tipográfico de Simbio + arreglos (12/08/2026)

**TIPOGRAFÍA — Archivo, tres usos y nada más**
Una sola familia (Archivo variable, 400..700), tres usos: TÍTULO / CUERPO /
RÓTULO. Nunito e IBM Plex Mono ya no se cargan en esta página. La jerarquía la
hacen el peso, la caja y el color, no el tamaño.
Todo vive en un bloque al final de `css/simbio.css`: buscá **"SISTEMA
TIPOGRÁFICO"**. Los tamaños viejos siguen más arriba en el archivo y quedan
pisados a propósito: el bloque nuevo cuelga de `.pag-simbio` (clase en el
`<body>`), así que gana por especificidad y el rebranding no toca el índice ni
las otras 7 páginas.

**EL ENSAMBLE VOLVIÓ A ANDAR — LA CAUSA DE FONDO ERA `overflow-x: hidden`
EN EL `<body>`**
Tres cosas, en orden de importancia:

1. **EL BUG DE VERDAD: `body { overflow-x: hidden }`** (css/base.css).
   `overflow-x: hidden` obliga al navegador a convertir el otro eje en
   `overflow-y: auto`, y con eso el `<body>` pasa a ser un CONTENEDOR DE
   SCROLL. `position: sticky` se pega a su contenedor de scroll más cercano
   — que pasó a ser el body, que nunca scrollea por dentro (scrollea la
   ventana). Resultado: el escenario nunca se pegaba, se iba para arriba con
   la página, y los 375 frames quedaban sin recorrer nunca.
   Medido en la página real: al 50% del recorrido el escenario estaba en
   `top = -2412px`; tenía que estar en 0. Con `overflow-x: clip` (que corta
   igual pero NO crea contenedor de scroll) pasó a `top = 0`.
   Ojo: este mismo error ya estaba anotado y arreglado para `<html>` en la
   línea 24 del mismo archivo, y seguía puesto en `body`. Si algún día vuelve
   a fallar un sticky, esto es lo primero que hay que mirar.

2. `smooth-scroll.js` **no estaba incluido** en simbio.html ni en index.html.
   Lenis nunca arrancaba: de ahí que el scroll no fuera suave.

3. El escenario se clavaba con el `pin` de ScrollTrigger. Volvió a
   `position: sticky` (CSS) + ScrollTrigger solo para leer el progreso: una
   pieza menos que puede romperse, y no depende de que ninguna librería esté
   viva. (El pin tampoco funcionaba, por la misma razón del punto 1.)

**Y ANTES DE DEBUGGEAR NADA: ¿ESTÁ VIVO EL SERVIDOR?**
Cuando apareció este reporte, el servidor local estaba caído. Sin servidor no
carga ni un frame y la animación no puede funcionar, por más que el código esté
bien. Chequeo de 2 segundos:
`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8123/assets/simbio/frames-web/0000.jpg`
Tiene que decir 200. Si dice 000, levantá `tools/servidor.bat`.

**CURSOR NUEVO**: `data-cursor="anillo"`. Punto chico y preciso + anillo que
llega con retraso; al pasar por algo tocable el anillo se agranda y se tiñe de
verde. Reemplaza a las mostacillas (el código de las mostacillas quedó en
`initCursor` por si otra página lo quiere).

**PROTOTIPO**: entraron FRAN1 a FRAN4 en la carpeta Prototipo. Los originales
son de cámara (2736x3648, 13 MB cada uno = 51 MB). Se sirven desde
`prototipo-web/` a 1600 px y ~230 KB (0,9 MB las cuatro). El conversor nuevo es
`tools/optimizar-fotos.ps1` (el de frames no servía: fuerza un tamaño exacto y
estas son verticales y horizontales mezcladas). **Los dos textos al pie de las
fotos son provisorios**, están marcados con un comentario en el HTML.

**AIRE Y FADES**: la portada y las dos tapas de carpeta ahora entran por fade
(clase `reveal`), y el ensamble tiene `margin-block: var(--s-9)` para llegar
después de un silencio. El ensamble NO puede llevar `reveal`: el reveal usa
`transform` y un transform en un ancestro rompe el `sticky` de adentro.

**ORDEN DE SECCIONES** (sin cambios, confirmado): portada → liquen → intro de
la traducción → 3 pantallas de pieza → ensamble → carpetas (Proceso y
Prototipo) → pie.

**MOBILE**: preparado, no diseñado. El corte de `@media (max-width: 960px)` ya
apila la columna fija, las polaroids, las pantallas de pieza (el cuadro vuelve
a medirse por ancho) y la foto de la intro (sale del absoluto y va arriba del
texto). Falta decidir qué pasa con el ensamble en pantalla chica: 375 frames en
datos móviles es mucho.

**Cómo se verificó**: no se puede scrollear en Chrome headless, así que el
sticky del ensamble y el cursor hay que probarlos a mano en el navegador. Sí se
verificó, corriendo la página: que las 5 librerías cargan, que el trigger se
crea con el start/end correcto, y por captura cada sección tocada.

---

## 15. La grilla manda: 4 columnas para todo (12/08/2026)

**LA COLUMNA DE IDENTIDAD DEJÓ DE SER FIJA.** Era `position: sticky` y
acompañaba todo el scroll. Ahora es un bloque de apertura en las columnas 1 y 2:
se lee una vez y se va con la página. Lo que habilita eso es lo importante: el
flujo pasó a `grid-column: 1 / -1` y **todas las pantallas usan las 4 columnas
de la página**, con una sola regla de composición:

> **IMAGEN en las columnas 1 y 2 · TEXTO en las columnas 3 y 4**

Vale para el liquen, para la intro de la traducción y para las tres pantallas de
pieza (ahí invertido: el texto en 1-2 y el objeto en 3-4, porque el objeto tiene
que quedar grande contra el borde derecho).

**DOS BUGS DE GRILLA QUE ESTABAN ESCONDIDOS**
1. `.pantalla` tenía `gap: var(--s-9)` (7rem) también entre COLUMNAS. Con ese
   gap, sus 4 columnas eran más angostas que las 4 de la página: nada caía
   donde caen los botones de la nav. Ahora `column-gap: var(--grid-gap)` (el
   mismo de `.grilla`) y el aire grande quedó solo entre filas.
2. `.pantalla--liquen .pantalla__texto` decía `grid-column: 2`, de la maqueta
   vieja de 3 columnas. Medido: el texto iba de 616 a 915 px, o sea justo abajo
   de la segunda polaroid. Ahora `3 / -1`.

**LA INTRO YA NO USA `position: absolute`.** La foto REAL3 se colgaba a la
izquierda del texto con un `calc()` que necesitaba saber el ancho exacto del
texto; cada cambio de tipografía dejaba ese número viejo y la foto se montaba
encima. Ahora las dos son celdas de la grilla y no hay nada que calcular.

**TIPOGRAFÍA: apareció un cuarto tamaño, y es el único.** `--t-subtitulo`,
para el enunciado de la traducción: al tamaño de TÍTULO ocupaba media pantalla,
al de CUERPO parecía una nota al pie. El CUERPO además bajó (llegaba a 1.2rem,
ahora a 1.02rem): con Archivo se veía enorme al lado del título.

**Detalles**: la flecha de volver quedó en 15 px y sin el texto "Volver a los
trabajos" (el `aria-label` sí queda: una flecha sola no le dice nada a un lector
de pantalla). Los datos del proyecto —Diseño industrial, Biomímesis, 2023— pasaron
a pastillas redondeadas, con el mismo borde y radio que los botones de la nav.

---

## 16. Ajustes de composición y las carpetas (12/08/2026)

**PORTADA**: subió y se corrió a la izquierda con dos perillas nuevas en
`.pantalla--portada` — `--portada-sube` (26svh) y `--portada-izq` (5vw). Sube por
margen negativo, para meterse en el aire vacío que deja el bloque de apertura
(que solo ocupa las columnas 1 y 2), y lleva `pointer-events: none` porque cruza
por detrás del link de volver y de las pastillas.
Ojo: su `margin-left` tenía una cuenta que descontaba "una columna del flujo",
de cuando el flujo arrancaba en la columna 2. Con el flujo en las 4 columnas esa
cuenta corría la foto de más.

**LIQUEN**: las polaroids pasaron a la columna 2 (antes 1 y 2) y se achicaron con
la perilla `--polaroid-ancho` (8.5rem). Texto nuevo, en la columna 3, con el
rótulo "Caso de estudio" — mismo tratamiento que "La traducción".

**PIEZAS**: texto en las columnas 1 y 2, animación en 3 y 4, textos nuevos y el
texto **en tinta, no en gris**. Detalle que costó: la regla ya tenía un
`color: var(--gris)` más abajo dentro de la misma regla, así que agregar
`color: var(--tinta)` arriba no hacía nada — en una misma regla, la última
declaración manda. La medida subió a 40ch para cerrar el hueco contra el objeto.
El freno de ancho del cuadro quedó en `48vw`: la columna 3 arranca cerca del 51%
del ancho de la ventana (medido a 1900 y a 1280), así que más que eso corta la
pieza contra el borde derecho.

**LA FLECHA DE VOLVER** es una pastilla redonda de 2.5rem, con el borde y el
radio de los botones de la nav y el mismo relleno verde en hover.

**LAS SOMBRAS CORTADAS**: `.carpeta__interior` necesita recortar para poder
plegarse, y eso cortaba las sombras de las polaroids pegadas al borde. Se
resolvió con `overflow: clip` + `overflow-clip-margin: 60px`: recorta igual, pero
deja pintar 60px más allá. En un navegador sin soporte se comporta como antes.

**POLAROIDS DE LAS CARPETAS — hover y clic**: cada foto se levanta, se agranda
apenas y se endereza (420ms), y al hacer clic baja de golpe con la sombra chica
(90ms). Para que eso convive con la separación del grupo, el `transform` se
escribe UNA sola vez y cada estado cambia solo variables (`--corr-x`, `--alzar`,
`--escala`, `--giro-actual`). Antes cada estado escribía su propio `transform` y
el último borraba a los otros: al pasar el mouse por una foto, perdía la
separación del grupo y saltaba.

**VECTORES**: los 11 dibujos de `proceso/vectores/` entran como capa decorativa
de la carpeta de Proceso, desordenados, con fade escalonado, `pointer-events:
none`, `aria-hidden` y z-index por debajo del material. Se ubican con --x/--y/--w
/--giro en el HTML.

**PROTOTIPO**: las 4 fotos como una fila de cuatro en un grupo que ocupa las 4
columnas (`.grupo--ancho`), al doble de tamaño. El timelapse quedó sin nota.
**EL VIDEO ES VERTICAL (480x848)**: el `--w` es un % del ancho del lienzo y el
alto sale de la proporción, así que con `--w: 56%` medía 1286px de alto, se salía
de la carpeta y tapaba las fotos. Quedó en 30%.

**Piezas, ajuste final (12/08/2026)**: el objeto pasó a ocupar las columnas 2, 3
y 4 y el texto se quedó en la 1 — el reparto más desbalanceado de la página, a
propósito: en esas tres pantallas lo que se mira es la pieza. Medido a 1882px de
ventana: el cuadro pasó de 620 a **1154px de ancho** (x 616 → 1769) y el texto
quedó en 282 → 584. `--pieza-alto` subió a 76svh y el freno de ancho a 64vw (la
columna 2 arranca cerca del 33% del ancho de la ventana; más que 64vw y la pieza
se corta contra el borde derecho). El texto perdió su max-width en ch: ahora lo
mide su columna.

**file:// vs localhost — el bug que volvió (13/08/2026)**
Segunda vez que "no anda la animación del scroll" resultó ser la página abierta
como `file:///C:/Users/.../proyectos/simbio.html` en vez de
`http://localhost:8123/proyectos/simbio.html`. **Abrir el archivo NO es abrir el
servidor local.** Chrome trata cada archivo local como un origen distinto y
bloquea la carga de imágenes dentro de un canvas: los 375 frames no entran nunca
y la animación queda clavada, con la página scrolleando normal.
Cómo se reconoce en un segundo: `?debug=1` muestra `protocolo : file: << MAL`.
Prevención puesta: `avisarSiEsArchivo()` en main.js dibuja una barra negra arriba
de todo con un link ya armado a la misma página en localhost:8123. No redirige
solo a propósito (los navegadores bloquean o preguntan ese salto, y si el
servidor está apagado te deja en un error sin explicación).

**El scrubbing ya no depende de ScrollTrigger**: el motor principal es el evento
`scroll` del navegador (siempre llega; Lenis mueve el scroll real) y
ScrollTrigger quedó como segundo motor en paralelo. Los dos llaman al mismo
dibujo, que se saltea si el cuadro no cambió. El panel de `?debug=1` muestra
`quién mueve: nativo N · ScrollTrigger N` para ver cuál está trabajando.

## 17. Los vectores cambiaron de carpeta y de función (13/08/2026)

**FUERA DE PROCESO.** Los 11 vectores estaban esparcidos por detrás de la carpeta
de Proceso como textura decorativa. Quedaba desordenado sobre algo que ya era
desordenado: las fotos de proceso son el desorden, sumarle una capa suelta atrás
no aportaba. Se sacaron (capa `.vectores`, ya no existe).

**ADENTRO DE PROTOTIPO, COMO DESPIECE.** Los mismos archivos, otra función: una
lámina en cuadrícula pareja, numerada 01 a 11, con el rótulo "Despiece — piezas y
uso". Sin giros ni desorden a propósito — **lo desordenado es el proceso; el
prototipo es la ficha del producto terminado**. Sin interacción: es una lámina.
El rótulo no dice "las piezas del juego" porque los primeros vectores son manos
armando, no piezas.

`--despiece-item: 12.5rem` no es un número al azar: con el ancho de las 4
columnas y ese gap, `auto-fit` entra **6 por fila**, así que las 11 quedan en
6 + 5. A 7rem entraban 10 y la número 11 quedaba sola abajo. Si se agregan o
quitan vectores, revisar que el reparto no deje una huérfana.

**EL TIMELAPSE SALIÓ DEL SISTEMA DE PIEZAS ABSOLUTAS.** El video es vertical
(480x848) y en ese sistema el ancho se da en % del lienzo y el alto sale de la
proporción: cualquier intento de agrandarlo lo volvía larguísimo (a 56% medía
1286px y tapaba las fotos). Ahora es `.timelapse`, manda el **alto**
(`--timelapse-alto: 74svh`) y el ancho sale solo. Es la única forma de que un
video vertical crezca sin desbordar. Sigue sin nota al pie.

**EL "HOVER RARO" DE LAS PASTILLAS — ERA UN SELECTOR DEMASIADO ANCHO.**
Al pasar el mouse por la flecha de volver se encendían las tres pastillas de la
ficha técnica. La regla era `.proyecto__col:hover .proyecto__meta .etiqueta`:
cuelga de TODA la columna de apertura, y la flecha, el título y la bajada están
adentro. Parecía que la flecha las controlaba.
Se eliminó en vez de reescribirse: las pastillas no son botones ni links, y un
hover en algo que no se puede tocar promete una acción que no existe. Si algún
día se quiere el efecto de conjunto, el selector tiene que ser
`.proyecto__meta:hover`, nunca la columna entera.

**Gráfica e instructivos — la versión que quedó (13/08/2026)**
Pasó por tres formas antes de esta: esparcidos por detrás de Proceso, en
cuadrícula numerada en Prototipo, y finalmente **un grupo chico y desacomodado a
la derecha del timelapse** (que quedó a la izquierda). Sin números ni orden: son
la gráfica del proyecto, no una secuencia de pasos.

**Jerarquía dentro del grupo**: los cuatro que importan — `Recurso 2, 3, 4 y 7`,
los tres instructivos de la mano y la estructura armada — van a 8-9,2rem y se
llevan la primera fila solos. El resto acompaña a 4,2-5,4rem.

**LA CUENTA QUE EVITA QUE SE PISEN**: los `--dx`/`--dy` corren cada pieza hasta 8
y 10px, así que dos vecinos pueden acercarse como máximo el doble de eso; con un
`gap` mayor a 20px (`var(--s-6) var(--s-5)`) nunca llegan a tocarse. Si se
agrandan los corrimientos, hay que agrandar el gap con la misma cuenta.
La única excepción es la última pieza, sola en su fila: su `--dx` es de 58px
porque no tiene vecinos al costado, y corrida hacia adentro se lee como apoyada
aparte en vez de sobrante.

Se mueven con `translate` y **no con márgenes**: la fila se sigue calculando
igual, así que nada se desborda de la carpeta por más que se exageren los
números. Y son valores **fijos**, elegidos uno por uno: al azar se ve descuidado,
no desacomodado.

El texto de las cuatro fotos pasó a **"Amplia jugabilidad y posibilidad de
estructuras."**

---

## 18. "ARCHIVO": remake de la portada (20/08/2026)

**EL SITIO EXPRESS SE LLAMA ARCHIVO, NO MI CAJÓN.** Son dos cosas distintas y
conviene no mezclarlas: *Mi Cajón* es el proyecto grande a largo plazo (las 8
páginas de proyecto, el sistema completo); *Archivo* es esta versión rápida y
acotada, con su propio nombre, que es lo que se muestra hoy. Se sacó el nombre
viejo de todo lo que se ve: `<title>`, meta description, hero, pie, y el aviso de
`file://` de la consola. En el código quedó `window.initComunes` (antes
`initMiCajon`) y `window.initArchivoEsquina`, los dos llamados desde
`transiciones.js`.

**LA PORTADA, EN ORDEN:** hero → CV → herramientas → contacto → título de
transición ("Archivo") → grid de 5 fichas → índice. Todo en una página, sin
routing: las tarjetas bajan a un ancla de la misma página, no a `/proyectos/`.

**Y LA TIPOGRAFÍA TAMBIÉN ES ARCHIVO.** Nunito e IBM Plex Mono salieron de la
portada el mismo día: el sitio se llama Archivo y la tipografía es Archivo. El
detalle de cómo se hizo (dos variables, y cómo se resuelve el rótulo sin
monoespaciada) está arriba, en la sección 3.

**LAS TRES LÍNEAS DE LA ESQUINA.** Un SVG con `viewBox="0 0 100 100"` y
`preserveAspectRatio="none"`: el lienzo se estira al tamaño del hero y cada
coordenada se lee como un porcentaje, así que no hay nada que recalcular al
cambiar de pantalla. La geometría está escrita en `index.html` con un comentario
que explica cómo mover el vértice y cómo dar la esquina vuelta; el JS solo le
suma un vaivén al punto de fuga. **Si el JS no corre, la esquina se ve igual,
quieta** — la degradación con gracia es el reparto, no un `try/catch`.

**EL GROSOR SE ESTIRA CON EL LIENZO.** Primera versión: las tres líneas salían de
entre 9 y 14px de grueso. Al estirar un viewBox de 100 a 1440 x 900, el trazo se
multiplica por eso mismo. Lo frena `vector-effect: non-scaling-stroke`, y **tiene
que ir en la línea, no en el `<g>` que la envuelve**: no es una propiedad que se
herede. Está puesto en `archivo.css`, sobre `.esquina line`.

**EL LOOP NO USA GSAP.** Dos senos con períodos distintos (17s y 11s) sobre
`requestAnimationFrame`. Períodos que no son múltiplos: el punto nunca repite el
mismo recorrido, así que no se lee el ciclo. GSAP está en el sitio para lo que se
engancha al scroll; esto es ambiente y corre solo. Se pausa cuando el hero sale
de pantalla (IntersectionObserver) y se corta solo si Swup se lleva el SVG
(`if (!svg.isConnected) return;` antes de pedir el cuadro siguiente).

### EL BUG QUE COSTÓ LA RONDA: `.bloque` YA EXISTÍA

Los tres tramos de texto de la portada se llamaban `.bloque`. **`simbio.css` ya
tenía un `.bloque` suyo, sin apellidar con `.pag-simbio`**, y `simbio.css` se
carga en TODAS las páginas y DESPUÉS de `archivo.css`. Su regla `.bloque p`
(especificidad 0,1,1) le ganaba a `.cv__lead` (0,1,0) y le pisaba color, tamaño,
peso e interlínea: el CV se veía gris y chico, y los rótulos salían del tamaño
equivocado. Se renombró a **`.tramo`**.

**La lección para la próxima:** antes de estrenar un nombre de clase genérico
(`.bloque`, `.item`, `.fila`, `.grupo`), grepearlo contra `simbio.css`. No todo
lo de ahí está apellidado.

### LA FICHA: DOS ARREGLOS EN EL COMPONENTE

1. **El giro pasó a variable.** `.ficha__cuerpo` rotaba con `var(--giro-a)`
   escrito a mano, y el estado de hover lo repetía igual de escrito: una ficha con
   otro giro se enderezaba de golpe al pasarle el mouse. Ahora los dos usan
   `var(--giro-ficha, var(--giro-a))` y cada tarjeta declara el suyo.
2. **El tilt se mudó al contenedor.** VanillaTilt escribe el `transform` en línea
   y pisa el del CSS. Con `data-tilt` en `.ficha` (que no tiene transform propio) y
   la micro-rotación en `.ficha__cuerpo`, conviven: la tarjeta se inclina y el papel
   de adentro sigue apoyado torcido. Además, dentro del grid el hover **solo
   levanta**: el `rotateX/rotateY` del componente sumado al giro del tilt eran dos
   inclinaciones peleándose sobre el mismo papel.

**FICHAS SIN FOTO.** Museo, Amigos Tipines y Tesis todavía no tienen imagen. El
cruce boceto → real terminaba en un rectángulo verde plano, que se lee como un
error, así que llevan `.ficha--sin-foto`: se quedan en el dibujo de línea y el
hover es solo el levantón. **Al poner la foto: agregar el `<img>` y borrar esa
clase.** Están marcadas con un comentario en el HTML.

**El dibujo de línea se mide por el ANCHO** (62% del marco) y su alto sale de la
proporción 100x70 del lienzo. En la ficha cuadrada (+54) y la vertical (Tesis)
eso lo dejaba ocupando menos de un tercio del alto: en esas dos se sube a 82%.

**LA NAV EN EL TELÉFONO.** Debajo de 620px la grilla del sitio baja a una columna
y los cuatro botones se apilaban en cuatro filas: la barra fija se comía casi un
cuarto de la pantalla, en todas las páginas. Ahí la nav deja de ser grilla y pasa
a ser una fila que envuelve.

### LO QUE FALTA

- **El año de la Tesis.** El dato del pie y el del índice quedaron VACÍOS a
  propósito, para no inventar una fecha. Buscar `FALTA: el año de la tesis`.
- **Las fotos de Museo, Amigos Tipines y Tesis** (ver `.ficha--sin-foto`).
- **Las redes** (LinkedIn / Instagram / Behance): el CSS de `.redes` ya está
  escrito y el `<ul>` está comentado en `index.html`. Descomentar y poner links.
- **Las secciones de cada proyecto.** Hoy el ancla de cada tarjeta cae en la fila
  del índice del pie. Cuando cada proyecto tenga su sección, el `id` se muda ahí y
  el índice se queda como índice, sin ids.

---

## 19. +54: la primera página de proyecto después de Simbio (20/08/2026)

`proyectos/mas-54.html` + `css/mas-54.css` + `js/mas-54.js`. Versión express: 8
partes, tres bloques de texto y nada más; el resto es material moviéndose.

### LO QUE SE DECIDIÓ Y POR QUÉ

**LA PALETA ES LA DEL SITIO, NO LA DE +54.** Esta fue la corrección del día. La
primera versión estaba pintada con la identidad del proyecto (magenta `#E5235A`,
lima `#D9F411`, rosa `#FDBCF2`): tres zonas nuevas, `.zona--rosa`,
`.zona--magenta` y `.zona--lima`. Se dio marcha atrás entera. La página va en
crema, negro y verde como todo el resto, y los colores de +54 aparecen
únicamente ADENTRO de las imágenes, que ya son de esos colores.

El motivo se ve apenas se comparan las dos: con la página magenta, los posters
—que son magenta— dejan de resaltar, porque están apoyados sobre su propio
color. Sobre el negro del hero, el mismo poster brilla. **La página es la pared
de la galería; el material es lo que tiene color.**

Las 8 partes alternan `zona--negro` (hero, teaser: los momentos de exhibición) y
`zona--crema` / `zona--crema-2` (los de lectura), que es la semántica que ya
tenían las zonas.

**TIPOGRAFÍA: ARCHIVO**, igual que la portada y que Simbio. El `<link>` pide el
rango `300..900` (y no el `400..700` de Simbio) porque el titular va en 900 y los
copys en 300.

**LA TIRA HORIZONTAL — el módulo de 1093,48 px.** El scroll vertical se traduce
en el recorrido horizontal de `frame_largo_1` (8566x1080). El número que pasó
Mati está confirmado MIDIENDO el archivo: las costuras entre paneles caen en
1089, 2183, 3276, 4369 y 5463 — cada 1093,5 px. O sea 8566 / 1093,48 = **7,83
módulos**, 8 posters con el último cortado.

Es un barrido CONTINUO y no un salto seco de 1093,48 px por "paso". El salto
peleaba con Lenis (dos motores moviendo lo mismo = tironeo). El mecanismo es el
mismo del ensamble de Simbio: sección alta + `position: sticky`, nunca el `pin`
de ScrollTrigger.

**EL CONTADOR DE LA TIRA cuenta avance, no coordenada.** Primero mostraba qué
poster caía en el borde izquierdo de la pantalla, y en 1440px se ven casi TRES
posters a la vez: al llegar al final decía "05 / 08" con el octavo a la vista.
Ahora reparte el avance entre los 8 módulos, así arranca en 01 y termina en 08.

### EL PIPELINE DE ASSETS — `tools/optimizar-54.ps1`

La carpeta `assets/+54` pesaba **~100 MB** en originales (tres animaciones de 10
a 27 MB, un teaser de 20 MB, un poster de 9,9 MB). Sin tocar los originales, el
script genera `assets/+54/web/` y el HTML apunta SIEMPRE ahí.

**100 MB → 14,8 MB**, y 9,9 de esos son el teaser, que con `preload="none"` no
baja un solo byte hasta que se toca play. Es idempotente (saltea lo que ya está
hecho y es más nuevo); `-Forzar` rehace todo.

### BUGS QUE COSTARON TIEMPO ACÁ — no repetirlos

**UNA `Ó` ROMPIÓ EL SCRIPT ENTERO.** PowerShell 5.1 lee los `.ps1` como ANSI. La
`Ó` de `GESTIÓN` en UTF-8 son dos bytes, y el segundo (`0x93`) en Windows-1252 es
la COMILLA TIPOGRÁFICA de apertura. PowerShell abría una cadena de texto ahí y
creía que todo el resto del archivo era parte de ella; el error que tiraba estaba
160 líneas más abajo y no decía nada útil. Solución: el archivo se busca con
comodín y su nombre no aparece nunca escrito en el código.

**LAS 8 POSTALES INVISIBLES.** `.postal54__caras` es un `<span>`, o sea inline, y
una caja inline IGNORA `width` y `height`. Quedaba de alto cero, y como las dos
caras van adentro en `position:absolute` con `inset:0`, medían cero también. Se
veían los numeritos y nada más. Un `display: block` lo arregló.

**UN 404 QUE SALÍA DE UN COMENTARIO.** Había un `<video src="...historia-1.mp4">`
de ejemplo DENTRO de un comentario HTML, y Chrome igual lo pedía: el preload
scanner lee las etiquetas que encuentra adentro de los comentarios para ir
bajando recursos antes de tiempo. El DOM estaba perfecto y la consola tenía un
404 rojo que parecía un bug de verdad. Regla: **en un comentario, los ejemplos de
código se describen, no se escriben con `src` real.**

**EL `<body>` NO CAMBIABA DE CLASE AL NAVEGAR CON SWUP.** Swup reemplaza solo lo
de adentro de `#swup`, así que al entrar a un proyecto desde la portada el body
seguía diciendo `pag-archivo` y TODO el CSS que cuelga de `.pag-54` (o de
`.pag-simbio`) no se aplicaba. Se veía bien solo entrando con refresh, que es
justo el caso que uno prueba y el que menos pasa de verdad. Arreglado para las
tres páginas: cada `<main id="swup">` declara `data-body` (y `data-cursor-pag`) y
`transiciones.js` los copia en el hook `page:view`.

**EL HERO EN EL TELÉFONO.** Las filas del hero están escritas a mano
(`grid-row`) para que el poster quede AL LADO del texto. Con una sola columna eso
hacía que el poster se metiera ENCIMA del titular. En la media query hay que
devolver los `grid-row` a `auto`.

### PERILLAS DE ESTA PÁGINA

Todas en `css/mas-54.css`, buscá `PERILLAS`:

| Perilla | Qué hace |
|---|---|
| `--tira-scroll-modulo` | velocidad del recorrido horizontal. Más alto = más lento |
| `--tira-alto` | cuánto se ve la tira de cerca |
| `--poster-alto` | tamaño del carrusel del hero |
| `--pieza-recorte` | cuántos px se le comen a los bordes de logo y paleta |
| `--teaser-ancho` | cuánto de la grilla ocupa el video del teaser |
| `--foto-paso` | cuánto espera cada foto de la casa respecto de la anterior |
| `--postal-perspectiva` | qué tan exagerado es el giro 3D de las postales |
| `--banda-alto` | alto de la banda de pictogramas |

Los ritmos NO están en el CSS ni en el JS: van en el HTML, en
`data-alterna` y `data-carrusel`, los dos en milisegundos.

### LO QUE FALTA

- La tarjeta de +54 del índice es **la única que linkea a una página**; las otras
  siete siguen cayendo en el ancla del pie. Cuando cada proyecto tenga su página,
  se cambia `href="#ancla"` por `href="proyectos/<slug>.html"` y se suma su CSS y
  su JS al `<head>` de `index.html` (mismo motivo de Swup de siempre).
- El copy dice "2025" en el hero y la tarjeta del índice dice "2021". **Hay que
  definir cuál es el año bueno.**

**Prototipo, recorte final (13/08/2026)**: de las 11 gráficas quedaron **solo
cuatro** — `Recurso 2, 3, 4 y 7`, los tres instructivos de la mano y la estructura
armada. Las otras siete eran piezas sueltas dibujadas: repetían en vector lo que
las fotos de abajo ya muestran en material, y le quitaban peso a las cuatro que
sí explican algo. Los archivos siguen en `assets/simbio/proceso/vectores/`.
El timelapse subió a `--timelapse-alto: 88svh`. Su techo no es el ancho —el video
es angosto y le sobra columna— sino la altura de la ventana: más de 90svh y hay
que scrollear para ver un video de 6 segundos.

---

## 19. La portada, segunda pasada: sacar y dar aire (20/08/2026)

Ronda de correcciones de Mati sobre la portada del mismo día. Casi todo fue
**sacar**: la página quedó con menos elementos y más aire.

### LO QUE SALIÓ

- **Los tres rótulos del hero** ("Archivo", "Buenos Aires · 2026", "Seguí
  bajando"). El hero es el nombre, la frase y la caja.
- **El divisor de papel rasgado** y la zona `crema-2`. La página entera es un
  solo crema de punta a punta, pie incluido.
- **El índice del pie** (el listado de los cinco con año y rubro). No cumplía
  una función que no cumpliera ya el grid.
- **El título "ARCHIVO" en grande.** Lo reemplaza un rótulo chico, "TRABAJOS",
  igual que los otros tres. La portada ya no tiene ningún título grande fuera
  del nombre del hero.

### LA CAJA DEL HERO

Una caja isométrica apoyada en el vértice de la esquina, con hojas y polaroids
tiradas alrededor en el piso.

**VA EN UN SVG APARTE del de las líneas.** Aquel tiene
`preserveAspectRatio="none"` —se estira sin respetar la proporción, que es
justo lo que las líneas necesitan para llegar siempre a las esquinas—, y un cubo
dibujado ahí adentro se aplastaría con cada tamaño de ventana. Este guarda su
proporción; lo que lo mantiene pegado al vértice es que **el JS le escribe
left/top junto con el punto de fuga**. Como las coordenadas del SVG de las
líneas van de 0 a 100 y el left/top son porcentajes del hero, es el mismo número
y no hay ninguna conversión en el medio.

Isometría 2:1. Las tres caras llevan tres claros distintos del mismo verde: con
un solo verde, el cubo se lee como un hexágono plano.

**EL BUG DE MOBILE: `top` NO SE PUEDE MOVER DESDE EL CSS.** En pantalla chica el
nombre cae justo sobre el vértice y la caja le quedaba encima. El primer intento
fue una media query con `top: 70%`, y no hizo nada: **el JS escribe el estilo en
LÍNEA, y eso le gana a cualquier regla de hoja de estilos.** Lo único que se
puede mover desde el CSS es el `transform`, que el JS no toca. La solución final
son dos cosas: el contenido del hero se va arriba (`align-content: start`) y la
caja cuelga un poco más abajo del vértice con un `translate`.

### EL AIRE ES EL ÚNICO SEPARADOR

Sin divisores y sin cambios de fondo, lo único que separa una sección de otra es
`--tramo-aire`, arriba de todo en `archivo.css`. **Es la perilla más importante
de la página**: si las secciones se sienten apretadas, se sube ahí y nada más.
Va en `clamp(5.5rem, 11vh, 10rem)`, atado al alto de la ventana, así en una
pantalla grande respira más y en un teléfono no se vuelve un desierto.

El mail del contacto bajó de peso 800 a 600: al tamaño que tiene, en 800
competía con el nombre del hero, que es lo único que debería pesar así.

### EL GRID: ORDENADO, RECTO Y DEL MISMO TAMAÑO

Las fichas cuelgan del mismo `.tramo` que los otros bloques, sobre las columnas
2 y 3:

```
    col 1        col 2            col 3         col 4
  TRABAJOS   [ ---------- SIMBIO ---------- ]
             [   MUSEO    ] [     +54       ]
             [  TIPINES   ] [    TESIS      ]
```

Simbio se lleva las dos columnas porque son **cinco**: de a dos quedaba una
suelta. Las otras cuatro miden exactamente lo mismo y **ninguna está inclinada**
(`--giro-ficha: 0deg`). La versión anterior las tenía torcidas y de tamaños
distintos; en un grupo de cinco eso se leía desprolijo, no desacomodado.

**LO QUE COSTÓ EMPAREJARLAS.** El pie de cada ficha mide lo que mide su texto,
así que una tarjeta con el título en dos líneas quedaba más alta que su vecina.
Tres cambios, y hacen falta los tres:

1. la ficha se estira al alto de su fila (`align-self: stretch` + flex) y el pie
   se empuja al fondo con `margin-top: auto`;
2. el título del componente bajó un escalón de tamaño — está pensado para una
   ficha del doble de ancho y acá se partía;
3. la categoría de Museo pasó de "Diseño industrial · Mobiliario" a "Diseño
   industrial". Se partía en dos líneas y el título ya dice mobiliario.
   **En una tarjeta de una columna entran unos 25 caracteres de categoría**; si
   se pasa, se parte y desalinea las imágenes de la fila.

**EL DIBUJO DE LÍNEA AHORA SE MIDE POR LOS DOS LADOS.** El componente le da solo
un ancho (% del marco) y el alto sale de la proporción del lienzo, 100x70. En la
ficha apaisada de Simbio (21:9) eso lo dejaba tan alto como el marco entero. El
`max-height` es el freno: cuando el alto se pasa, el navegador recalcula el ancho
solo y el dibujo mantiene su forma.

### LAS TARJETAS Y SUS LINKS

Linkean **las dos que tienen página terminada**: Simbio y +54. Las otras tres
tienen el `.ficha__cuerpo` como `<div>` y no como `<a>`, a propósito: mandar a
una página a medio hacer es peor que no mandar a ningún lado. Cuando cada una
tenga la suya, se cambia el `<div>` por `<a href="...">` y el CSS no hay que
tocarlo.

---

## 20. La portada, tercera pasada: una pantalla por sección (20/08/2026)

### CADA SECCIÓN OCUPA UNA PANTALLA

`min-height: 100svh` con el contenido centrado, en cada bloque de la portada.
La página se lee de a una idea por vez en vez de como una lista larga.

**`min-height` y no `height`**: la sección de trabajos es más alta que una
pantalla y tiene que poder crecer (mide ~1485px contra 900 de las otras cuatro).
**`svh` y no `vh`**: en el teléfono, `vh` cuenta el alto CON la barra del
navegador desplegada, así que una sección de `100vh` siempre queda un poco
cortada por abajo. `svh` usa el alto chico, el que de verdad se ve.

`--tramo-aire` sigue haciendo falta igual: es el que separa cuando una sección
pasa de una pantalla.

### EL HERO SE DIO VUELTA

Antes: nombre negro enorme contra el margen izquierdo, caja al costado. Ahora:
**la caja es lo que se mira** y el nombre la acompaña desde abajo, centrado,
chico y en verde, con una flecha que baja a la primera sección.

El texto **no** va pegado a la caja ni adentro de su SVG. La caja se mueve todo
el tiempo con el punto de fuga y un texto que se mueve solo es incómodo de leer:
la caja respira y el texto se queda quieto, apoyado en la grilla. Se logra con
`align-content: end` en el hero — el texto contra el borde de abajo, el medio
para la caja, y el aire de arriba como parte del dibujo.

**El copy quedó "El rincón donde guardo mis cosas"**, sin el "Este es" y sin
punto final.

### LA CAJA, CON DEGRADÉ

Dos cosas al mismo tiempo, y hacen falta las dos:

- **entre caras**, tres claros distintos — si fueran iguales, el cubo se lee
  como un hexágono plano;
- **dentro de cada cara**, un degradé de claro arriba a oscuro abajo — con
  relleno plano se ve como tres papeles pegados, no como un objeto.

Los degradés son `<linearGradient>` en el `<defs>` del SVG, en `index.html`, y
el CSS los llama con `fill: url(#caja-arriba)`. Van en el HTML y no en el CSS
porque un degradé de SVG es un elemento del dibujo, no un estilo.

Se sumaron las **cuatro solapas de la tapa** (cuatro líneas del centro del rombo
a cada punta, apenas más oscuras que la cara, no negras): es lo que hace que la
tapa se lea como una caja cerrada y no como un cubo macizo.

### LAS PASTILLAS EN LAS TARJETAS

Las tarjetas ahora llevan **las mismas pastillas que abren cada página de
proyecto** (`.proyecto__meta` en simbio.css): rótulo chico adentro de una
cápsula con borde fino. Reemplazaron a la línea de categoría con puntos y al año
suelto a la derecha. La ventaja no es solo estética: cada dato es una pieza
aparte, y cuando no entran en el ancho, la que sobra baja sola en vez de partir
una frase por la mitad.

**Los datos salen de la página de cada proyecto donde existe**, no de la lista
de `main.js`. Por eso **+54 pasó de 2021 a 2025**: su propia página dice
"Curaduría · Identidad visual · 2025".

**LA CUENTA QUE MANTIENE ALINEADAS LAS IMÁGENES.** En una tarjeta de una
columna, tres pastillas se reparten en dos filas; Tesis tiene una sola y ocupaba
una. Sin un mínimo, su pie quedaba más bajo que el de la ficha de al lado y las
dos imágenes de la fila terminaban a distinta altura. Por eso
`.ficha__meta { min-height: 2 pastillas + gap }` — **pero solo en las cuatro
chicas**: Simbio está sola en su fila, no tiene con quién emparejarse, y con el
mínimo puesto le quedaba un hueco de aire abajo del pie.

Medido después del arreglo: los marcos de la fila 2 terminan los dos en 4430px y
los de la fila 3 en 4854px.

### LA INVITACIÓN DEL CV

Un tercer párrafo en Sobre mí, sobre la idea de que el rincón se sigue llenando.
No es una tercera parte del CV sino una **nota al lector**, así que cambia de
color (verde) y entra por una rayita al costado en vez de por un título — el
mismo recurso de `.etiqueta--marca`, que es como el acento entra en todo el
sitio: dos píxeles de color, nunca una superficie.

**El texto lo escribió Claude**: está marcado con un comentario en el HTML para
que Mati lo reescriba con sus palabras.

---

## 21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)

Mati: *"FIJATE QUE ESTÁ FLOTANDO, la perspectiva está mal"*. Tenía razón, y eran
**dos errores distintos** al mismo tiempo.

### ERROR 1 — LAS DIAGONALES CAMBIABAN DE ÁNGULO CON LA VENTANA

La caja está dibujada en **isometría 2:1** (por cada 2 de ancho, 1 de alto), o
sea **26,565°** — el arcotangente de 0,5. El piso del cuarto tiene que estar
exactamente en ese ángulo o la caja no se apoya en nada.

Pero las diagonales eran un SVG con `preserveAspectRatio="none"` que iba del
vértice a las esquinas de la pantalla, así que su ángulo dependía de la
proporción de la ventana. Medido:

| ventana | ángulo de la diagonal | ángulo de la caja |
|---|---|---|
| 1920 x 900 | 22,9° | 26,57° |
| 1440 x 900 | 29,4° | 26,57° |
| 1280 x 720 | 26,85° | 26,57° |
| 430 x 900 (teléfono) | 62,0° | 26,57° |

Coincidían **en una sola medida de ventana** y en todas las demás la caja
quedaba colgada en el aire. Por eso "a veces se ve bien y a veces no".

**La solución es no dibujar las líneas.** Ahora son tres barras de CSS rotadas
`26.565deg` — una rotación en CSS es un ángulo de verdad y no se deforma con
nada. El piso está siempre en el ángulo de la isometría, en cualquier pantalla.
El SVG estirado se fue.

### ERROR 2 — LA CAJA ESTABA ANCLADA EN EL VÉRTICE EQUIVOCADO

En una caja apoyada en un rincón, el vértice del cuarto **NO es el vértice de
abajo de la caja: es el de ABAJO Y ATRÁS**, el que no se ve. La arista de las
paredes pasa por detrás del cubo y asoma arriba; las dos del piso salen de atrás
y aparecen justo en los vértices de abajo a izquierda y a derecha, que quedan
**apoyados** sobre ellas.

En una isometría 2:1 el contorno del cubo es un hexágono perfecto y **su centro
es a la vez el vértice de arriba-adelante y el de abajo-atrás**. En el lienzo de
la caja ese punto es el `100,62` — el 50% del ancho y el **38,75%** del alto.
Estaba anclada en el `100,96` (abajo y adelante), y por eso colgaba del vértice
en vez de apoyarse en él.

### LA ESTRUCTURA QUE LO HACE IMPOSIBLE DE ROMPER

Antes había **dos cosas moviéndose en paralelo**: el JS escribía las
coordenadas de las líneas por un lado y el left/top de la caja por otro. Dos
cuentas separadas que tenían que dar lo mismo.

Ahora hay **una sola**: un `<div class="esquina">` de **0x0** parado en el
vértice, con las tres líneas y la caja colgando de él. El JS mueve ese div y se
mueve el conjunto entero de una pieza. No hay nada que pueda desalinearse porque
no hay dos cosas que alinear.

El punto de reposo vive en el CSS (`--fuga-x` / `--fuga-y`, en `.esquina`) y el
JS solo le suma el vaivén. Un número, un lugar.

Verificado a 1920x900, 1440x900, 1280x720 y 430x900: **ángulo de la diagonal =
ángulo de la arista de la caja = 26,565°** en las cuatro, y **0 px de desvío** en
los tres puntos de contacto (los dos vértices de abajo sobre las diagonales, y
el punto de apoyo sobre el vértice).

### EL BUG QUE ESCONDIÓ EL ARREGLO: `max-width: 100%` SOBRE UN PADRE DE ANCHO 0

Al mudar la caja adentro de `.esquina`, desapareció de la pantalla. El reset de
`base.css` le pone `max-width: 100%` a **todos** los `svg`, y ese 100% se mide
contra el contenedor — que ahora mide **cero** de ancho a propósito. La caja se
achicaba a 0.

**Lo peor no fue eso: fue que no desapareció del todo.** Los `<polygon>` de
adentro siguen informando su posición en el espacio del usuario aunque el
viewport del SVG mida 0, así que la primera medición automática dio
`0 px de desvío` en todo y **parecía perfecta**. Los números estaban bien
porque todos los puntos habían colapsado en el mismo lugar.

Se arregla con `max-width: none` en `.caja`. La lección más general:
**una medición que da 0 puede ser "está perfecto" o "no hay nada que medir"** —
conviene chequear también que el elemento tenga tamaño.

### SOBRE HACERLO EN 3D

Se evaluó y se descartó, por ahora:

- **Three.js** — ~600 KB y un canvas WebGL para dibujar tres polígonos. El sitio
  no tiene build step y la referencia que quiere Mati es justamente un dibujo
  **plano** e isométrico, no un render. Además no arreglaba nada: el problema
  no era 2D contra 3D, era que el piso y la caja estaban a ángulos distintos.
- **Transformaciones 3D de CSS** (seis divs y un `rotateX`/`rotateZ`) — es "3D
  simple" sin librerías y es una opción real si algún día la caja tiene que
  girar. Los contras hoy: los cubos de CSS 3D dejan costuras finitas entre
  caras por el antialias, y los degradés y los agarres se vuelven más
  incómodos que en SVG.

**Queda en SVG**, que es lo que da el trazo más limpio y lo que se parece a la
referencia. Si algún día la caja tiene que rotar de verdad, la opción es CSS 3D,
no una librería.

---

## 20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)

Mati revisó la página entera y bajó una lista larga. Lo que quedó:

### LO ESTRUCTURAL

**LA APERTURA ES LA MISMA QUE LA DE SIMBIO.** El hero tenía un titular gigante
(hasta 15rem) sobre fondo negro. Ahora es la misma columna de apertura que
Simbio, pieza por pieza: flecha de volver, título al tamaño de `.proyecto__titulo`,
las tres pastillas de clasificación y la bajada. Y va sobre CREMA, no sobre negro.

Las clases son las mismas (`.proyecto__col`, `.proyecto__titulo`,
`.proyecto__meta`, `.proyecto__bajada`) y los estilos están **copiados** en
`mas-54.css`. Traer `simbio.css` entero arrastraría también su sistema
tipográfico y sus overrides de fondo. **Si se toca uno, hay que tocar el otro.**
El día que exista una tercera página de proyecto, esto se muda a `layout.css`.

**TIPOGRAFÍA ARCHIVO**, con el rango `300..900` (el titular va en 900 y los copys
en 300). Y `--font-mono` también apunta a Archivo, igual que en la portada.

**SIN NUMERAR LAS SECCIONES.** Los "01", "02"… convertían la página en un índice
de once puntos. Es un recorrido, no un índice: queda solo el nombre.

**NADA INCLINADO Y NADA REDONDEADO.** Se sacaron todas las micro-rotaciones y
todos los `border-radius` de imágenes y videos. Es una excepción deliberada al
principio de composición del sitio: acá TODAS las piezas son diseño gráfico
terminado, con su propia caja y sus propios márgenes. Inclinarlas o redondearles
una esquina es dibujar encima del trabajo.

### CADA PARTE

| Parte | Qué cambió |
|---|---|
| Hero | crema, apertura tipo Simbio, carrusel de posters crudos |
| Banda | separador bajo entre hero y "Qué es", el pictograma entero |
| Qué es | la frase clave en verde; se fueron los pies y el crédito |
| La tira | de arriba abajo de la pantalla, y frena de a una publicación |
| Historias | las tres a la vez, enteras, con botón de sonido |
| Teaser | video más chico, franja negra igual, controles usables |
| Instalación | 4 fotos apareciendo en diagonal, en lugar del video |
| La casa | el recorrido pasó a una sección a pantalla completa |
| El sitio | el mockup de borde a borde, sin el link de abajo |
| Postales | sin cartelito; 4 arrancan dadas vuelta |
| Manual | tres polaroids iguales que se abren con la lupa |

**EL CARRUSEL, POR QUÉ RIEL Y NO FUNDIDO.** Las cuatro imágenes estaban apiladas
fundiéndose una sobre otra. Eso no se lee como carrusel: se lee como parpadeo, o
como una imagen que falla. Ahora van en una fila que se corre de a un poster y se
ve que la siguiente ENTRA desde el costado.

**LA TIRA FRENA DE A UNA PUBLICACIÓN.** Mientras el dedo o la rueda se mueven, la
tira sigue al scroll sin resistencia — frenarla en el momento se siente como que
la página se traba. El acomodo pasa DESPUÉS, cuando el scroll se queda quieto
140 ms: ahí busca el borde de poster más cercano y lleva la página ahí con Lenis.
Medido: cae a menos de 0,5 px del borde en todo el recorrido. `scroll-snap` no
sirve para esto porque el que scrollea es la página y lo que se mueve es un
`transform`.

**LAS 4 FOTOS DE LA CASA APARECEN EN DIAGONAL:** arriba-izquierda,
abajo-derecha, abajo-izquierda, arriba-derecha. Así la grilla se arma como un
objeto que se despliega, en vez de una lista que se completa de a un renglón. El
turno de cada una es su `--orden` en el HTML; el CSS lo convierte en un
`transition-delay`. **Los archivos están numerados en ese orden**, así que en el
HTML los números van salteados (1, 4, 3, 2 leídos de izquierda a derecha).

**LAS POSTALES: CUATRO ARRANCAN DADAS VUELTA** (la 2, 4, 5 y 7). Reemplaza al
cartelito de "pasá el cursor": ocho frentes iguales no invitan a nada, cuatro
frentes y cuatro dorsos mezclados hacen la pregunta solos. Los números están
elegidos a mano — al azar, dos de cada tres veces quedan tres juntas de un lado y
se lee como un error.

### BUGS DE ESTA RONDA

**EL FILO NEGRO DE LOGO Y PALETA.** Los dos videos vienen con una línea negra
pegada al borde de abajo y al de la derecha (basura del render). Se sacan
agrandando el video 3px y corriéndolo en diagonal, para que esos bordes queden
fuera del marco. **No alcanzaba con el `calc()`**: `base.css` le pone
`max-width: 100%` a todo `<video>` en el reset, y ese tope le ganaba — el video
se quedaba con el ancho del marco y seguía viéndose una franja de 3px. Hay que
poner `max-width: none`. Medido: 636px de video contra 642 esperados.

**LAS 4 FOTOS DE LA INSTALACIÓN SALÍAN CON FONDO NEGRO.** Los originales tienen
FONDO TRANSPARENTE, y el JPEG no guarda canal alfa: al convertirlas, ffmpeg
rellenaba la transparencia con negro y las cuatro quedaban como un rectángulo
negro con la pieza adentro. Salen como **PNG**. Y antes de escalarlas se les saca
el aire transparente con `tools\recortar-transparencia.ps1` —el mismo script que
ya existía para los renders de Simbio— porque si no, el ancho del CSS se lo come
el vacío y las habitaciones se ven diminutas.

**LAS HISTORIAS CON FRANJAS NEGRAS AL COSTADO.** Tenían alto fijo en svh y
`object-fit: contain`; como la caja quedaba más ancha que 9:16, aparecían dos
barras negras en cada una. La caja tiene que tener LA PROPORCIÓN DEL VIDEO
(`aspect-ratio: 9/16`): así no sobra nada que rellenar ni falta nada que recortar.

**NO SE PODÍA NAVEGAR EL TEASER.** Dos cosas: los `controls` los agregaba el JS
recién al hacer play (o sea que hasta entonces no había barra de tiempo), y la
tapa tenía `inset: 0`, así que cubría y oscurecía los controles. Ahora los
`controls` van desde el HTML y la tapa lleva `inset: 0 0 56px 0`, que es el alto
de la barra de controles de Chrome.

**EL CARRUSEL SE SALÍA DE LA PANTALLA EN EL TELÉFONO.** Al reescribir el CSS se
perdió la media query del hero. La ventana del carrusel se mide a partir de
`--poster-alto` y la columna se fija con `grid-column: 3 / span 2`: con una sola
columna, eso deja el poster empezando fuera de la pantalla. **Ojo con esto cada
vez que se reescriba una sección: el `overflow-x: clip` del `<html>` esconde el
desborde, así que medir `scrollWidth` da cero y parece que está todo bien.**

### LO QUE FALTA

- **El año.** El hero dice 2025 y la tarjeta del índice dice 2021. Definir cuál.

---

## 22. La caja de cartón, y por qué se trababa (20/08/2026)

Dos pedidos distintos de Mati: *"no parece una caja"* y *"se traba un poco la
animación"*. Eran dos problemas sin relación.

### QUÉ HACE QUE PAREZCA UNA CAJA Y NO UN CUBO VERDE

Con la geometría ya arreglada (sección 21) seguía leyéndose como un cubo. Lo que
faltaba, en orden de cuánto aporta cada cosa:

1. **LA TAPA SON CUATRO SOLAPAS, NO UNA CARA.** Es lo que más cambia. Una caja
   se cierra plegando cuatro solapas que se cruzan al medio, así que la tapa no
   es una superficie sola: son cuatro triángulos que se juntan en el centro.
   **Y cada uno lleva un verde apenas distinto** — al quedar plegadas, las
   solapas nunca terminan exactamente en el mismo plano y cada una toma la luz
   de otra manera. Con las cuatro iguales se ve una tapa impresa con un dibujo;
   con la diferencia puesta, se ve cartón plegado. Las diferencias tienen que
   ser CHICAS: exageradas, pasa a ser un dibujo de triángulos de colores.

2. **LA SOMBRA DE APOYO.** Sin una mancha en el piso, un objeto bien dibujado
   igual se lee suspendido. Es la huella de la caja, desenfocada y corrida hacia
   adelante. Verde muy oscuro y no negro: una sombra negra sobre un fondo cálido
   se ve sucia.
   Ojo con los filtros de SVG: **por defecto solo pintan un 10% más allá de la
   figura**, así que un desenfoque grande se corta con un borde recto. Hay que
   agrandar la región a mano (`x="-40%" width="180%"`).

3. **EL CANTO DEL CARTÓN.** Una banda finita por dentro del borde de adelante de
   la tapa: el espesor de la lámina visto de canto. Va más claro que la tapa
   porque el corte del cartón no está impreso, es fibra cruda. Sin esto la tapa
   y los laterales se juntan en una arista matemática y el cubo se lee como una
   figura, no como un objeto hecho de un material.

4. **LOS AGARRES SON DOS TRAZOS, NO UNO.** El ancho y oscuro de abajo asoma
   alrededor del claro de arriba y arma un anillo. Ese anillo es todo: sin él se
   leen como dos rayas pintadas encima de la tapa; con él, como agujeros con
   espesor. Van espejados, cada uno acompañando el borde de SU solapa.

5. **Los papeles del piso, más chicos.** Estaban tan grandes que competían con
   la caja y parecían baldosas.

**Un intento intermedio que NO funcionó:** cambiar las cuatro solapas por UNA
sola costura al medio (que es como se cierra una caja de mudanza real, con las
dos solapas grandes encontrándose en el centro). Es más correcto pero se ve
peor y no es lo que muestra la referencia: quedó la cruz de cuatro.

### POR QUÉ SE TRABABA: `left`/`top` CONTRA `transform`

El vaivén se hacía escribiendo `left` y `top` en cada cuadro. **Eso obliga al
navegador a rehacer el LAYOUT de la página entera 60 veces por segundo**, y con
el hero a pantalla completa se siente como un temblor.

Ahora se mueve con `transform: translate3d(...)` y el elemento lleva
`will-change: transform`. El navegador dibuja la esquina una sola vez, la guarda
como una capa aparte y después solo la corre de lugar: trabajo de la placa de
video en vez del procesador. El `3d`, aunque la z sea 0, es lo que pide esa capa
propia.

De paso, el punto de reposo queda intacto en el CSS (`--fuga-x` / `--fuga-y`)
porque el transform es un corrimiento RELATIVO — antes el JS pisaba esos valores.

**Medido con Performance.getMetrics, 4 segundos de animación a 1920x900:**

| | |
|---|---|
| cuadros | 241 en 4 s (o sea 60 fps clavados) |
| tiempo por cuadro | mediana 16,7 ms · p95 16,8 ms · peor 16,8 ms |
| cuadros de más de 20 ms | 0 |
| **LAYOUTS durante la animación** | **0** |

Ese último número es el que importa y es el que hay que volver a mirar si algo
se traba: **si una animación toca el layout, se va a sentir**. La regla es animar
`transform` y `opacity`, nunca `left`, `top`, `width` ni `height`.

Las amplitudes del vaivén pasaron a estar **en píxeles** (`ampX: 16`,
`ampY: 10`), que antes eran porcentajes del hero y por eso el recorrido cambiaba
de tamaño con la ventana.

---

## 23. La caja como caja, el aire y un solo crema (21/08/2026)

### LA DIAGONAL QUE NO IBA: LA TAPA TIENE DOS SOLAPAS, NO CUATRO

Mati marcó en rojo la línea que cruzaba de la punta izquierda a la derecha del
rombo de arriba. **Sacarla no era borrar una raya: era cambiar la tapa.**

Una caja de cartón se cierra plegando **dos** solapas grandes que se encuentran
en el centro, así que lo que se ve desde arriba es **una sola costura**, de punta
a punta en un solo sentido. Con cuatro solapas aparecía la cruz — y la cruz no
existe en una caja.

(En la sección 22 había quedado anotado justo al revés: que las cuatro solapas
eran lo correcto y una sola costura "se veía peor". Estaba mal: la cruz era
exactamente lo que hacía que no pareciera una caja.)

Sigue en pie lo otro de aquella sección: **cada solapa lleva un verde apenas
distinto**, porque plegadas nunca terminan en el mismo plano.

### LOS AGARRES: EL AGUJERO VA OSCURO

Estaban claros y por eso se veían raros. **Un agujero que muestra el interior de
una caja no puede ser más claro que la tapa.** Ahora van en dos capas:

1. una cápsula CLARA corrida un pelo hacia abajo — el canto del cartón
   troquelado, la fibra cruda que queda a la vista en el borde cercano;
2. encima, la cápsula OSCURA: el interior, en sombra.

### LA ANIMACIÓN: DE ARRIBA A ABAJO, Y LA PERSPECTIVA ACOMPAÑA

El vaivén en dos ejes con dos períodos distintos se leía como un movimiento
errático — la esquina se iba para cualquier lado. Ahora es **un solo movimiento**
de arriba abajo y de vuelta.

**Y no alcanza con mover.** Si el dibujo se desliza entero y rígido, parece un
sticker. Lo que lo convierte en una cámara es que al bajar se vea MÁS el piso
—las diagonales se abren, la tapa se ve más grande, los laterales se acortan— y
al subir, menos.

Eso se consigue con **un solo número**: un `scaleY` sobre todo el bloque de la
esquina. Y funciona sin romper nada porque **escala TODO junto**: la pendiente de
las diagonales y la de las aristas de la caja se multiplican por lo mismo y
siguen coincidiendo. La geometría de la sección 21 se mantiene exacta durante
toda la animación.

Medido a lo largo del ciclo: el ángulo del piso va de **25,35° a 27,8°** y el
alto de la caja de **250 a 278 px**, los dos ligados al mismo seno. Sigue en
`transform`, así que sigue en 0 layouts.

### UN SOLO CREMA

`.zona--crema` trae un **degradé** de fondo (`--grad-crema`, de #F7F2E8 a
#ECE4D3 en diagonal). Con una sección por pantalla eso se nota mucho: cada
bloque tenía su propio degradé y al scrollear se veían bandas y cambios de tono
que no respondían a nada. Sumado a los cremas sueltos de los papeles y los
agarres, había cinco parecidos conviviendo.

Ahora la portada pisa la variable y usa **un color plano, `--crema`**, de punta a
punta: nav, secciones, pie y hasta los papeles del piso del hero. **A los papeles
lo que los despega del suelo es la sombra y la línea del borde, no un tono
distinto** — que es como funciona de verdad una hoja apoyada sobre una mesa del
mismo color.

### FUERA LAS RAYAS

Había una línea fina de borde a borde al principio de cada tramo y otra encima de
cada categoría de herramientas. Con cada sección ocupando una pantalla, esas
rayas no separaban nada: quedaban **flotando en el medio del aire**, a media
altura, sin nada arriba ni abajo. Lo que separa una sección de otra es el aire.

### EL NOMBRE Y LA FRASE, DEL MISMO LARGO

No se logra eligiendo un tamaño a ojo: los dos textos crecen con la ventana y a
cada ancho la relación sería otra. **La frase no tiene tamaño propio: se calcula
como una fracción del nombre** (`calc(var(--nombre-tam) * 0.4875)`), así los dos
escalan juntos y la relación entre sus anchos queda igual en cualquier pantalla.

De dónde sale el 0,4875: el nombre son 14 caracteres en peso 800 y la frase 32 en
peso 400. Medido, el nombre ocupa 9,09 px de ancho por cada px de tamaño de letra
y la frase 18,64; la fracción es el cociente. **Es lo único que hay que
recalcular si cambia alguno de los dos textos.** El kerning no se toca.

Verificado a 1920, 1440, 1280 y 900 de ancho: **0,8 px de diferencia** entre los
dos, siempre.

### APTITUDES

Sección nueva entre Sobre mí y Herramientas: **qué sabe hacer**, contra
Herramientas que es **con qué lo hace**. Una lista sin viñetas, sin líneas y sin
columnas — son siete renglones que se leen de un tirón, y repartidos en columnas
habría que decidir cuál va primero cuando ninguno es más importante que otro.

El párrafo largo de cierre del CV se reemplazó por una línea: *"Estoy abierto a
seguir ampliando mi rincón."*, sin el recuadro con rayita al costado.

### 20-bis. La banda de pictogramas y el video de la casa (20/08/2026)

**LA TIRA DE PICTOGRAMAS: NO ES UNA BANDA DE PUNTA A PUNTA.**
Se intentó tres veces y las tres se vieron mal. Queda anotado porque el impulso
de volver a hacerla full-bleed va a estar siempre.

`ilustraciones.mp4` es **un cuadro de 1460x820** con pictogramas grandes que van
pasando, no una tira infinita. Recortado al dibujo queda 2,8:1. Meter eso en una
franja de ancho completo y poca altura (7:1 o más) tiene exactamente **dos**
resultados posibles:

| Intento | Qué pasó |
|---|---|
| `cover` en banda de 216px | escala por el ancho y recorta el alto: parte los pictogramas al medio. Se veía como una lonja de magenta con un pedazo de dibujo cruzando |
| `contain` + fondo magenta | no corta nada, pero el video entra al 44% del ancho: dos bandas de relleno a los costados. Pintarlas del mismo color no alcanza, el vacío se sigue leyendo |
| alto = ancho / 2,8 (508px) | los pictogramas llegan a los dos bordes, pero 508px no es un separador, es una sección |

**No hay tercera opción: el archivo no tiene más ancho para dar.** Es
`alto = ancho / proporción`, y la proporción la fija el contenido.

**Así que no se fuerza.** El video se muestra como lo que es —un rectángulo de
2,8:1— apoyado sobre el crema, centrado, con aire arriba y abajo. Sin recorte,
sin relleno y sin bandas, porque no hay ninguna caja que llenar. Y es más
consistente con el resto de la página, donde todo el material se apoya como una
pieza sobre el fondo. Las perillas son `--tira-ancho` y `--tira-aire`.

**DE PASO, UN HALLAZGO QUE SIRVE PARA CUALQUIER VIDEO DEL SITIO.** Mientras se
probaba el fondo magenta apareció una costura vertical nítida en el borde del
video, con el fondo puesto en `#D30A59` — el color medido sobre los píxeles del
mp4. El motivo: **el navegador no pinta el color que el archivo guarda.** El
video viaja en YUV y al convertirlo a RGB para mostrarlo queda en `#D50B5A`.
Dos puntos de corrimiento, invisibles en aislado, imposibles de ignorar contra
un fondo CSS exacto. Verificado sacando los colores de una captura de la página.
**Si alguna vez hay que hacer coincidir un fondo CSS con un video, el color se
saca de una captura de pantalla, no del archivo.**

**EL RECORTE SE MIDIÓ MAL DOS VECES.** Primero se copiaron filas medidas sobre
la versión web (1280x718) al filtro `crop`, que se aplica al **original**
(1460x820): quedó corrido. Después se midió sobre cuatro cuadros sueltos, y
sirvió para esos cuatro nada más. **La medición buena es un cuadro por segundo a
lo largo de los 43 s**, buscando en cada uno la primera y la última fila con
dibujo: la unión da 144 a 644 de 820. El recorte final toma desde la 132, 520 px
de alto.

**EL VIDEO DE LA CASA SE VEÍA CORTADO.** Estaba clavado en `height: 100svh` con
`object-fit`, así que el resultado dependía de la forma de la ventana: en una
pantalla más apaisada que el video quedaba recortado arriba y abajo. Ahora manda
el ancho (`width: 100%`) y el alto sale solo. Lleva además `aspect-ratio: 16/9`
escrito: con `preload="none"`, hasta que el archivo no empieza a bajar el
navegador le asigna 300x150 a un `<video>` sin metadatos, reserva un hueco de la
altura equivocada y la página pega un salto cuando el video carga.

## 24. La nav: siete cosas rotas al mismo tiempo (21/08/2026)

Mati lo reportó junto, como una sola sensación: "la NAV BAR funciona mal, no
linkea bien o está desfasada, no llega a los bordes". Eran siete bugs distintos
que se sumaban. Van con lo que se midió, no con lo que parecía.

**1. LA BANDA NO LLEGABA A LOS BORDES.** `.site-nav` es `position: fixed` **y**
`.grilla`, y `.grilla` trae `max-width: 1400px` + `margin-inline: auto`. En un
elemento fijo con `left: 0` y `right: 0` puestos, el margen automático **centra
la caja entera**: el crema y el blur terminaban en 1400 px. Medido en una
ventana de 1920: la banda iba de 252 a 1652 y quedaban 252 px de página asomando
a cada lado. Por eso se leía como flotando, no como una barra.

El arreglo NO es sacarle la grilla: los botones tienen que seguir cayendo en las
cuatro columnas. Es separar la banda de las columnas con padding en vez de
margen — `max-width: none` y

```css
padding-inline: max(var(--gutter), (100% - var(--ancho-max)) / 2 + var(--gutter));
```

En pantalla angosta el `max()` da `--gutter`, igual que cualquier bloque; en
pantalla ancha da el sobrante de los costados más el gutter, que es exactamente
donde arranca un `.grilla` centrado. Medido después: banda 0→1905, primer botón
en 300.5 y último en 1604.5, **los mismos números** que el contenido de la
página. Alineación exacta, fondo de punta a punta.

**2. LA NAV VIVE FUERA DE `#swup`, ASÍ QUE SWUP NO LA REEMPLAZABA.** Este era el
peor y el más difícil de ver. Al navegar quedaba colgada la nav de la página
anterior, con sus links relativos intactos: desde la portada entrabas a un
proyecto y el botón Home seguía diciendo `index.html`, que parado en
`/proyectos/` apunta a `/proyectos/index.html` — **404**. El botón verde de
"estás acá" también quedaba en el lugar equivocado.
Arreglo: `containers: ["#swup", ".site-nav"]`. Cada página trae su nav. No se le
pega el fade porque el selector de animación es `[class*="transicion-"]` y la
nav no lleva esa clase.

**Y ojo con el efecto de segundo orden:** al reemplazarse el nodo,
`initNavEsquiva` le seguía poniendo la clase `is-oculta` a una nav que ya no
estaba en la página, y la barra dejaba de esconderse después de la primera
navegación. Los listeners van en `window` y se ponen una sola vez, pero la
referencia al nodo hay que **volver a apuntarla en cada init** (`navActual`).

**3. DOS ANCLAS QUE NO EXISTÍAN.** `+54` linkeaba a `index.html#archivo` y las
seis páginas viejas a `index.html#proyectos`. Los ids reales de la portada son
`#sobre`, `#herramientas`, `#contacto` y `#trabajos`: **ni `#archivo` ni
`#proyectos` existen en ninguna parte**. Siete links que no llevaban a ningún
lado — se clickeaban y no pasaba nada. Todos ahora a `#trabajos`.
Vale la pena tener el chequeo a mano, porque un ancla muerta no da error:

```js
[...document.querySelectorAll('a[href*="#"]')]
  .filter(a => a.hash.length > 1 && !document.getElementById(a.hash.slice(1)))
```

**4. EL ORDEN DE LOS BOTONES CAMBIABA ENTRE PÁGINAS.** Simbio tenía Home /
Trabajos / Sobre mí y la portada Home / Sobre mí / Trabajos. Con la nav ya
reemplazándose (bug 2), eso son botones que **se cambian de lugar** al entrar a
un proyecto. Unificado al orden de la portada en las tres páginas.

**5. ES/EN ERAN `<a href="#">`.** Un href vacío es un ancla al tope del
documento: hacer clic en ES te disparaba la página para arriba. Son `<button
type="button">` sin handler hasta que exista la versión en inglés. `.pastilla`
necesitó tres líneas de reset (`font-family: inherit`, `background:
transparent`, `cursor: pointer`) para que el botón no traiga lo del navegador.

**6. LAS ANCLAS PELEABAN CON LENIS.** Dos caminos distintos, los dos rotos:

- *Entrar directo* (`index.html#sobre`, un refresh, un link pegado): el salto lo
  hace el navegador al parsear, pero Lenis arranca leyendo la posición y
  escribiéndola cada cuadro, y lo pisaba. **Medido: quedaba en el hero.** Ahora
  se rehace el salto en el `load`, y encima esperando `document.fonts.ready` —
  sin eso `#sobre` caía 46 px más abajo, porque el texto de arriba se reacomoda
  cuando entra Archivo (`display=swap`).
- *Clic dentro de la misma página*: lo resolvía `scroll-behavior: smooth` del
  navegador mientras Lenis empujaba por su lado. Ahora el ancla pasa por Lenis.
  El listener va en `document`, no en cada `<a>`, para que sobreviva a Swup.

**7. A LENIS HAY QUE PASARLE UN NÚMERO, NO EL ELEMENTO.** Con
`lenis.scrollTo(elemento, { offset: -48 })` el resultado **no era el mismo para
todas las secciones**: `#herramientas`, `#contacto` y `#trabajos` caían clavadas
a 48 px del tope y `#sobre` a 96. Se revisaron las cuatro y son idénticas —
mismo `offsetTop`, mismo `scroll-margin-top: 48px`, sin transform, `static`—,
así que la diferencia está en cómo Lenis resuelve el elemento y dónde se le
cruza el `scroll-margin` del CSS con el offset. La cuenta a mano no tiene esa
ambigüedad:

```js
el.getBoundingClientRect().top + window.scrollY - AIRE_NAV
```

Después del cambio, las cuatro a 48. **`AIRE_NAV` está escrito dos veces** —en
`smooth-scroll.js` y en `transiciones.js`— y tiene que coincidir con el
`scroll-margin-top` de `archivo.css`. Si cambia uno, cambian los tres.

**CÓMO SE VERIFICÓ, QUE ES LA PARTE QUE IMPORTA.** No alcanza con mirar la
página: la primera captura del ancla salió a mitad de la animación y no decía
nada. Se manejó Chrome desde afuera (CDP por el puerto 9222) para hacer clics de
verdad y leer números. La navegación completa simbio → clic en "Sobre mí" →
portada dio: URL `/index.html#sobre`, body `pag-archivo`, nav reemplazada, Home
resuelto a la raíz, `#sobre` a 48 px, cero 404. Y al revés, portada → +54, el
href de Home pasa de `index.html` a `../index.html` — que es la prueba de que la
nav se está reemplazando. Mobile a 390 px: banda 0→390, `display: flex`,
padding 24. Las capturas sirven para mirar la grilla con `?grid`; para todo lo
demás, números.

**QUEDA PENDIENTE, NO ES DE LA NAV:** `index.html` linkea a
`proyectos/loquesea.html`, que no existe. Es la tarjeta de relleno del grid.


---

## 25. Amigos Tipines: la tercera página de proyecto (21/08/2026)

Se armó `proyectos/amigos-tipines.html` entera, con `css/tipines.css` y
`js/tipines.js`. El HTML que había era el esqueleto viejo de cinco bloques en
Nunito: se reemplazó completo. La ficha 04 del índice ya linkea.

**LAS NUEVE SECCIONES, EN ORDEN:** hero con paneo de tres piezas · intro al
libro · el libro hojeable · banda negra de la miniserie · la tele · la ficha
del proceso · los juguetes · el mini-juego · la reflexión final.

El ritmo de zonas es lo que puntúa una página con tanto material:
`crema · crema · crema-2 · NEGRO · crema-2 · crema · crema-2 · NEGRO · NEGRO`.
Dos apagones: uno corto en el medio y uno largo al final.

### LOS ASSETS: 480 MB QUE NO SE PODÍAN SERVIR

`tools/optimizar-tipines.ps1`, misma forma que el de +54. Dos archivos eran
todo el problema:

| | original | web | |
|---|---|---|---|
| `VIDEO_FINAL_TIPINES.mp4` | 311 MB | **15,4 MB** | 2:40 · 1080p · 15,5 Mbps |
| `imagenes/HERO3.mov` | 139 MB | **926 KB** | 8 s · códec **DXV** |
| las 17 páginas del libro | 22 MB | **4,3 MB** | PNG → JPEG |

**EL .MOV NO ERA UN PROBLEMA DE PESO, ERA DE CÓDEC.** DXV es el códec de
Resolume, para descomprimir en la placa de video de una VJ. **Ningún navegador
lo reproduce**: puesto en un `<video>` no se ve nada, ni en Chrome ni en Safari.
No hay perilla que lo arregle, tiene que pasar por ffmpeg. Ocho segundos de
video ocupando 139 MB son 16 MB por segundo.

**TRES ARCHIVOS SALEN EN PNG Y NO EN JPEG, Y NO ES CAPRICHO:** `tele.png` y las
dos hojas de sprites tienen fondo transparente, y eso es para lo que sirven. El
video de la miniserie se ve por el agujero de la pantalla de la tele; los
sprites se apoyan sobre el fondo de la sección. JPEG no tiene canal alfa.

### EL LIBRO HOJEABLE: EL PROBLEMA QUE NO SE VE HASTA QUE LO ARMÁS

En la carpeta hay 17 archivos y **no son 17 páginas**: son una tapa A4, 15
**pliegos** A3 (dos A4 unidas por el lomo) y una contratapa A4.

Y **una hoja de papel no es un pliego**. Una hoja lleva la mitad DERECHA de un
pliego de un lado, y la mitad IZQUIERDA del pliego siguiente del otro. O sea que
ninguna imagen coincide con ninguna hoja. Con 15 pliegos salen **16 hojas**:

```
hoja 0     frente = tapa (entera)        dorso = mitad izq. pliego 1
hoja k     frente = mitad der. pliego k  dorso = mitad izq. pliego k+1
hoja 15    frente = mitad der. pliego 15 dorso = contratapa (entera)
```

Con N hojas pasadas se ve el pliego N entero: la mitad izquierda es el dorso de
la hoja N-1 y la derecha es el frente de la hoja N. Cierra exacto, y **por eso
el giro es de 180 grados justos** y no de 168 como el del sandbox: acá la hoja
aterrizada no es decoración, ES la mitad izquierda del pliego que se está
leyendo. Un grado de más y el pliego queda quebrado por el medio.

**LAS MITADES NO SE RECORTAN EN DISCO.** La imagen entra al 200 % del ancho de
la cara y se corre: en `left: 0` se ve la mitad izquierda, en `left: -100%` la
derecha. Un solo archivo por pliego, y el navegador muestra la parte que
corresponde.

**LAS 32 CARAS NO ESTÁN ESCRITAS EN EL HTML.** Las arma `initLibro()` a partir
de `data-libro-pliegos`, porque las 32 salen de la misma cuenta y escribirlas a
mano es equivocarse en una. De paso, solo les pone el `src` a las que están a
menos de dos hojas de la abierta: el libro entero pesa 4,3 MB y bajarlo completo
para ver la tapa sería exactamente el problema que el script vino a resolver.
**Medido: con el libro abierto en el pliego 3 hay 12 de 32 imágenes cargadas.**

### CATÁLOGO DE BUGS DE ESTA SESIÓN

**1. `max-width: 100%` OTRA VEZ, Y ES EL MISMO DE LA CAJA DE LA ESQUINA.**
`base.css:27` tiene `img { max-width: 100% }` global, que es lo que evita que
cualquier foto desborde su caja en todo el sitio. En el librito el ancho del
200 % **es** el mecanismo: la imagen tiene que salirse de la cara a propósito.
Con el tope puesto, el 200 % se recortaba a 100 %, el `left: -100%` mandaba la
imagen entera fuera de la ventana, y el resultado era **una página en blanco a
la derecha y el pliego mal encuadrado a la izquierda**. Se ve como un problema
de imágenes, no de una regla de reset — que es lo que lo hace caro. La cuenta
que lo delató: el pliego 03 se veía escalado a `cover` centrado, mostrando la
franja del medio de la imagen en vez de una mitad. `max-width: none` en
`.hoja__mitad`.

**2. `JUEGO.png` TIENE ALFA Y SALIÓ EN JPEG.** La captura del juego es un
televisor retro **recortado**: todo lo que lo rodea es transparente. En JPEG
ffmpeg rellena el hueco con negro PLANO (#000), y la sección es `.zona--negro`,
que es un **degradé** (#161614 → #0B0B0B → #020202). Dos negros distintos con un
borde recto entre ellos: se leía como una imagen mal recortada. Pasó a PNG.

**3. EL RECUADRO DE LA MESA DEL LIBRO.** La mitad izquierda del escenario tenía
una línea de pelo para "leerse como el lugar del libro". Con el libro abierto no
se ve nunca (la tapan las hojas pasadas), así que solo servía para arruinar el
único momento en que se veía: **el libro cerrado mostraba la tapa al lado de un
rectángulo vacío perfectamente dibujado**, o sea un error de armado. Se sacó.

**4. EL VIDEO DEL HERO SEGUÍA CORRIENDO DE COSTADO.** El `[data-video-visible]`
de +54 usa un IntersectionObserver, y un observer mira el **viewport**, no el
`overflow: hidden` del padre. La ventana del paneo recorta, pero para el
observer el video "se ve" igual cuando ya está corrido afuera. Lo maneja
`initPaneo`, que sabe cuál es la pieza activa.

### DECISIONES DE DISEÑO QUE SE PROBARON AL REVÉS PRIMERO

**LA TELE NO VA SOBRE NEGRO, Y ES CONTRAINTUITIVO.** Una tele encendida pide
cuarto oscuro. Pero el marco de plastilina es marrón oscuro — **se midió:
#362D26 promedio** — y sobre el negro del sitio desaparece: quedaba una pantalla
flotando sola y la tele, que es la pieza, no se veía. Va sobre crema tostado. El
apagón lo hace la banda de arriba, que es texto y aguanta el negro.

**LAS MEDIDAS DEL AGUJERO DE LA PANTALLA NO SON A OJO.** Se sacó el canal alfa
del PNG original (1920x1080) y se buscó fila por fila y columna por columna
dónde termina la parte opaca: bisel izquierdo hasta x=305, derecho desde x=1612,
arriba hasta y=118, abajo desde y=879. El hueco es 68,1 % × 70,4 % del archivo.
**Las perillas están puestas un punto más grandes que eso a propósito**: el
marco está modelado a mano y el borde interno es ondulado, no recto; si el video
midiera exacto, donde el bisel se afina asomaría una fisura de fondo.

**EL PROCESO ES UNA FICHA TÉCNICA, NO UN DIAGRAMA DE CAJITAS.** Siete filas:
número, qué se hizo, con qué, y si eso fue IA o software de siempre. Esa última
columna es el contenido real. Siete cajas con flechas en cuatro columnas se
parten en 4+3 y dejan de leerse como cadena, y obligan a inventar iconos para
herramientas que no los tienen. **La flecha de vuelta atrás no es decoración**:
el copy dice que el proceso no fue lineal, y la ficha leída sola afirma lo
contrario.

**EL HERO USA UNA COLUMNA PARA EL TEXTO Y TRES PARA EL PANEO**, al revés que
+54. Ahí el material son afiches verticales; acá las tres piezas son apaisadas
(1190x842, 1713x1114, 1920x1080) y con dos columnas no se leía ninguna. La
vuelta atrás está señalada en el CSS: es cambiar dos `grid-column`.

### CÓMO SE VERIFICÓ

Chrome manejado desde afuera (puppeteer-core contra el Chrome instalado), no
capturas a ojo:

- **El camino real portada → clic en la ficha 04 → Tipines, por Swup y sin
  recargar:** body `pag-tipines`, cursor `anillo`, `initLibro` corrió (16 hojas
  armadas), familia `Archivo` aplicada, `performance.navigation` = 1 entrada
  (o sea, no hubo recarga). Cero errores de JS.
- **La cuenta del librito, leída del DOM y no de la foto:** en el pliego 3, la
  mitad izquierda es `03.jpg [izq]` y la derecha `03.jpg [der]`. Contador
  "Pliego 03 / 15", lupa apuntando a `03.jpg`. Al final: "Contratapa" y el botón
  siguiente deshabilitado.
- **Desborde horizontal a 390 y a 820 px:** `scrollWidth === clientWidth` en las
  dos. Los elementos que se pasan del viewport están todos adentro de un
  `overflow: hidden` (el riel del paneo y las mitades de pliego), que es el
  mecanismo, no un bug.
- Las 18 rutas de assets de la página: **200 en todas.**

### QUEDA PENDIENTE

1. **LA BAJADA DEL HERO ESTÁ SIN CONFIRMAR.** Es el único texto de la página que
   no venía cerrado del brief. Está escrita y marcada con un comentario en el
   HTML.
2. **FALTAN LAS FOTOS DE LOS JUGUETES.** `assets/amigos tipines/3D/` existe y
   está vacía. La sección muestra el método en tres filas mientras tanto, y el
   bloque `.juguetes__fotos` ya está escrito en el HTML, comentado, con sus
   estilos esperando en el CSS. Son tres pasos: poner los archivos, agregarlos
   al script, descomentar.
3. **LA APERTURA ESTÁ COPIADA TRES VECES.** `.proyecto__col`, `.volver--pastilla`,
   `.proyecto__titulo`, `.proyecto__meta` y `.proyecto__bajada` están iguales en
   `simbio.css`, `mas-54.css` y ahora `tipines.css`. Con dos páginas se copiaba;
   con tres se muda a `layout.css`. Es la próxima limpieza.

---

## 21. +54: las historias de a una, y el video de la casa más chico (20/08/2026)

### LAS HISTORIAS NO SONABAN, Y NO ERA EL BOTÓN

El botón de sonido estaba bien. **El problema era que los archivos no tenían
pista de audio**: `tools\optimizar-54.ps1` los convertía con `-an`, o sea que
los dejaba mudos. Los originales de `assets/+54/HISTORIAS` sí traen audio (aac,
2 canales). Se verifica en dos segundos:

```
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 <archivo>
```

Antes de tocar una línea de JS por un problema de sonido, **chequear que el
archivo tenga sonido.**

### AHORA VAN DE A UNA

Corre UNA historia y las otras dos quedan **congeladas en su primer cuadro**.
Cuando la que corre termina, arranca la siguiente; de la tercera vuelve a la
primera. Tocar cualquiera la hace la activa.

- **"Congelada en el primer cuadro" es literal:** `pause()` + `currentTime = 0`.
  No hace falta ningún poster ni imagen aparte — el propio video pintado en su
  segundo cero ES el primer cuadro.
- **Se avanza con el evento `ended`, no con un temporizador.** Las tres duran
  distinto (7,4 · 11,2 · 11,1 s) y un `setInterval` las cortaría al medio o
  dejaría huecos. **Por eso los `<video>` NO llevan `loop`:** con loop no
  terminan nunca y el evento no llega. Si alguien se lo vuelve a poner, la
  rueda deja de girar.
- **Las que esperan se apagan un poco** (menos opacidad y menos saturación) para
  que se lea cuál es la que está corriendo. No se ocultan: siguen a la vista e
  invitan a tocarlas.
- **Las congeladas van siempre mudas.** Si quedaran desmuteadas, cualquier
  reproducción accidental metería una segunda voz encima de la que corre.

**POR QUÉ ARRANCA MUDA AUNQUE TENGA SONIDO.** Ningún navegador deja que un video
con audio empiece solo: si no está `muted`, `play()` se rechaza y **no arranca
nada**. Así que la rotación empieza muda y el botón la desmutea — ese click es
el permiso que el navegador estaba esperando, y de ahí en adelante suenan
también las que siguen. No es una limitación de este código: es política del
navegador y no se puede saltear.

Medido: al entrar, la 1 corre y la 2 y la 3 están en `t=0` y pausadas. Al tocar
el botón, la 1 se desmutea sin frenarse. A los 7,4 s la 1 termina, la 2 arranca
sola **ya con sonido**, y la 1 vuelve a quedar congelada en cero.

### EL VIDEO DE LA CASA

Estuvo un rato a pantalla completa (`100svh`, el video de borde a borde) y era
demasiado: 800 px de alto llenando la ventana entera se comían la página. Ahora
es una pieza centrada sobre la franja negra, con el mismo tratamiento que el
teaser: **900x505 dentro de una sección negra de 1425 de ancho.** La franja
alrededor es la que le da el aire de proyección; el video no tiene que ser
gigante para leerse. La perilla es `--casa-ancho`.

## 26. Los estilos fantasma, y el menú de teléfono (21/08/2026)

### EL FANTASMA: SWUP NUNCA TOCA EL `<head>`

Mati lo describió como "archivos o disposiciones fantasma que cuando refresca
se van". Esa última parte era la pista entera: **si refrescar lo arregla, el
problema no está en el contenido, está en el `<head>`** — es lo único que un
refresh rehace y una navegación de Swup no.

Swup reemplaza `#swup` y (desde el punto 24) la nav. El `<head>` queda **para
siempre el de la página por la que entraste al sitio**. Y las páginas de
proyecto cargaban solo su propio CSS. Entonces:

1. Entrás directo a `/proyectos/simbio.html` → su head trae variables, base,
   layout y simbio. **No trae `archivo.css`.**
2. Clic en Home → Swup mete el contenido de la portada en un documento cuyo
   head nunca tuvo `archivo.css`.
3. La portada se dibuja **sin su hoja de estilos entera**.

**Medido:** el título de la portada salía a **114.8px negro** en vez de
**35.2px verde**. Pasaba desde las tres páginas de proyecto, no desde una.

Lo raro es que el comentario de `index.html` ya explicaba este bug y lo
resolvía… **en un solo sentido**: index cargaba el CSS de todos los proyectos
"para cuando la tarjeta linkee". Nadie hizo el camino de vuelta.

**El arreglo: las cuatro páginas cargan la misma lista de CSS, en el mismo
orden y con los mismos `?v=`.** El orden importa tanto como la lista: si cambia,
cambia la cascada según por dónde entraste, que es el mismo bug con otra cara.

Antes de hacerlo se verificó que no se pisaran: se inyectó `archivo.css` en las
otras tres páginas y se comparó el estilo calculado de **cada** elemento.
**604 elementos, 0 cambios.** Los nombres están apellidados por página
(`.portada-hero__*`, `.simbio-*`, `.s54*`, `.stip*`), así que conviven.

**SI AGREGÁS UNA PÁGINA NUEVA, SU CSS VA EN LAS CUATRO.** Es la regla que deja
este bug cerrado. La alternativa "de manual" sería el head-plugin de Swup, que
intercambia el `<head>` de verdad; se descartó por no sumar otra dependencia de
CDN a un sitio sin build step, y porque cargar todo es gratis (son cuatro
archivos chicos, cacheados, y ya se probó que no colisionan).

**DE PASO, DOS FUGAS DE LA MISMA FAMILIA** — nodos que el JS cuelga del `<body>`
y que, por estar fuera de `#swup`, Swup no limpia nunca:

- `initReglaGrilla` no tenía guarda: con `?grid` cada navegación dejaba **otra**
  regla encima de la anterior.
- `initLupa` arma un cierre nuevo por página, así que la capa `.lupa` de la
  página anterior quedaba colgada del documento para siempre — invisible, pero
  ahí, comiéndose clics.

Las dos ahora barren lo viejo antes de crear lo nuevo. **La regla general: si un
init cuelga algo del `<body>`, tiene que poder correr dos veces.**

### CÓMO SE ENCONTRÓ (importa, porque el primer intento falló)

El primer censo del DOM salió **limpio**: 1 `#swup`, 1 nav, 13 hijos del body,
cero ids duplicados, en siete navegaciones con ida, vuelta y botón de atrás. Eso
descartó la hipótesis obvia (nodos duplicados) y fue lo que obligó a mirar el
`<head>`. **Un censo que da limpio no es una pérdida de tiempo: es lo que te
saca de la hipótesis equivocada.**

Y el bug **no se reproducía** navegando desde `index.html`, que es por donde uno
prueba siempre. Solo aparece **entrando directo a un proyecto**. Al reproducirlo
hay que desactivar la caché del navegador (`Network.setCacheDisabled`): el `?v=`
versiona el CSS, **no el HTML**, y Chrome servía los `.html` viejos.

### EL MENÚ HAMBURGUESA

Debajo de 620px los cuatro botones se apilaban y la barra fija se comía **91px
medidos** todo el tiempo. Ahora: barra baja con un botón redondo de 44px (el
mínimo para tocar cómodo) a la derecha. **Cerrada mide 68px.**

**NO ES UN CAJÓN QUE ENTRA DESDE UN COSTADO: es la misma barra que crece.** Se
anima `max-height` y nada más. Por eso no hace falta ni un panel aparte en el
HTML, ni una capa oscura, ni bloquear el scroll. Los `<span>` de las rayas se
vuelven una X con dos rotaciones.

Tres cosas que no son obvias y hay que respetar si se toca:

1. **El botón va PRIMERO en el HTML** (para caer arriba a la derecha en el
   teléfono) y lleva `display: none` en desktop. Eso es lo que hace que **no le
   ocupe una columna** a la grilla de la nav: un elemento con `display: none` no
   es un ítem de grilla. Verificado: en desktop el primer botón sigue cayendo en
   308, el mismo borde de columna que el contenido de la página.
2. **Los enlaces escondidos llevan `visibility: hidden`, no solo `opacity: 0`.**
   Con opacity sola se pueden tabular botones que no se ven.
3. **La guarda de `initHamburguesa` va en el NODO (`dataset.listo`), no en una
   variable de módulo.** Swup reemplaza la nav, así que el `<button>` es otro
   nodo en cada navegación y hay que volver a engancharlo — al revés que
   `initNavEsquiva`, cuyos listeners viven en `window` y se ponen una sola vez.
   Las dos guardas parecen lo mismo y resuelven problemas opuestos.

Detalles: con el menú abierto la barra **no se esconde** al scrollear (se iría
con el menú puesto y volvería abierta). Elegir una opción cierra —hace falta
para los anclas de la misma página, donde no hay navegación que traiga una nav
nueva—. Escape cierra y devuelve el foco al botón. Y **abierta el fondo pasa a
98% opaco con una línea abajo**: con el 88% de la barra los botones quedaban
flotando sobre el dibujo de la caja, sin un borde que dijera dónde termina el
menú. Cerrada es una barra y deja ver la página; abierta es un panel.

Probado a 390px: abre a 216px con los 6 botones visibles, cierra por botón, por
Escape y al elegir una opción; el ancla de la misma página cierra el menú y
además cae a 48px del tope; y después de navegar a +54 el botón de la nav nueva
funciona igual.


---

## 27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)

Repaso sección por sección sobre la primera versión. Casi todo eran textos y
tamaños; lo que llevó trabajo de verdad fueron tres cosas: el visor del libro,
la banda de la miniserie y el orden de la página.

### EL ORDEN CAMBIÓ: EL PROCESO SE FUE AL ANTEÚLTIMO LUGAR

Estaba en el medio, entre la tele y los juguetes. Ahora va después del juego y
antes del cierre. El motivo es de lectura y vale para cualquier página de
proyecto: **primero se ven las piezas terminadas, después se explica cómo se
hicieron.** En el medio, el proceso cortaba el recorrido para explicar algo de
lo que todavía faltaba la mitad.

Orden nuevo: hero · intro al libro · el libro · la miniserie · la tele ·
los juguetes · el mini-juego · **el proceso** · el cierre.

### EL VISOR: POR QUÉ NO SIRVIÓ LA LUPA QUE YA EXISTÍA

"Ver en grande" usaba `initLupa` de `main.js`, que es la de los líquenes de
Simbio y las láminas de +54. **Abre la imagen adentro de un marco de polaroid**
—borde blanco y más aire abajo— y eso para una lámina impresa está perfecto,
porque el marco dice "esto es una foto". Para un pliego apaisado de un
busca-personajes, el marco se come el ancho y la imagen termina **más chica que
el propio librito de la página**. Mati lo describió exacto: "se visualiza como
post-it".

El visor nuevo (`armarVisor`, en `js/tipines.js`) no tiene marco: el pliego
ocupa lo que puede de la ventana sobre negro liso, y se puede acercar hasta
2,6x haciendo click, con arrastre para moverse. **Medido: el pliego abre a
1187x840 en una ventana de 1600x1000**, o sea prácticamente el tamaño original
del archivo.

Tres decisiones del visor que no son obvias:

- **Comparte el estado con el libro.** Es el mismo `actual`: lo que se ve en
  grande es siempre el pliego abierto, y si pasás de página adentro del visor,
  al cerrar el libro quedó ahí. Por eso `armarVisor` se llama DESDE
  `initLibro` y no es un módulo aparte.
- **Vive fuera de `#swup`** y sus listeners se enganchan UNA sola vez, con la
  marca `data-visor-armado`. El libro que está en pantalla se le pasa en
  `visor.__libro` y los handlers lo leen recién al dispararse. Sin eso, cada
  navegación de Swup sumaba una copia de cada listener.
- **Con el visor abierto, el teclado del libro se calla.** Los dos escuchan las
  flechas; sin el `if (visor.estaAbierto()) return`, cada flecha avanzaba DOS
  pliegos.

### LA LÍNEA CLARA EN EL LOMO DEL LIBRO

Con las sombras arregladas apareció, por debajo, un bug que estaba tapado: **una
línea clara por el medio del pliego**, que era el fondo de la sección asomando.

Las dos mitades quedan borde contra borde exactamente en el 50%, y ninguna cae
sobre un pixel entero: el ancho del libro sale de un `svh`, así que casi siempre
es fraccionario. El navegador redondea cada hoja para su lado y entre las dos
falta medio pixel.

El arreglo es un pixel de solape, y **el orden en la lista de transforms es todo
el truco**:

```css
.hoja.is-pasada {
  transform: translateX(var(--libro-solape, 1px)) rotateY(-180deg) translateZ(...);
}
```

El `translateX` va PRIMERO en la lista, o sea que se aplica AL FINAL, ya en el
espacio del padre: corre la hoja aterrizada un pixel hacia el lomo. Escrito
DESPUÉS del `rotateY` se aplicaría antes de girar, o sea hacia el lado
contrario, y el hueco se haría más grande.

### LAS SOMBRAS DEL LIBRO: LAS TENÍAN LAS 16 HOJAS

`box-shadow` estaba en `.hoja`, o sea en las dieciséis. Como están apiladas una
sobre otra, **las 16 sombras se sumaban en un halo oscuro y sucio alrededor del
libro**. En un libro de verdad la única superficie que proyecta sombra es la de
afuera de cada pila: la hoja abierta a la derecha y la última pasada a la
izquierda. Ahora la sombra cuelga de `.hoja.is-arriba`, que `initLibro` le pone
solo a esas dos. **Medido: 2 hojas con sombra de 16.**

El pliegue del lomo iba a `.22` de negro disolviéndose recién al 45% del ancho
de la página: eso no era un pliegue, era una franja oscura por el medio del
dibujo, justo donde el libro tiene más cosas escondidas. Ahora arranca en `.10`
y termina al 18%.

### EL VIDEO DEL HERO SE TRABABA — ERAN TRES COSAS SUMADAS

1. `preload="none"`: empezaba a reproducirse mientras todavía se estaba bajando.
   Pasó a `auto`; pesa 763 KB, se puede pedir de entrada.
2. Estaba a 1280 y 25 fps (casi 900 kbps) para verse a menos de media pantalla.
   Bajó a 960 y 24 fps.
3. **Un keyframe por segundo** (`-g`, en `ConvertirVideoLoop`). Un loop de
   `<video>` vuelve al cuadro 0 de golpe; si el keyframe más cercano quedó
   lejos, el decodificador tiene que reconstruir desde ahí y se ve un enganche
   en CADA vuelta.

### LA MINISERIE: DE UN RECTÁNGULO DE TEXTO A UNA PANTALLA

Eran dos bloques de texto grandes, uno al lado del otro y del mismo largo.
"Rarísimo", y con razón: dos columnas de palabras del mismo peso no se leen como
una sección, se leen como un rectángulo de texto.

Ahora la sección mide **100svh completos** —el apagón se siente como un cambio
de sala— con la carta de ajuste de plastilina (`senal.mp4`) en la mitad
izquierda y un solo texto en la derecha.

**LA SEÑAL SALE EN MP4 Y NO EN GIF**, aunque el pedido fue "a forma de GIF". El
comportamiento de gif lo dan los atributos del `<video>`: `autoplay + loop +
muted + playsinline` (y `muted` no es opcional — sin eso ningún navegador deja
que un video arranque solo). Los mismos 4 segundos en un `.gif` de verdad pesan
varios MB, porque el formato tiene paleta de 256 colores y no comprime entre
cuadros; en MP4 son **810 KB** y sin bandas. El recorte a 4 segundos y la
saturación (+30%) los hace el script de assets, no el CSS.

### LA TELE EN PANTALLA COMPLETA

El `<video>` está en `position: absolute` y medido en PORCENTAJES del marco de
la tele. Al pedir pantalla completa, el navegador lo saca de la página pero **no
le borra esos estilos**: seguía dibujándose del tamaño del hueco de la tele,
arrinconado sobre un fondo negro gigante, con la barra de controles fuera de
donde uno la va a buscar. De ahí que "no se pudiera navegar".

Se arregla con tres reglas `:fullscreen`, y **van repetidas con los prefijos, no
en una lista separada por comas**: si el navegador no entiende UNO de los
selectores de la lista, descarta la regla entera.

### LOS TAMAÑOS: DOS CASOS DEL MISMO ERROR

**Los juguetes** se repartían por ANCHO en columnas. Los dos archivos tienen
proporciones muy distintas (el STL es 673x348, casi el doble de ancho que alto;
las figuras son 1599x899), así que a igual ancho el STL terminaba con **un
tercio del alto** de las figuras: una miniatura perdida abajo a la izquierda con
un agujero enorme encima. Lo que el ojo compara entre dos fotos apoyadas en el
mismo piso es el ALTO, así que ahora se manda por ahí (`--stl-alto` y
`--figuras-alto`), con `align-items: end` para que compartan la línea de piso.

**Los sprites** eran lo mismo al revés: tres hojas de formas distintas
(874x582, 467x423, 339x272) a ancho de columna, cada una con un alto distinto,
ninguna alineada con las otras y todas enormes. Ahora la fila tiene un alto
fijo (`--sprite-alto`) con `object-fit: contain`, así que las tres comparten
borde de arriba y de abajo y los tres pies de foto caen en el mismo renglón.

### LA FICHA DEL PROCESO, MÁS APRETADA

Iba de punta a punta: siete renglones de 11 px estirados sobre 1300 px, con la
herramienta tan lejos de la acción que había que barrer la fila con el ojo para
juntarlas. Se leía como una planilla. Ahora va adentro del bloque de texto
(columnas 2-3) y cada fila apila la acción y la herramienta en la misma
columna, con el número a la izquierda y la marca de IA / a mano a la derecha.
Es, literalmente, el layout que ya tenía en el teléfono — que se leía mejor que
el de escritorio.

### LO DEMÁS

- Hero: los textos arrancan ARRIBA, alineados con el borde de arriba del paneo.
  Con la bajada de dos párrafos, centrado dejaba el título flotando a media
  altura sin nada con qué alinearse.
- Textos nuevos de Mati en el hero, la intro al libro y TippinesTV.
- Se sacó el rótulo "HOJEALO" del libro: un libro dibujado con su tapa y dos
  flechas debajo no necesita que le avisen qué hacer.
- Se le sacó la flechita de link externo al botón JUGAR. Decía JUGAR y al lado
  tenía un ícono, o sea dos mensajes para una sola cosa.

### CÓMO SE VERIFICÓ

- **El visor**: abre a 1187x840 con el pliego correcto; el zoom aplica
  `scale(2.6)` con el desplazamiento acotado; pasar de página adentro sincroniza
  el contador del libro ("Pliego 05 / 15" en los dos); cierra con la X y con
  Escape.
- **Las sombras**: 2 hojas de 16.
- **La miniserie**: la sección mide 1000 px con una ventana de 1000, o sea
  100svh exactos, y la señal está reproduciéndose.
- **El orden de las secciones**, leído del DOM: hero, El libro, libro,
  La miniserie, tele, Los juguetes, El mini-juego, El proceso, cierre.
- **Sin desborde horizontal** a 390 px, y cero errores de JS. El único 404 de
  toda la página es `favicon.ico`, que falta en todo el sitio.

### QUEDA PENDIENTE

1. **La bajada del hero** tiene una repetición del propio texto: "Un universo de
   plastilina… Habitan un mundo hecho de plastilina". Está puesta tal cual la
   pasó Mati; si la quiere limpia, es sacar la segunda.
2. **La ficha del proceso** se apretó, pero el pedido fue "no me convence tanto
   como está" y eso puede querer decir otra cosa. Si el problema es el formato y
   no el tamaño, la alternativa es una tira horizontal de siete pasos con la
   flecha de vuelta dibujada por debajo.
3. **La apertura está copiada tres veces** (simbio.css, mas-54.css, tipines.css).
   Con tres páginas ya se ganó la mudanza a layout.css.

---

## 22. El control de sonido del sitio, y las historias sin tocar la paleta (22/08/2026)

### EL CONTROL DE VOLUMEN — ESTÁNDAR PARA TODO EL PORTFOLIO

**Donde haya que prender o apagar sonido va este control y no otro.** Sin texto:

| Señal | Sonido activado | Sonido desactivado |
|---|---|---|
| Parlante | con ONDAS | con la CRUZ de mute |
| Barritas de ecualizador | se MUEVEN | quietas y bajas |

**Por qué sin texto.** Un botón que dice "SILENCIAR" obliga a preguntarse si eso
es el estado actual o lo que va a pasar si lo tocás — la ambigüedad clásica del
toggle escrito con un verbo. Unas barras que se mueven no tienen esa duda: se
entienden de reojo, sin leer, y no dependen del idioma. El texto queda como
**nombre accesible** en un `.visually-hidden` adentro del botón.

Está en `css/mas-54.css`, sección **"EL CONTROL DE SONIDO — EL ESTÁNDAR DEL
SITIO"**, escrito genérico (`.control-sonido`, sin apellido de sección) para
poder copiarlo tal cual. **Cuando una segunda página necesite volumen, ese
bloque se muda a `layout.css` sin cambiarle nada.**

**Todo el estado cuelga de `aria-pressed`** — el mismo atributo que lee el lector
de pantalla es el que usa el CSS para dibujar las dos señales. Un solo dato,
imposible de desincronizar. Nunca una variable de JS en paralelo.

Los retrasos de las cinco barras son valores **fijos y elegidos uno por uno**, no
al azar: al azar dos barras caen en fase y el conjunto se lee como un error en
vez de como un ecualizador. Con `prefers-reduced-motion` no saltan, pero el
estado se sigue leyendo — prendido son barras ALTAS y quietas, apagado BAJAS y
quietas, más el parlante, que no depende de ninguna animación.

### LAS HISTORIAS NO CAMBIAN DE COLOR

Estuvieron un rato con las que esperan bajadas de **opacidad y saturación** para
marcar cuál corría. Estaba mal, y no solo porque se veía raro: **les reescribía
el color a unas piezas que son diseño gráfico terminado.** La regla de esta
página es que la página no toca el material — vale para el recorte, para la
inclinación y también para el color.

Ahora las tres se ven siempre a full. La que corre se distingue por:

1. **el movimiento** — que es la señal más fuerte que hay, y es gratis;
2. **una barrita verde abajo** que avanza con el video (`timeupdate` → una
   variable CSS). El verde es el acento del sistema, no un color nuevo.

Medido: las tres quedan en `opacity: 1` y `filter: none`.

### EL TAMAÑO SALE DEL ALTO DE LA VENTANA, NO DEL ANCHO DE LA GRILLA

Son 9:16. Dándoles un tercio de la grilla (unos 412 px) el alto se iba a **733 px**
y se cortaban abajo de la pantalla. Ahora la fila se limita a lo que entra a lo
alto y queda centrada:

```
max-width: calc(var(--historia-alto) * 9 / 16 * 3 + var(--grid-gap) * 2)
```

Con `--historia-alto: 58svh` las tres entran enteras de una sola vez. Es la
perilla para verlas más chicas o con más aire.

### EN EL TELÉFONO ES UN CARRUSEL, PERO LAS OTRAS DOS SIGUEN A LA VISTA

`overflow-x: auto` + `scroll-snap`, con cada historia al **58%** del ancho: quedan
21% de cada lado, que alcanza para reconocer qué hay al costado sin que la del
medio deje de mandar. El aire de los costados sale de la misma cuenta
(`padding-inline: calc((100% - var(--historia-movil)) / 2)`), así que se toca un
solo número. Sin ese padding la primera y la última no pueden llegar a centrarse.

El JS arrastra el carrusel a la que se activa sola. Para saber si hay que
arrastrar pregunta `scrollWidth > clientWidth` y **no** el ancho de la ventana:
así no duplica el breakpoint del CSS y lo sigue solo si cambia.

### LOS NEGROS, A LA PALETA

El teaser tenía `#000` crudo y la sección de la casa un `background: var(--negro)`
plano escrito a mano, que **pisaba el `--grad-negro` de `.zona--negro`** y quedaba
chato al lado de las otras secciones oscuras. Ahora el teaser usa `var(--negro)`
y la casa no declara fondo: lo saca de su zona, como corresponde. Ninguna
superficie del sistema es 100% plana.

## 28. El par ES/EN: traducción automática de Google (22/08/2026)

Los botones ES/EN estaban puestos "como forma, todavía sin función" desde el
principio. Ahora funcionan, con el widget de Google Translate.

**LO PRIMERO, PORQUE CONDICIONA TODO:** Google **discontinuó** el Website
Translator en 2019. El script sigue vivo y traduciendo, pero es un servicio sin
soporte que puede cortarse sin aviso. Si un día los botones dejan de hacer nada,
empezá por ahí y no por `js/traduccion.js`. Todo el módulo está escrito para
fallar en silencio: si el script no carga, la página se queda en español.

### LAS TRES COSAS QUE COSTARON, TODAS MEDIDAS

**1. EL WIDGET NO TIENE API. Y EL PRIMER PEDIDO SE PIERDE.**
No existe un "traducí a inglés". Lo único que se puede hacer es que Google
inyecta un `<select>` escondido (`.goog-te-combo`) y uno le pone un valor y le
dispara un `change` a mano.

Lo que no dice ningún tutorial: **el primer disparo no hace nada**. El select
aparece en menos de un segundo, pero su manejador todavía no está enganchado.
Y no se recupera solo — se muestreó cada segundo durante **9 segundos** y seguía
en español. El mismo disparo repetido después traduce en menos de un segundo.

Por eso `cambiarA()` **insiste**: reintenta hasta ver el resultado, no hasta que
el select exista. La señal de que funcionó es la clase `translated-ltr` que
Google le pone al `<html>`; es lo único observable desde afuera.

**2. VOLVER AL ESPAÑOL NECESITA RECARGAR.** Se probaron las tres formas:

| | |
|---|---|
| `value="" ` + change | sigue en inglés |
| borrar la cookie + `value=""` + change | sigue en inglés |
| **borrar la cookie + recargar** | **vuelve al español ✓** |

Google guarda el idioma en una cookie `googtrans` y la lee al arrancar; mientras
esa cookie exista, cualquier carga sale traducida. Así que ES borra la cookie y
recarga. **Es la única vez que el sitio recarga de verdad en vez de navegar con
Swup.** Ir a inglés no recarga: eso sí se hace en caliente.
La cookie se borra en varias rutas a propósito — Google la escribe a veces en
`/` y a veces en la carpeta de la página, y si queda una viva la traducción
vuelve sola.

**3. GOOGLE INYECTA INTERFAZ PROPIA Y HAY QUE TAPARLA.** Una barra arriba de
todo, y de yapa le pone `top: 40px` al `<body>` **con estilo en línea**. Eso
empuja la página entera y deja la nav fija flotando 40px más abajo del borde. El
`body { top: 0 !important }` de layout.css es lo único que gana contra un estilo
en línea. Buscá **"GOOGLE TRANSLATE"** ahí.

### LO QUE NO SE TRADUCE, Y POR QUÉ

**Los nombres propios llevan `translate="no"`**: Archivo, Simbio, +54, Amigos
Tipines, Matías Cornara, Universidad Torcuato Di Tella. Sin eso "Archivo" se
convierte en "File" y "Mi Cajón" en "My Drawer" — peor que no traducir.

**Y LA NAV LLEVA SU INGLÉS ESCRITO A MANO** (`data-es` / `data-en` +
`translate="no"`). Es la única excepción al "todo lo traduce Google", y tiene un
motivo concreto: la traducción automática es mala justo donde son palabras
sueltas sin contexto, y la nav es exactamente eso — y es lo primero que se ve.
**Medido: Google convertía "Trabajos" en "JOBS"**, o sea puestos de trabajo,
cuando acá quiere decir obra. En un portfolio eso no es un matiz, está mal.
Quedó: Home / About / Work / Contact.

Si mañana Google traduce mal otra cosa corta, el arreglo es el mismo:
`translate="no"` + `data-es` + `data-en`, y `palabrasDeLaNav()` lo levanta solo.

### DETALLES QUE IMPORTAN

- **El script de Google se carga recién al tocar el botón**, no de entrada: es un
  pedido a un tercero y la mayoría de las visitas nunca lo va a usar.
- **La elección se recuerda** en localStorage, envuelto en try/catch (en incógnito
  tira excepción).
- **Después de navegar con Swup hay que retraducir**: la página nueva entra en
  español, que es el HTML tal cual. `initTraduccion` está enchufado en el
  `page:view` de transiciones.js.
- **La guarda va en el nodo** (`dataset.listo`), no en una variable de módulo:
  Swup reemplaza la nav y esos botones son otros nodos. Misma razón que
  `initHamburguesa`.

Probado de punta a punta: arranque limpio en español → EN traduce → navegar a
otra página con Swup mantiene el inglés → ES vuelve al español → refrescar
respeta lo elegido, en los dos idiomas. Y el menú hamburguesa en 390px muestra
Home / About / Work / Contact con EN marcado.

**De paso:** se sacaron los últimos "Mi Cajón" visibles (el `<title>` y el pie de
simbio.html). El nombre público es **Archivo**.

---

## 23. El bug del sonido que seguía sonando: `isIntersecting` no es el threshold (22/08/2026)

Las historias seguían reproduciéndose —con sonido— mientras se miraba otra
parte de la página. **La causa es una trampa clásica de IntersectionObserver y
vale la pena tenerla anotada, porque el código parecía correcto:**

> `entry.isIntersecting` **NO** significa "se cumplió el threshold".
> Significa "el elemento toca el viewport aunque sea por un pixel".

El `threshold` decide **cuándo se dispara el callback**, no qué valor tiene
`isIntersecting` cuando se dispara. Con `threshold: 0.25` el callback salta al
cruzar el 25%, pero en ese instante `isIntersecting` sigue siendo `true`. O sea
que un `visible = e.isIntersecting` se queda en `true` **hasta que el elemento
se va entero de la pantalla**.

Se sumaban dos cosas:

1. **Se observaba la SECCIÓN y no los videos.** La sección tiene 112 px de aire
   arriba y abajo, más el rótulo y el control de sonido: seguía tocando la
   pantalla con los tres videos ya bien afuera.
2. **Se miraba `isIntersecting`** en vez del ratio.

### LA FORMA CORRECTA

```js
const ESCALONES = [0, 0.15, 0.35, 0.6, 0.85, 1];
const UMBRAL_VISIBLE = 0.6;

function seVeDeVerdad(e) {
  return e.intersectionRatio >= UMBRAL_VISIBLE ||
         e.intersectionRect.height >= window.innerHeight * UMBRAL_VISIBLE;
}
```

- **Hay que pedir VARIOS thresholds.** Con uno solo el callback no se dispara en
  los valores intermedios y el ratio queda desactualizado.
- **El segundo término del OR es para elementos MÁS ALTOS que la ventana**: ahí
  el ratio nunca puede llegar a 0,6, así que se pregunta al revés — cuánto de la
  PANTALLA está ocupando el elemento.

Se aplicó a los cuatro observadores de reproducción de `mas-54.js` (historias,
videos sueltos, piezas que se turnan y carrusel). **El de `initFotosCasa` sigue
usando `isIntersecting` a propósito**: dispara una sola vez y no vuelve atrás,
así que ahí lo que se quiere es que arranque apenas asoma.

### LOS OTROS DOS CASOS DE "SUENA ALGO QUE NO ESTOY MIRANDO"

El observador no los cubre, porque para él el elemento sigue en pantalla:

- **Pestaña en segundo plano.** El navegador deja seguir sonando el audio.
  Se agrega un `visibilitychange` que pausa con `document.hidden`.
- **Irse de la página.** Con Swup el `<main>` se reemplaza y los videos quedan
  sueltos fuera del documento — y **un elemento desprendido puede seguir
  reproduciendo audio**. Se pausa en `pagehide` (que cubre también la navegación
  normal y el botón de atrás) y en el hook `visit:start` de Swup si existe.

### MEDIDO, EN TRES VENTANAS

| Fila visible | 1440x900 | 1440x620 | 390x844 |
|---|---|---|---|
| 100% | suena | suena | suena |
| 70-80% | suena | suena | — |
| 49-51% | **frenado** | **frenado** | **frenado** |
| 0% | frenado | frenado | frenado |
| volver a subir | retoma | retoma | retoma |
| pestaña oculta | **frenado** | **frenado** | **frenado** |


---

## 29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026)

Ronda de correcciones. Lo que llevó trabajo esta vez fueron los diagnósticos:
cuatro de los seis problemas resultaron ser otra cosa de lo que parecían.

### EL VIDEO DEL HERO: NO ERA EL PESO, ERA EL MATERIAL

Se había achicado dos veces y seguía a los tirones. Antes de tocarlo una tercera,
se midió con `getVideoPlaybackQuality()`, que es el contador del propio
navegador. **Cero cuadros perdidos**, en cuatro configuraciones distintas (con y
sin `will-change` en el riel, con y sin Lenis, con el video adentro y afuera del
riel transformado). O sea: el navegador dibujaba todos los cuadros que le daban.

El problema estaba en el archivo, y se ve contando cuántos cuadros son distintos
del anterior (`mpdecimate`):

```
HERO3.mov   212 cuadros   ->   solo 147 distintos
```

**65 cuadros, el 31%, son copias del de al lado.** El clip es material de ~17 fps
reales metido en un contenedor de 25: es lo que sale de generar video con IA y
después subirle el frame rate duplicando cuadros. Ninguna opción de compresión lo
arregla, porque los cuadros que faltan no existen.

**Qué se hizo**: `mpdecimate` para tirar los repetidos y `minterpolate` para
INVENTAR los del medio, calculando hacia dónde se movió cada parte de la imagen.
Sale a 30 fps parejos. Medido igual que la entrada: **243 cuadros, 202 distintos
— del 31% de repetidos al 17%, y sobre todo repartidos parejo**, que es lo que el
ojo lee como movimiento continuo. Está en `ConvertirVideoInterpolado`, en
`tools/optimizar-tipines.ps1`, con la advertencia de cuándo NO usarla
(minterpolate deforma si hay movimiento muy rápido o cosas que aparecen y
desaparecen; en este clip se revisaron tres cuadros inventados y están limpios).

**La otra mitad del "se traba" era de código**: `initPaneo` pausaba el video al
salir de turno y lo retomaba al volver. El clip dura 8 s y el turno 4,6, así que
cada vuelta retomaba desde otro punto, y encima el primer cuadro después de un
`play()` tarda en salir. Ahora corre mientras el hero esté en pantalla, sea o no
la pieza visible: un video mudo de 960x540 no cuesta nada tenerlo corriendo.

### EL VISOR DEL LIBRO DEJÓ DE FUNCIONAR — Y NO DIO NINGÚN ERROR

"Ver en grande" no hacía nada. El botón existía, el JS corría, no había ni una
línea roja en consola.

**Lo que pasó**: el `<div class="visor">` estaba escrito en
`proyectos/amigos-tipines.html`. Cuando esa página se regeneró desde la plantilla
que comparten las cuatro páginas modernas, el bloque se perdió. El
`querySelector("[data-visor]")` devolvió `null`, la función salió con un `return`
y listo — el silencio perfecto.

**El arreglo no es volver a pegar el HTML**: el visor ahora lo ARMA el JS
(`crearVisor()`) y lo cuelga del `<body>`. Así no puede desincronizarse de la
plantilla. Es la regla que ya estaba escrita para el JS —"si un init cuelga algo
del `<body>` tiene que poder correr dos veces"— con una segunda mitad:
**si algo vive fuera de `#swup`, que lo cree el JS, no el HTML.**

### LAS SOMBRAS DEL LIBRO, TERCERA VERSIÓN Y ÚLTIMA

Iban en las 16 hojas (halo sucio, porque se suman), después solo en las dos de
afuera de cada pila. Seguía mal: eran DOS sombras, una por mitad, y donde se
tocaban en el lomo se juntaban y oscurecían. Se leía como dos manchas, no como un
objeto apoyado.

Ahora es **UNA sola sombra que cuelga del escenario** (`.libro__escena::before`),
no de las hojas. Su forma es la del libro tal como está: el pliego entero abierto,
media A3 cerrado, y anima entre las dos al abrir. Con `spread` negativo (-14px)
para que la sombra se meta DEBAJO del papel en vez de asomar por los costados,
que es la diferencia entre "objeto apoyado en una mesa" y "halo alrededor".
Medido: 0 hojas con `box-shadow` de 16.

### "UNA SECCIÓN, UNA PANTALLA" — Y EL AIRE MEDIDO EN svh

Todas las secciones pasaron a `min-height: 100svh` con el contenido centrado.
`min-height` y no `height`: la sección que tiene más contenido que la pantalla
crece, la que tiene menos se estira. Por eso tampoco hace falta apagarlo en el
teléfono.

Pero con eso solo, **cuatro de nueve secciones se pasaban de largo en una
notebook de 1440x780**, que es de las pantallas más comunes que hay. El culpable
era el aire: `--s-9` son 112 px por lado, o sea 224 px fijos — el 22% de un
monitor de 1000 px, pero el 29% de una notebook de 780.

Se pasó a `padding-block: clamp(var(--s-7), 9svh, var(--s-9))`, y lo mismo para
la tele y la captura del juego, que estaban frenadas solo por ANCHO en px.
Medido a 1440x780, antes → después:

| | antes | después |
|---|---|---|
| el libro | 811 px | 780 |
| la miniserie | 901 px | 797 |
| los juguetes | 838 px | 780 |
| el mini-juego | 891 px | 780 |

Queda pasándose **el proceso** (1100 px), y está bien que se pase: son dos
párrafos más siete filas, y meterlo a la fuerza en 780 px significaría achicar la
tipografía. Para eso es `min-height`.

### EL BUG DEL `1fr` QUE NO ES `1fr`

Los juguetes se salían de la sección por abajo y el pie de foto terminaba 100 px
afuera. La caja medía 420 px y la imagen adentro, 674.

**`grid-template-rows: 1fr auto` en realidad significa `minmax(auto, 1fr)`**, y
ese `auto` es un mínimo que no deja que la fila sea más chica que el contenido.
La imagen mide 673x348 y entraba a 1300 px de ancho, así que su alto natural son
674 px: la fila se estiraba a 674 dentro de una caja de 420. Con
`minmax(0, 1fr)` la fila puede achicarse y el `object-fit: contain` hace lo suyo.
Medido: imagen de 674 → 387 px, pie de foto de +1100 → +813 en una sección de
1000.

Es de los errores más caros de CSS Grid porque no se ve como un error de grilla:
se ve como una imagen que "no respeta el tamaño".

### LOS DOS BLOQUES QUE NUNCA SE ALINEABAN

Los sprites y los juguetes tenían el mismo problema con dos caras.

**Los sprites**: tres columnas de `1fr`, o sea tres cajas de la misma forma, pero
las tres hojas tienen proporciones distintas (874x582, 467x423, 339x272). Con
`object-fit: contain`, cada una se acomodaba con distinto sobrante arriba y abajo
y nunca coincidían. Con `grid-template-columns: auto auto auto` y el ALTO fijo en
la imagen, la caja de cada una la decide la imagen: las tres miden exactamente lo
mismo de alto, así que arrancan y terminan en la misma línea sin excepción.

**Los juguetes** pasaron a turnarse en el MISMO lugar en vez de ir una al lado de
la otra. Son las mismas tres figuras en la misma pose: puestas una al lado de la
otra el ojo tiene que ir y venir, puestas en el mismo lugar el cambio de gris a
pintado pasa solo. Es `initAlterna`, copiado de mas-54.js.

Y para que el cambio no se lea como un salto hubo que **recortarles el margen
transparente**. Medido sobre el canal alfa: en `JUGUETES.png` las figuras ocupan
961x706 de un archivo de 1599x899 — el 40% del ancho es nada. Con distinta
cantidad de aire, las figuras cambiaban de tamaño y de posición al alternar.
Recortadas al contenido (`ConvertirImagenAlfaRecortada`, con los números medidos
y anotados), las seis quedan a la misma escala.

### UN BUG DE POWERSHELL QUE VALE ANOTAR

El script de assets dejó de parsear con `MissingEndCurlyBrace`, apuntando a una
llave que estaba puesta. La causa real: **una raya larga (—) adentro de un string
de PowerShell**.

Los `.ps1` de este repo son UTF-8 SIN BOM, y PowerShell 5.1 los lee como cp1252.
Los tres bytes de la raya larga (`E2 80 94`) se decodifican como `â`, `€` y una
COMILLA TIPOGRÁFICA de cierre — y PowerShell acepta esa comilla como delimitador
de string. El string quedaba abierto, se comía la llave de cierre de la función,
y el error aparecía 40 líneas más abajo.

**En los comentarios (`#`) no pasa nada. Adentro de comillas, sí.** Queda anotado
en el propio archivo, arriba de la línea que lo causó.

### LO DEMÁS

- La miniserie: la señal arriba y el texto abajo en dos columnas, los dos en las
  columnas 3-4 y a ras. Con `column-count: 2` y no con una grilla de dos celdas,
  porque los dos párrafos son de largos muy distintos y así el navegador los
  reparte parejo.
- Bajada del hero a la mitad de largo.
- El botón JUGAR, sin la flechita de link externo.

### CÓMO SE VERIFICÓ

- **Cuadros del video**: `getVideoPlaybackQuality()` en cuatro configuraciones,
  y `mpdecimate` sobre la entrada y la salida.
- **Alturas**: las nueve secciones medidas en tres pantallas (1600x1000,
  1440x780, 390x844). Todas en una pantalla salvo el proceso, y el mini-juego en
  teléfono.
- **El visor**: abre, hace zoom, sincroniza el contador del libro, cierra con la
  X y con Escape.
- **Las sombras**: 0 hojas de 16.
- **La alternancia**: leída del DOM, `stl.png` → `juguetes.png`.
- Sin desborde horizontal a 390 px, cero errores de JS, y la navegación por Swup
  desde la portada sigue armando el libro sin recargar.

### QUEDA PENDIENTE

1. **La tele en pantalla completa**: el arreglo (`:fullscreen` con los tres
   prefijos) está puesto, pero NO se pudo probar. Ningún navegador deja entrar a
   pantalla completa sin un click humano, así que no entra en las pruebas
   automáticas. Hay que probarlo a mano.
2. **La ficha del proceso**: se apretó, pero el pedido fue "no me convence" y eso
   puede querer decir otra cosa. Si el problema es el formato y no el tamaño, la
   alternativa es una tira horizontal de siete pasos con la flecha de vuelta
   dibujada por debajo.
3. **La apertura sigue copiada tres veces** (simbio.css, mas-54.css,
   tipines.css). Ya se ganó la mudanza a layout.css.

---

## 30. El ruido fantasma: eran DOS bugs, y el segundo era el bueno (22/08/2026)

Mati reportó que a veces seguía sonando algo mientras miraba otra parte de la
página. La sospecha caía sobre las historias, porque son lo último que se tocó y
lo que tiene el botón de sonido. **No era ahí.**

### CÓMO SE ENCONTRÓ

Midiendo, no leyendo. Un probe que scrollea a distintos lugares y pregunta, para
CADA `<video>` del documento, si está sonando y cuántos píxeles suyos se ven:

```
sonando: [ "teaser.mp4  visible=0px" ]
```

Las historias pausaban bien en las cuatro pruebas (abajo, arriba, al tope, y
navegando con Swup). El teaser seguía reproduciendo a 1800, 4000 y 3000 px de
distancia, siempre con `visible=0px`.

**Era el único video con audio que no tenía control de visibilidad.** Las
historias sí lo tenían desde el arreglo anterior, y eso hizo que la sospecha
apuntara al lugar equivocado. Dura 1:45 y tiene voz: lo arrancabas, seguías
scrolleando, y te acompañaba el resto de la página sin que se viera de dónde
salía.

### LA REGLA DEL TEASER NO ES LA DE LAS HISTORIAS

Las historias son un loop de ambiente: se prenden y se apagan según lo que estés
mirando, sin memoria. **El teaser lo arrancó el visitante**, así que:

- se pausa cuando se va de pantalla, pero queda anotado que lo pausamos nosotros;
- al volver a verse, sigue **solo si fuimos nosotros** los que lo frenamos;
- si lo pausó el visitante con los controles, al volver sigue pausado. Que la
  página te reanude un video que frenaste a mano es de las cosas más molestas
  que puede hacer.

**Dos umbrales distintos (histéresis):** frena al 5% visible, reanuda al 60%.
Con un solo valor, dejar el video justo en el límite lo prende y lo apaga en
cada píxel de scroll.

### EL BUG ADENTRO DEL ARREGLO: `pause` ES ASÍNCRONO

El primer intento no reanudaba nada. El motivo es una trampa que conviene tener
anotada porque vale para cualquier evento de `<video>`:

**El evento `pause` NO se dispara adentro de la llamada a `video.pause()`.** Se
dispara después, en otra vuelta del bucle de eventos. El código era:

```js
estaSaliendo = true;
video.pause();
estaSaliendo = false;   // ← acá todavía no llegó el evento
```

Cuando el evento por fin llegaba, la bandera ya estaba en `false`, así que el
listener creía que había pausado el visitante y borraba la marca. Medido: al
volver a la sección, el teaser se quedaba pausado en vez de seguir.

**La bandera la tiene que bajar el propio listener**, que es el único que sabe
cuándo llegó el evento.

### LA REGLA GENERAL PARA TODO EL SITIO

**Todo `<video>` con audio necesita control de visibilidad.** No alcanza con que
lo tenga el que estás mirando: alcanza con que UNO no lo tenga para que aparezca
el ruido fantasma. Hoy en +54 son dos —las historias y el teaser— y los dos lo
tienen, cada uno con su regla.

Y los tres cierres que hay que cubrir siempre, no solo el scroll:
`visibilitychange` (cambiar de pestaña), el hook `visit:start` de Swup (irse de
la página sin recargar, que deja el elemento suelto pero sonando) y `pagehide`.


---

## 31. Tipines: tres cosas rotas y por qué (22/08/2026)

Ronda de correcciones sobre la página de Amigos Tipines. Las tres tenían la
misma pinta desde afuera —"se rompió"— y ninguna era el mismo tipo de error.

### 1. EL PASE DE PÁGINA "MAL ARTICULADO Y CON DESTIEMPO"

**Las dos listas de `transform` de una transición tienen que tener las MISMAS
funciones, en el mismo orden.** No es prolijidad: es la diferencia entre que la
hoja gire o que se deforme.

```css
.hoja            { transform: rotateY(0deg) translateZ(…); }             /* 2 */
.hoja.is-pasada  { transform: translateX(…) rotateY(-180deg) translateZ(…); } /* 3 */
```

Cuando los dos extremos comparten la lista, el navegador interpola **función
por función**: el `rotateY` va de 0 a -180 y listo. Cuando NO la comparten, no
puede, así que aplasta cada extremo a una **matriz de 4x4** e interpola eso. La
interpolación de matrices no sabe que adentro hay media vuelta: le sale un
camino que pasa por el medio achatando la hoja, con las dos mitades del pliego
desfasadas. Eso es exactamente lo que se veía.

El arreglo es un `translateX(0)` en el estado quieto. No mueve nada — está para
que las dos listas coincidan.

**Cómo se verifica sin mirar:** contar las funciones de transform de las dos
reglas, leídas del CSSOM. Tienen que dar igual. Antes 2 y 3; ahora 3 y 3.

### 2. EL "VER EN GRANDE" NO TENÍA LA ANIMACIÓN DEL LIBRO

Y no podía tenerla: el visor mostraba un `<img>` con el pliego abierto, y pasar
de página ahí adentro era cambiarle el `src`. En grande dejabas de tener un
libro y pasabas a tener un carrusel de fotos, justo en el momento en que más se
lo mira.

**EL VISOR YA NO DIBUJA NADA PROPIO: SE MUDA EL LIBRO ADENTRO.** Al abrir, el
`.libro__caja` entero —sus 16 hojas, su giro 3D y sus controles— se mueve del
`<main>` a la ventana del visor; al cerrar, vuelve a su lugar. Es el MISMO nodo:
mismo JS, mismo estado, mismo giro. Lo único que cambia es `--libro-alto` /
`--libro-tope` y el fondo negro detrás.

Efecto secundario y gratis: **el estado se conserva solo en los dos sentidos**.
Abrís en grande en el pliego 7 y arranca en el 7; hojeás hasta el 11, cerrás, y
la página queda en el 11. No hay nada que sincronizar porque no hay dos libros.

Para volver se deja un **comentario vacío** en el DOM haciendo de mojón. Un
comentario y no un `<div>`: no ocupa lugar, no hereda estilos y no puede
aparecer por error. Si el mojón ya no está en el documento (Swup reemplazó
`#swup` con el visor abierto), el libro se descarta y lo rearma el `initLibro`
de la página nueva.

**Se cayeron dos cosas al mudarlo, las dos por el mismo motivo:**

- `visor.pintar()` ya no existe. Redibujar el libro ES redibujar el visor.
- El listener de teclado del visor ya no toca las flechas, solo Escape. Las
  flechas las maneja el libro, que estando en el visor está en pantalla. Si las
  manejaran los dos, cada flecha pasaría DOS pliegos.

**Y una trampa de layout que costó una medición.** Adentro del visor el libro
abría a **114 px de alto** en una pantalla de 1000. El motivo: en la página
`.libro__caja` va con `grid-column: 1/-1`, o sea estirada; en el hueco del visor
la centra `place-items: center`, y **centrar significa no estirar** — la caja
pasa a medir `fit-content`. Como el ancho de `.libro__escena` es `min(100%, …)`,
ese `100%` se mide contra la caja, que se mide contra su contenido: la cuenta se
muerde la cola y colapsa. Con `width: 100%` en la caja, 780 px.

### 3. EL TEXTO DE LA MINISERIE DESBORDABA LA SECCIÓN

`break-inside: avoid` sobre los párrafos, y era justo lo contrario de lo que
hacía falta. Le prohíbe a un párrafo partirse entre las dos columnas, así que el
primero (largo) se metía ENTERO en la columna 1 y el segundo (corto) en la 2: la
izquierda desbordaba la sección hacia abajo y la derecha quedaba medio vacía.
El reparto parejo que se buscaba con `column-count` no llegaba a ocurrir nunca.

Sin la regla, los dos párrafos fluyen como un solo bloque. **Medido después:
204 y 102 px de alto, sin desborde, sección de 1000 en viewport de 1000.**

### 4. EL MINI-JUEGO: LAS CUATRO PIEZAS AHORA SE TURNAN

Estaban todas a la vez —la captura arriba y las tres hojas de sprites en fila
abajo— y la fila se leía desacomodada por más que el CSS estuviera bien. **No
era un problema de CSS.** Las cuatro imágenes tienen formas que no se parecen
(951x478 la captura, y 874x582, 467x423 y 339x272 las hojas) y además distinta
cantidad de aire transparente adentro. Puestas juntas no hay alto ni ancho que
las haga leerse como una serie; se probó alinearlas por alto con columnas
`auto` y no alcanzó.

Turnándose en un marco de proporción fija (`initAlterna`, cada 4 s), cada una
entra entera, al tamaño que le da la suya y siempre en el mismo lugar. Es el
mismo mecanismo que los juguetes.

### QUEDA PENDIENTE

1. **El zoom del visor se perdió** al mudar el libro adentro. La versión vieja
   dejaba acercar hasta 2,6x y arrastrar; ahora el libro es más grande (78svh
   contra 66svh en la página) pero no se acerca más. Para un busca-personajes
   el zoom vale, y no está resuelto: el click ya lo usa la hoja para pasar de
   página, así que habría que meterlo por rueda del mouse o por un botón.
2. La bajada del hero sigue sin confirmar, y las fotos de los juguetes siguen
   siendo las dos que hay (ver la entrada 25).

## 23. Simbio en mobile (20/08/2026)

Todo el bloque nuevo está **al final de `css/simbio.css`**, buscá **"MOBILE"**.
Dos cortes, los mismos que usa `base.css`: **960px** (la grilla del sitio baja a
2 columnas) y **620px** (baja a 1). No inventar otros anchos: si cada archivo
corta en un número distinto aparecen estados intermedios que nadie probó.

**LA IDEA**: la página de escritorio está armada con piezas que se cruzan a
propósito —la portada sube media pantalla para meterse al lado del título, el
objeto de cada pieza se pasa de su columna, el video se mide por su alto—. Todo
eso funciona porque sobra ancho. En un teléfono no sobra nada, así que el bloque
mobile desarma esos cruces uno por uno.

**LOS TRES CHOQUES QUE APARECIERON AL MEDIRLO** (no a ojo: con la página
corriendo y midiendo cada rectángulo):

1. **El liquen: texto y polaroids caían en la MISMA celda.** Los dos llevan
   `grid-row: 1`, que es lo que en escritorio los pone lado a lado. Al apilar a
   una columna esa fila 1 sigue siendo la misma para los dos y uno queda
   dibujado encima del otro. Se arregla con `grid-row: auto`.
   **Regla general: si dos cosas comparten `grid-row` explícito, al apilarlas
   hay que soltarlo.**

2. **El ensamble se salía 15px por la derecha.** Estaba con `width: 100vw`, y
   100vw NO es el ancho visible: incluye la barra de scroll. Con `width: auto` y
   los márgenes negativos, la caja llega justo a los bordes.

3. **Las gráficas seguían corridas.** Les puse `--dx: 0px` y no pasó nada: cada
   una trae su `--dx` en el atributo `style` del HTML, y lo inline le gana a
   cualquier archivo CSS. La solución no es pelear con la variable sino anular
   lo que la usa (`transform: none`), porque el transform sí está declarado en
   el CSS. Misma trampa que las tapas de carpeta, que ahí se resolvió con
   `!important` porque lo inline era la propiedad y no la variable.

**LA PIEZA SE VEÍA DE 80px.** El render trae mucho aire alrededor y, contenido
en un cuadro 16:9 de 342px de ancho, la pieza del árbol quedaba ilegible.
Agrandar el cuadro no servía: el dibujo entra "contenido", así que lo que manda
es el ancho. Se resolvió con **dos cambios acoplados**:
  - el cuadro pasa a ser **vertical (4/5)** en el teléfono, que es lo que le da
    alto a la pieza para crecer;
  - `zoomMobile` en `js/muestras.js` agranda el dibujo hasta llenar ese alto.
Los valores del zoom **salen de una cuenta, no del ojo** (está escrita en el
archivo): con la pieza centrada en cx/cy, su mitad más larga decide el tope.
Quedó en ~83% del tope, por margen. Lo que se sale del cuadro es siempre aire
del render, nunca pieza. **Si cambiás la proporción del cuadro, hay que
recalcular esos números.**

**EL PESO: 23 MB → 7,7 MB.** Los 375 frames del ensamble en datos móviles eran
una barbaridad. `SALTO` en `js/simbio-scroll.js` pasa a **3 en el teléfono**:
125 cuadros. Medido con la página corriendo a 375px: 125 pedidos, 7,7 MB, y el
recorrido sigue andando (progreso 0.60, fase 03/04, escenario pegado en top=0).
Con 400vh de recorrido son ~42 cuadros por pantalla scrolleada: se lee continuo.

**CÓMO SE VERIFICÓ — Y UNA TRAMPA DE LA HERRAMIENTA.**
**Chrome headless no baja de 489px de ancho** por más que se le pida 390: las
capturas a 390 son un RECORTE de un render de 489, así que muestran cosas
cortadas que en el teléfono real entran bien. Perdí una vuelta con eso.
La forma correcta de medir un teléfono es **meter la página en un iframe de
390px** dentro de una ventana grande: ahí el viewport interno es real (375px con
la barra). Medido así: **0 elementos fuera de pantalla y 0 superposiciones**, con
las carpetas abiertas y cerradas.

En escritorio quedan dos superposiciones que son **a propósito** y no hay que
"arreglar": la foto de portada cruza por detrás del bloque de apertura (por eso
lleva `pointer-events: none`) y dos polaroids del liquen se pisan apenas, que es
el collage.

---

### 30-bis. El que de verdad molestaba: ATRAVESAR la sección

Arreglado el teaser, Mati siguió escuchando el fantasma, y dio el dato que lo
resolvió: *"si las historias se disparan cuando el scroll está al 40%, cuando
estoy en otra sección a la misma altura se disparan"*. O sea: **dependía de la
altura del scroll, no de estar mirando.**

Se descartaron primero, midiendo, tres sospechas razonables y equivocadas:

| Sospecha | Resultado |
|---|---|
| Elementos huérfanos sonando después de navegar con Swup | 0 reproduciendo. Limpio |
| El listener de `visibilitychange` viejo reviviéndolos al volver a la pestaña | silencio en las cuatro pruebas |
| Otra página con audio propio | ningún otro asset del sitio tiene pista de audio |

**El bug era la regla misma: "se ve → suena".** Pasar de largo scrolleando
alcanza para cumplirla. Medido cruzando la sección en 1,5 s:

```
PLAY  h1 @y=9248 mudo=false
pause h1 @y=8423
```

825 px de scroll con audio saliendo de una sección que ya te pasaste. Y como
sólo depende de la altura, se dispara **cada vez que la barra pasa por ahí**,
aunque vayas de camino a otra parte — que es exactamente lo que él describía.

**LA REGLA CORRECTA NO ES "SE VE", ES "TE QUEDASTE MIRÁNDOLO".** Entrar en
pantalla arranca un reloj de 450 ms (`ESPERA_SONIDO`); si te fuiste antes, no
suena nunca. Es el mismo criterio del `dwell` de las fichas del índice:
sostener un gesto es una intención, cruzarlo no.

**Frenar, en cambio, es inmediato.** Nadie quiere esperar medio segundo a que se
calle algo que ya no está mirando. La espera es asimétrica a propósito.

Va también en el teaser al reanudarse, con un detalle: el reloj se cancela
SIEMPRE al salir, aunque el video ya esté pausado. Si no, un scroll que entra y
sale rápido deja el timer corriendo y el video arranca solo medio segundo
después, ya fuera de pantalla.

Medido después del arreglo: cruzar la sección → **cero eventos**. Quedarse →
arranca normal, rota, y el botón de sonido sigue andando.

### LA REGLA GENERAL, CORREGIDA

Para cualquier `<video>` con audio del sitio, no alcanza con pausarlo al salir.
Son cuatro cosas:

1. **Arrancar sólo si el visitante se queda** (reloj de permanencia), no apenas
   entra en pantalla.
2. **Pausar al salir**, inmediato y mirando `intersectionRatio`, no
   `isIntersecting`.
3. **Pausar al cambiar de pestaña** (`visibilitychange`).
4. **Pausar al irse de la página** (`visit:start` de Swup y `pagehide`), porque
   un elemento fuera del DOM puede seguir sonando.


---

## 32. Tipines: la composición de la miniserie y el botón que no se veía (22/08/2026)

### LA SEÑAL ARRANCA EN LA COLUMNA 2

Antes la señal y el texto empezaban las dos en la columna 3 y quedaban
perfectamente apiladas, con la mitad izquierda de la pantalla vacía de arriba
abajo. Dos bloques del mismo ancho, uno encima del otro y contra un borde, no
son una composición: son **una columna sola corrida a la derecha**, y el vacío
no se leía como aire sino como que faltaba algo.

Ahora la señal va de la **columna 2 a la 4** y el texto sigue en la **3 y 4**,
con la imagen alineada **por la derecha**: comparte borde con el texto y
desborda una columna hacia la izquierda. Los dos bloques se leen como una pieza
sin ser el mismo rectángulo.

**Medido** (ventana de 1600, columnas que empiezan en 148 · 482 · 816 · 1150):
la señal va de 599 a 1452 —o sea que su borde izquierdo cae adentro de la
columna 2— y el texto de 816 a 1452.

**Y LA SECCIÓN AHORA MIDE MÁS QUE UNA PANTALLA: 118svh.** Con 100svh justos la
banda negra medía exactamente lo que la ventana, así que entraba y salía del
cuadro al mismo tiempo que el contenido: se sentía como una diapositiva, no
como un cambio de sala. Con el negro empezando antes de que llegue el material
y siguiendo después de que se fue, el apagón se siente. Es la única sección de
la página que se pasa de una pantalla, y la perilla está comentada.

**EL NEGRO ES EL DEL SISTEMA, no uno nuevo.** `.zona--negro` pinta
`--grad-negro`, que va de `#161614` a `#0B0B0B` a `#020202` — el mismo que usan
Simbio y +54. No es `#1C1C1A`.

### EL BOTÓN DE JUGAR ERA UN PROBLEMA DE CONTRASTE

Se veía tímido, y no era cuestión de tamaño solamente. Estaba en `--verde`
(#5A6E32) con la etiqueta en blanco, sobre el negro de la sección:

| | antes | ahora |
|---|---|---|
| el botón contra el fondo negro | **3,5 : 1** | **5,8 : 1** |
| la etiqueta contra el botón | 4,4 : 1 | **5,8 : 1** |

El verde oscuro del sistema está pensado para destacar **sobre crema**; sobre
negro tiene casi el mismo valor que el fondo y el botón se hunde. Ahora usa
`--verde-claro` (#7C9448) con la etiqueta en el negro del sitio. **No es un
color nuevo:** `--verde-claro` ya es lo que `base.css` le asigna a
`--zona-acento` dentro de `.zona--negro`. O sea que el botón por fin usa el
verde que le corresponde a la zona en la que está.

Y texto oscuro sobre claro, no al revés: en una sección negra, un rectángulo
lleno y claro es lo único que se lee como "esto se toca".

**LA TRAMPA QUE COSTÓ UNA MEDICIÓN.** Poner `color: var(--negro)` en el `<a>`
no alcanzaba: la `.etiqueta` de adentro trae su propio color del sistema (el
gris claro de los rótulos en zona oscura) y ese selector le gana al color
heredado. El botón quedaba verde claro con la palabra en gris claro encima —
**medido, 1,93 : 1**, ilegible, y justo en el único botón de la página. El
color tiene que ir en `.juego__link .etiqueta`.

Lo demás es peso: 52 px de alto, la etiqueta a 14 px en vez de los 11 px del
sistema (es un botón, no un rótulo) y menos tracking. El halo del hover es del
mismo verde y no una sombra negra: sobre fondo negro una sombra no se ve, y lo
que tiene que crecer es la luz.

## 24. La caja más grande en el teléfono, y "Cargando" (20/08/2026)

**LA CAJA DEL HERO.** Medido a 375x844 antes de tocar nada: el cubo se veía de
**118px, el 31% del ancho**, y entre la nav y el nombre sobraban 600px de alto
sin usar. Ahora mide **197px, el 52%**, sin acercarse ni a la nav (98px de aire)
ni al nombre (42px).

**DÓNDE SE TOCA ESO — Y DÓNDE NO.** Perdí un intento escribiendo
`--caja-ancho` en el CSS: no hace absolutamente nada, porque **js/archivo.js lo
escribe como valor inline** y lo inline le gana a cualquier archivo CSS. Es la
tercera vez en el proyecto que aparece esta trampa (las tapas de carpeta, los
`--dx` de las gráficas, y ahora esto).
La perilla que el JS **sí** lee del CSS es **`--caja-proporcion`**: cuánto mide
el cubo comparado con el ancho del nombre. En el teléfono pasa de 0.75 a **1.25**.
Regla para la próxima: **si un valor lo calcula el JS, buscá qué variable lee el
JS del CSS y tocá esa; no intentes pisar el resultado.**

No hizo falta ponerle un freno por altura: el JS ya elige el más chico entre lo
que pide la proporción y lo que entra entre la nav y el nombre, así que en un
teléfono bajo el cubo se achica solo en vez de montarse sobre el texto.

**EL CARTEL "FRAMES PENDIENTES" AHORA DICE "CARGANDO".** Es el cartel que se ve
mientras baja cada secuencia de pieza, o sea el caso normal: decir "pendientes"
hacía parecer que faltaba material y que la página estaba rota.
Y para que "Cargando" no mienta nunca: si la carga **termina** y no entró ni una
imagen, `muestras.js` le cambia el texto a "No se pudieron cargar los frames".
Ahí sí es un problema de material y hay que decirlo — un "Cargando" eterno es
exactamente lo que parece roto.


---

## 33. Mobiliario de Museo: de cero a página entera (22/08/2026)

Séptima página del sitio y quinta "moderna". Era uno de los 6 esqueletos
vacíos (84 líneas con `<!-- TODO -->` en los 5 bloques). Ahora tiene las tres
animaciones de scroll, carrusel, pantalla de investigación y cierre en paneo.

### LOS FRAMES PESABAN 654 MB

Los renders de Blender llegaron en tres carpetas llamadas `..._WEB`, pero de
web no tenían nada: 1007 PNG a 1920, 654 MB en disco y unos 8,9 GB de RAM al
descomprimir. El mismo muro que Simbio, tres veces más grande.

`tools/optimizar-frames-museo.ps1` los deja en 92 MB (JPG calidad 93, ancho
1600). Va aparte de `optimizar-frames.ps1` porque el de Simbio filtra por
nombre numérico puro (`0000.png`) y estos vienen con prefijo
(`ASIENTO_00042.png`), en dos proporciones distintas.

| | crudo | web |
|---|---|---|
| descanso | 297 frames | 18,8 MB |
| exposicion | 336 frames | 21,9 MB |
| comunicacion | 374 frames | 51,7 MB |

Comunicación pesa el doble por cuadro (138 KB contra 63) porque es una escena
a sangre y no un objeto sobre fondo plano. Por eso es la única con `salto: 2`
en `museo-scroll.js`: usa 187 cuadros en vez de 374 y baja a la mitad la
memoria, que con tres animaciones en una página es lo que más aprieta.

### VAN SOBRE NEGRO, NO SOBRE CREMA

**Al revés que Simbio.** Los renders de Simbio venían con alfa y se aplastaron
contra el crema. Los de Museo no: Descanso y Comunicación traen `#000000`
horneado y solo Exposición tiene alfa. Aplastarlos contra crema dejaba tres
rectángulos negros flotando sobre la página.

Las tres secciones de animación son negras. Y el negro es `#000000` puro, NO
el `--negro` del sitio (`#0B0B0B`): tiene que coincidir con el que ya viene
adentro del render, si no se ve el borde del rectángulo. Está como perilla
`--museo-negro-render` y también en el script de conversión. **Si algún día se
re-exportan los frames sobre otro color, hay que cambiarlo en los dos lados.**

### EL MAPEO POR TRAMOS: LO ÚNICO QUE NO EXISTÍA

Simbio avanza los frames parejo de punta a punta:
`indice = round(progreso * (TOTAL-1))`. Museo necesitaba que la rotación de
Descanso (cuadros 46 a 112) se viera más rápido que el resto.

`frameSegunAvance()` reparte el scroll por fase según un peso, y el peso es
`cuadros / veloc`. Con `veloc: 2`, la fase se lleva la mitad del scroll para
los mismos cuadros, o sea que pasa al doble de velocidad. Medido: la rotación
son 67 cuadros (22,6% de la secuencia) que ocupan 12,7% del scroll, contra
0,89x de las otras tres. Sale 1,99x exacto.

### LA FASE SIN TÍTULO

La rotación de Descanso no lleva texto. Contarla como fase dejaba las
tituladas en `01/04`, `03/04`, `04/04`, salteando la 02, que se lee como
error. Se trata como **interludio**: `nombre: null` esconde el rótulo entero y
la numeración cuenta solo las fases con título. Descanso va `01/03` a `03/03`
con el mismo formato visual de Simbio.

### DOS COSAS QUE EL SPEC DECÍA MAL Y SE VERIFICARON CONTRA EL MATERIAL

1. **"Formato de frames: PNG, mismo criterio que Simbio"** se contradice: el
   criterio de Simbio es JPG. Los PNG son los originales de Blender.
2. **Los tres detalles de Comunicación** (`detalle_panel`, `detalle_tomate`,
   `explotada_modulos`) no son renders sino **dibujos de línea sobre blanco**.
   Los renders de detalle son otros dos que no figuraban. Con renders el
   reparto es 2/2/2 y los tres bloques se ven iguales; los planos se fueron a
   la pantalla de investigación.

Descanso no tenía ningún detalle transparente (el único es opaco gris), así
que sus dos círculos salen de su propia secuencia de frames, que ya está
sobre negro.

### EL JS TAMBIÉN TIENE LA REGLA DE "TODAS LAS PÁGINAS, LA MISMA LISTA"

Estaba escrita solo para los CSS, pero aplica igual a los scripts, y no se
cumplía. `index.html` carga los scripts de TODOS los proyectos; cada página de
proyecto, solo el suyo. Por eso Home a cualquier proyecto anda, pero
**entrar por Simbio y navegar a Tipines deja `tipines.js` sin cargar y el
librito muerto, sin error en consola.** Museo carga la lista completa, y los
scripts de Museo se sumaron a `index.html`.

**Queda pendiente:** las otras tres páginas modernas siguen cargando solo su
propio JS. El bug existe hoy entre Simbio, +54 y Tipines.

### PENDIENTES DE ESTA PÁGINA

- Los PNG crudos (`assets/mobiliario museo/`, 654 MB) están versionados y ya
  commiteados en `8f41416`. Mati pidió NO sacarlos por ahora. Cuando se saquen,
  es un `.gitignore` como el de los videos de Tipines; el historial ya los
  tiene, así que achicar el repo de verdad sería reescribirlo.
- Ajustar a ojo la posición de la llamada del "sistema de riel"
  (`--museo-anotacion__llamada`, hoy en left 58% / top 12%).
- Las tres animaciones ocupan ~92 MB. Cargan por separado con
  IntersectionObserver, pero nunca se liberan: si la memoria molesta, la
  perilla es `salto` en `museo-scroll.js`.
- Falta mirar la página en teléfono. El corte de 960px ya apila todo y baja
  los recorridos de scroll, pero está preparado, no diseñado.

### 33-bis. La segunda vuelta: blanco, y por qué se cortaba en el teléfono (23/08/2026)

**EL FONDO PASÓ A BLANCO.** Sobre negro, lo oscuro del propio mueble (el
respaldo marrón, la silueta gris de la persona) se perdía contra el fondo y
parecía un agujero. Pero Descanso y Comunicación **no tienen canal alfa**: se
midieron los tres y dan `Format24bppRgb` con cero píxeles transparentes, o sea
que el negro está horneado. Poner el lienzo en blanco no alcanzaba.

Hubo que **recortarlo**: donde el píxel es casi negro se pinta de blanco, y en
la franja del medio se mezcla para que el borde no quede dentado. Los umbrales
(8 y 42 sobre 255) son bajos a propósito, para no comerse lo oscuro del objeto:
el respaldo marrón ronda 58 de luminancia y la silueta gris 68. Exposición sí
tiene alfa, así que a esa **no** se le recorta nada.

El bucle de píxeles va compilado en C# dentro del `.ps1`. En PowerShell puro
son casi mil millones de operaciones: horas contra minutos.

**LA ANIMACIÓN INCOMPLETA EN MOBILE ERAN TRES COSAS, NO UNA:**

1. **Memoria.** Las tres secuencias juntas son ~5 GB de bitmaps en desktop y
   2,5 GB en teléfono. El navegador descarta imágenes por su cuenta y la
   animación se corta **sin dar ningún error**. Ahora cada secuencia suelta la
   memoria cuando su sección queda a más de una pantalla, y la vuelve a bajar
   al regresar (no cuesta red: los JPG quedan en el caché). El pico pasó a ser
   el de UNA secuencia.
2. **En el teléfono se usa la mitad de los cuadros** (`esChico` en
   museo-scroll.js). El movimiento no sufre porque el scroll ya interpola.
3. **`dibujar()` se iba sin hacer nada** si el cuadro exacto no había bajado, y
   quedaba clavado el anterior. Ahora dibuja el vecino cargado más cercano y
   vuelve a dibujar cuando llega el bueno (`dibujadoExacto`).

Verificado con números: las tres llegan al último cuadro en los dos cortes.

**LO DEMÁS DE ESTA VUELTA:** el hero pasó a dos mitades reusando `.proyecto__col`
de simbio.css (con la pastilla de volver y las tres pastillas de meta, que era
lo que faltaba) y el carrusel se mudó al lado del título. Los círculos de
detalle ahora entran en la misma pantalla que la portada y la bajada. Las tres
portadas van con alto fijo y `object-fit: contain`, así se ven a la misma
escala aunque los archivos midan 1128x1025, 948x1031 y 3019x1413. Los mockups
quedaron los tres iguales, más chicos y clickeables con `[data-lupa]`, la misma
lupa de main.js que ya usa +54. Descanso recuperó su detalle real (la perilla),
que en la primera vuelta se había descartado por venir opaco sobre gris.

### 33-ter. El rompe-cachés que faltaba: los frames no están en el HTML (23/08/2026)

Se reconvirtieron los 1007 cuadros de negro a blanco, se verificó que los
archivos en disco tuvieran `#FFFFFF` en las esquinas... y en el navegador
seguían saliendo negros. Ni con Ctrl+F5.

**El motivo:** la regla del `?v=N` estaba aplicada a los `<link>` y los
`<script>`, que es donde vive el resto del sitio. Pero los frames **no están
en el HTML**: los pide `museo-scroll.js` con `new Image()`, y esas URL no
llevaban versión. El navegador tenía los JPG negros cacheados con la misma
URL exacta y no volvía a pedirlos nunca.

Ahora la versión la pone el JS (`VERSION_FRAMES` arriba de museo-scroll.js) y
se pega a cada ruta de cuadro. **Si se vuelven a convertir los frames, hay que
subir ese número**, igual que con los CSS.

Los dos cuadros que se usan como círculo de detalle sí están en el HTML, así
que esos llevan el `?v=` escrito a mano en el `<img>`.

**La regla general, ampliada:** el rompe-cachés no es "de los CSS y los JS",
es **de todo archivo que se reemplace y se pida por la misma URL**. Si un
asset lo pide el JS en vez del HTML, el `?v=` va en el JS.

**Y de paso:** la pantalla de investigación pasó a infografía de verdad (tres
tarjetas numeradas, con una flecha que baja del problema a la oportunidad) y
la foto de posturas se llevó una pantalla propia, centrada y a 1100px, que es
el ancho del original y por lo tanto su techo antes de pixelarse.

### 33-quater. El recorte del negro: tres intentos, y el bueno era el simple (23/08/2026)

Mati reporto que "las siluetas se ven raras, como que no existen" y que habia
"algo raro con los colores". Tenia razon, y era el recorte.

**Intento 1, rampa de luminancia (mal).** Mezclaba hacia blanco toda la franja
entre 8 y 42. Como el fondo negro y una silueta negra son el mismo color, la
silueta se blanqueaba a manchones segun que tan oscuro fuera cada pedazo, y de
paso lavaba los tonos oscuros de toda la imagen.

**Intento 2, relleno por conectividad desde el borde (peor).** La idea era
distinguir fondo de silueta por DONDE esta, no por su color. Anduvo para las
siluetas, pero los huecos de las patas de madera son fondo y estan ENCERRADOS
por el objeto: el relleno no llegaba y quedaban manchones negros grandes.

**Intento 3, umbral duro en 30 (bien).** Lo que resuelve el problema no es un
algoritmo mas complicado sino un dato medido:

| | luminancia |
|---|---|
| fondo y huecos de las piezas | **<= 30**, casi todo en 0 |
| siluetas de las personas | **~60** |

Un corte limpio en 30 se lleva el fondo y los huecos y no toca las siluetas.
Verificado en los cuadros donde hay gente: 296 de Descanso (persona sentada),
225 de Comunicacion (mano) y 60 de Exposicion.

**El riesgo que queda anotado:** si algun render trajera una silueta en negro
puro, esto se la come y no hay umbral que lo arregle; habria que re-exportar
ese render con alfa.

**Y un detalle que resulto estructural:** `$g.PixelOffsetMode = "HighQuality"`
en el DrawImage no es cosmetico. Sin esa linea el reescalado deja un reborde
claro de un pixel alrededor de toda la imagen. Con el intento 2 eso sellaba el
fondo y rompia el relleno (medido: 400.631 pixeles de fondo con la linea contra
195.251 sin ella). Quedo el comentario en el script para que nadie la saque.

**Una trampa de metodo, para no repetirla:** el intento 2 parecia fallar en el
script cuando en realidad fallaba en la PRUEBA, que se habia olvidado de esa
misma linea. Si un script y su prueba difieren en una sola linea de setup, el
diagnostico apunta al lugar equivocado. La prueba ahora extrae el C# del script
real con una regex en vez de tener una copia.

### 33-quinquies. El fondo, cuarta y ultima vuelta: crema + alfa reforzado (23/08/2026)

Mati seguia viendo mal las siluetas despues del arreglo del umbral. Comparando
el ORIGINAL crudo contra la salida, pixel a pixel y ampliado, aparecio que la
conversion no rompia nada: **el problema es que estos renders se hicieron para
verse sobre negro.** Sobre claro salen dos cosas a la luz:

1. **Los huecos entre las tablitas del respaldo** se vuelven rayas del color
   del fondo. Es correcto (son huecos de verdad), pero sobre negro eran negro
   sobre negro y no se veian. No hay nada que hacerle sin re-renderizar.
2. **Las siluetas de la gente en Exposicion son SEMITRANSPARENTES.** Medido: el
   grueso de sus pixeles esta en alfa 160-191, o sea ~70% de opacidad. Sobre
   negro se leen solidas; sobre claro se lavan a gris palido. Eso era el
   "parece que no existen".

Se le mostraron cuatro variantes renderizadas del mismo cuadro y eligio:
**fondo crema del sitio + reforzar el alfa (x1.9) al componer.** El costo
aceptado es que el vidrio de las vitrinas queda mas ahumado.

Las tres secuencias se tratan distinto y no es capricho:

| | alfa | tratamiento |
|---|---|---|
| Descanso | no tiene | recorte por umbral (<=30). Siluetas opacas, no necesitan refuerzo |
| Comunicacion | no tiene | igual que Descanso |
| Exposicion | si tiene | composicion a mano con alfa x1.9. NO se recorta: el umbral le comeria los vidrios |

**El crema del CSS y el del script tienen que ser el mismo numero.**
`--museo-fondo-render: #F3EDE1` en museo.css y `$FondoR/G/B = 243/237/225` en
el conversor. Verificado que el fondo plano de los frames sale exactamente en
243,237,225 (1033 de 1034 muestras).

**Dos trampas de PowerShell que costaron tiempo, para no repetirlas:**

- **El backtick es el caracter de escape dentro de un here-string `@"..."@`.**
  Un comentario del C# que decia una palabra entre backticks metio un retorno
  de carro en el medio del codigo. El compilador marcaba la linea SIGUIENTE,
  asi que el error se buscaba en el lugar equivocado. Quedo un aviso arriba del
  bloque.
- **Muestrear un solo pixel de la esquina miente.** La esquina de un JPEG cae
  en el primer bloque de 8x8 y sale corrida (#EDE7DB en vez de #F3EDE1). Parecia
  que el fondo no coincidia con la pagina. Con un barrido de toda la imagen dio
  exacto. Medir una region, nunca un pixel.

### 33-sexies. La respuesta a "los otros siguen en la misma" (23/08/2026)

Mati insistio en que Exposicion siempre estuvo bien y las otras dos no, y
pidio rehacerlas desde los originales. La medicion cierra el caso:

| | canal alfa |
|---|---|
| portada Descanso | **si** |
| portada Exposicion | **si** |
| portada Comunicacion | **si** |
| frames Exposicion | **si** |
| **frames Descanso** | **NO** (Format24bppRgb) |
| **frames Comunicacion** | **NO** (Format24bppRgb) |

Exposicion "siempre estuvo bien" porque es **la unica animacion exportada con
transparencia**. Las tres portadas tambien la tienen. O sea que en su momento
se exporto con Film > Transparent para las portadas y para Exposicion, y sin
eso para las otras dos secuencias.

**Rehacer desde los originales no cambia nada: el canal no esta en el
archivo.** Todo lo que se puede hacer con esos dos es recortar el negro por
umbral, que es lo que se hace, y funciona salvo donde el render tiene material
semitransparente compuesto contra negro (ahi el color quedo horneado oscuro y
no hay forma de recuperarlo).

**EL ARREGLO DE VERDAD, y esta al alcance:** re-renderizar esas dos secuencias
desde `PROYECTOS/MUSEO/*.blend` con **Render Properties > Film > Transparent**
tildado y salida PNG RGBA. Con eso, `optimizar-frames-museo.ps1` se corre con
`Recortar=$false` en las tres y quedan como Exposicion. Verificado que los
.blend existen.

### Y de paso: sacarle la caja al carrusel

El carrusel tenia fondo --crema-2 y esquinas redondeadas, o sea que se leia
como una tarjeta con las piezas adentro. Como las tres portadas son PNG con
alfa, no necesitan ningun fondo: sacado el relleno y el radio, flotan sobre la
pagina igual que en Simbio. Las flechas pasaron a ser marcas finas sin relleno,
porque un boton macizo sobre un carrusel sin caja vuelve a encapsular.

Las animaciones sumaron la perilla **`--museo-anim-zoom`** (hoy en 1.28): los
renders traen mucho aire alrededor del objeto y entrando enteros la pieza queda
chica en medio de la pantalla, que se lee como una estampa dentro de una caja.
El numero la agranda y deja que se recorte contra los bordes. Vive en el CSS y
lo lee museo-scroll.js al medir el canvas, NO en cada cuadro: getComputedStyle
fuerza recalculo de estilos y a 60 por segundo se nota.
