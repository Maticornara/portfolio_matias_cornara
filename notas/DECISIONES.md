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
