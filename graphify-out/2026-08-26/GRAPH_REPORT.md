# Graph Report - CODIGO_CLAUDE  (2026-08-26)

## Corpus Check
- 36 files · ~79,980,010 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 389 nodes · 460 edges · 62 communities (58 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f7b6868`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.js
- ARCHIVO / MI CAJÓN — bitácora del proyecto
- sandbox.js
- simbio-scroll.js
- What You Must Do When Invoked
- 19. La portada, segunda pasada: sacar y dar aire (20/08/2026)
- graphify reference: extra exports and benchmark
- Portfolio "Archivo" — mapa del proyecto
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- .claude/CLAUDE.md
- extraction-spec.md
- mas-54.js
- optimizar-54.ps1
- 3. Tipografía
- 23. La caja como caja, el aire y un solo crema (21/08/2026)
- archivo.js
- 27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)
- 20. La portada, tercera pasada: una pantalla por sección (20/08/2026)
- 21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)
- Archivo — portfolio de Matías Cornara
- 25. Amigos Tipines: la tercera página de proyecto (21/08/2026)
- optimizar-tipines.ps1
- tipines.js
- 19. +54: la primera página de proyecto después de Simbio (20/08/2026)
- 6. Las imágenes — el pipeline
- 22. El control de sonido del sitio, y las historias sin tocar la paleta (22/08/2026)
- traduccion.js
- 20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)
- 18. "ARCHIVO": remake de la portada (20/08/2026)
- 21. +54: las historias de a una, y el video de la casa más chico (20/08/2026)
- 26. Los estilos fantasma, y el menú de teléfono (21/08/2026)
- 28. El par ES/EN: traducción automática de Google (22/08/2026)
- 5. Estado actual — qué está hecho
- 22. La caja de cartón, y por qué se trababa (20/08/2026)
- 23. El bug del sonido que seguía sonando: `isIntersecting` no es el threshold (22/08/2026)
- 29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026)
- 30. El ruido fantasma: eran DOS bugs, y el segundo era el bueno (22/08/2026)
- 31. Tipines: tres cosas rotas y por qué (22/08/2026)
- 23. Simbio en mobile (20/08/2026)
- 32. Tipines: la composición de la miniserie y el botón que no se veía (22/08/2026)
- 33. Mobiliario de Museo: de cero a página entera (22/08/2026)
- 27. Repaso de teléfono: el menú y los tamaños de todo (22/08/2026)
- 34. Las pastillas, la portada de Simbio y el fin de la preportada (25/08/2026)
- 31. La tira de pictogramas: por qué ningún recorte servía (22/08/2026)
- 35. El click deja de ser un pulso y pasa a ser un encuadre (26/08/2026)

## God Nodes (most connected - your core abstractions)
1. `ARCHIVO / MI CAJÓN — bitácora del proyecto` - 46 edges
2. `33. Mobiliario de Museo: de cero a página entera (22/08/2026)` - 23 edges
3. `init()` - 14 edges
4. `27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)` - 13 edges
5. `What You Must Do When Invoked` - 12 edges
6. `/graphify` - 11 edges
7. `29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026)` - 11 edges
8. `Portfolio "Archivo" — mapa del proyecto` - 10 edges
9. `init54()` - 9 edges
10. `HayQueHacerlo()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `initTira()` --indirect_call--> `alScrollear()`  [INFERRED]
  js/mas-54.js → js/simbio-scroll.js
- `crearAnim()` --indirect_call--> `alScrollear()`  [INFERRED]
  js/museo-scroll.js → js/simbio-scroll.js
- `crearAnim()` --indirect_call--> `precargar()`  [INFERRED]
  js/museo-scroll.js → js/simbio-scroll.js

## Import Cycles
- None detected.

## Communities (62 total, 4 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.21
Nodes (15): avisarSiEsArchivo(), init(), initBlurPortada(), initCarpetas(), initColumnaSincro(), initCursor(), initHamburguesa(), initHoverReveal() (+7 more)

### Community 1 - "ARCHIVO / MI CAJÓN — bitácora del proyecto"
Cohesion: 0.11
Nodes (18): 0. Cómo levantar el sitio, 10. Herramientas de diagnóstico, 11. Mapa de archivos, 12. Pendientes, 13. Perillas para editar a mano (11/08/2026), 14. Rebranding tipográfico de Simbio + arreglos (12/08/2026), 15. La grilla manda: 4 columnas para todo (12/08/2026), 16. Ajustes de composición y las carpetas (12/08/2026) (+10 more)

### Community 2 - "sandbox.js"
Cohesion: 0.52
Nodes (6): init(), initBooklet(), initCursor(), initFolder(), initHoverReveal(), initReveal()

### Community 3 - "simbio-scroll.js"
Cohesion: 0.22
Nodes (18): crearAnim(), activarScrubbing(), actualizarFase(), actualizarProgreso(), alScrollear(), cargarUna(), dibujar(), escribirFase() (+10 more)

### Community 4 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 5 - "19. La portada, segunda pasada: sacar y dar aire (20/08/2026)"
Cohesion: 0.33
Nodes (6): 19. La portada, segunda pasada: sacar y dar aire (20/08/2026), EL AIRE ES EL ÚNICO SEPARADOR, EL GRID: ORDENADO, RECTO Y DEL MISMO TAMAÑO, LA CAJA DEL HERO, LAS TARJETAS Y SUS LINKS, LO QUE SALIÓ

### Community 11 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 12 - "Portfolio "Archivo" — mapa del proyecto"
Cohesion: 0.18
Nodes (10): Antes de tocar nada: cómo se corre, Arquitectura, Diagnóstico, Estructura, graphify, La bitácora, Perillas para editar a mano, Portfolio "Archivo" — mapa del proyecto (+2 more)

### Community 13 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 14 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 15 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 16 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 23 - "mas-54.js"
Cohesion: 0.39
Nodes (11): init54(), initAlterna(), initCarrusel(), initFotosCasa(), initHistorias(), initPostales(), initTeaser(), initTira() (+3 more)

### Community 24 - "optimizar-54.ps1"
Cohesion: 0.61
Nodes (7): ConvertirImagen(), ConvertirPNG(), ConvertirVideo(), ConvertirVideoRecortado(), HayQueHacerlo(), Peso(), PosterDeVideo()

### Community 25 - "3. Tipografía"
Cohesion: 0.40
Nodes (5): 3. Tipografía, Historial, para no volver a dar la vuelta completa, La portada: Archivo también (20/08/2026) — decisión cerrada, Las 7 páginas de proyecto viejas: siguen en Nunito + IBM Plex Mono, Simbio: Archivo, cuatro tamaños y nada más (desde 12/08/2026)

### Community 26 - "23. La caja como caja, el aire y un solo crema (21/08/2026)"
Cohesion: 0.22
Nodes (9): 20-bis. La banda de pictogramas y el video de la casa (20/08/2026), 23. La caja como caja, el aire y un solo crema (21/08/2026), APTITUDES, EL NOMBRE Y LA FRASE, DEL MISMO LARGO, FUERA LAS RAYAS, LA ANIMACIÓN: DE ARRIBA A ABAJO, Y LA PERSPECTIVA ACOMPAÑA, LA DIAGONAL QUE NO IBA: LA TAPA TIENE DOS SOLAPAS, NO CUATRO, LOS AGARRES: EL AGUJERO VA OSCURO (+1 more)

### Community 27 - "archivo.js"
Cohesion: 0.52
Nodes (6): acomodarDibujo(), init(), initDesenfoque(), initEntrada(), initEsquina(), initMedida()

### Community 28 - "27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)"
Cohesion: 0.15
Nodes (13): 27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026), CÓMO SE VERIFICÓ, EL ORDEN CAMBIÓ: EL PROCESO SE FUE AL ANTEÚLTIMO LUGAR, EL VIDEO DEL HERO SE TRABABA — ERAN TRES COSAS SUMADAS, EL VISOR: POR QUÉ NO SIRVIÓ LA LUPA QUE YA EXISTÍA, LA FICHA DEL PROCESO, MÁS APRETADA, LA LÍNEA CLARA EN EL LOMO DEL LIBRO, LA MINISERIE: DE UN RECTÁNGULO DE TEXTO A UNA PANTALLA (+5 more)

### Community 29 - "20. La portada, tercera pasada: una pantalla por sección (20/08/2026)"
Cohesion: 0.33
Nodes (6): 20. La portada, tercera pasada: una pantalla por sección (20/08/2026), CADA SECCIÓN OCUPA UNA PANTALLA, EL HERO SE DIO VUELTA, LA CAJA, CON DEGRADÉ, LA INVITACIÓN DEL CV, LAS PASTILLAS EN LAS TARJETAS

### Community 30 - "21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)"
Cohesion: 0.33
Nodes (6): 21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026), EL BUG QUE ESCONDIÓ EL ARREGLO: `max-width: 100%` SOBRE UN PADRE DE ANCHO 0, ERROR 1 — LAS DIAGONALES CAMBIABAN DE ÁNGULO CON LA VENTANA, ERROR 2 — LA CAJA ESTABA ANCLADA EN EL VÉRTICE EQUIVOCADO, LA ESTRUCTURA QUE LO HACE IMPOSIBLE DE ROMPER, SOBRE HACERLO EN 3D

### Community 31 - "Archivo — portfolio de Matías Cornara"
Cohesion: 0.33
Nodes (5): Archivo — portfolio de Matías Cornara, Cómo correrlo, Estructura, Parámetros de diagnóstico, Sobre los assets

### Community 32 - "25. Amigos Tipines: la tercera página de proyecto (21/08/2026)"
Cohesion: 0.29
Nodes (7): 25. Amigos Tipines: la tercera página de proyecto (21/08/2026), CATÁLOGO DE BUGS DE ESTA SESIÓN, CÓMO SE VERIFICÓ, DECISIONES DE DISEÑO QUE SE PROBARON AL REVÉS PRIMERO, EL LIBRO HOJEABLE: EL PROBLEMA QUE NO SE VE HASTA QUE LO ARMÁS, LOS ASSETS: 480 MB QUE NO SE PODÍAN SERVIR, QUEDA PENDIENTE

### Community 33 - "optimizar-tipines.ps1"
Cohesion: 0.47
Nodes (10): ConvertirImagen(), ConvertirImagenAlfa(), ConvertirImagenAlfaRecortada(), ConvertirSenal(), ConvertirVideo(), ConvertirVideoInterpolado(), ConvertirVideoLoop(), HayQueHacerlo() (+2 more)

### Community 34 - "tipines.js"
Cohesion: 0.42
Nodes (8): armarVisor(), crearVisor(), initAlterna(), initLibro(), initPaneo(), initTele(), initTipines(), reproducir()

### Community 35 - "19. +54: la primera página de proyecto después de Simbio (20/08/2026)"
Cohesion: 0.33
Nodes (6): 19. +54: la primera página de proyecto después de Simbio (20/08/2026), BUGS QUE COSTARON TIEMPO ACÁ — no repetirlos, EL PIPELINE DE ASSETS — `tools/optimizar-54.ps1`, LO QUE FALTA, LO QUE SE DECIDIÓ Y POR QUÉ, PERILLAS DE ESTA PÁGINA

### Community 36 - "6. Las imágenes — el pipeline"
Cohesion: 0.40
Nodes (5): 6. Las imágenes — el pipeline, El video de proceso, La foto de portada, Las tres muestras de pieza, Los líquenes

### Community 37 - "22. El control de sonido del sitio, y las historias sin tocar la paleta (22/08/2026)"
Cohesion: 0.33
Nodes (6): 22. El control de sonido del sitio, y las historias sin tocar la paleta (22/08/2026), EL CONTROL DE VOLUMEN — ESTÁNDAR PARA TODO EL PORTFOLIO, EL TAMAÑO SALE DEL ALTO DE LA VENTANA, NO DEL ANCHO DE LA GRILLA, EN EL TELÉFONO ES UN CARRUSEL, PERO LAS OTRAS DOS SIGUEN A LA VISTA, LAS HISTORIAS NO CAMBIAN DE COLOR, LOS NEGROS, A LA PALETA

### Community 38 - "traduccion.js"
Cohesion: 0.38
Nodes (10): borrarCookieDeGoogle(), cambiarA(), cargarWidget(), estaTraducido(), guardar(), idiomaGuardado(), init(), pintarBotones() (+2 more)

### Community 39 - "20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)"
Cohesion: 0.40
Nodes (5): 20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026), BUGS DE ESTA RONDA, CADA PARTE, LO ESTRUCTURAL, LO QUE FALTA

### Community 40 - "18. "ARCHIVO": remake de la portada (20/08/2026)"
Cohesion: 0.50
Nodes (4): 18. "ARCHIVO": remake de la portada (20/08/2026), EL BUG QUE COSTÓ LA RONDA: `.bloque` YA EXISTÍA, LA FICHA: DOS ARREGLOS EN EL COMPONENTE, LO QUE FALTA

### Community 41 - "21. +54: las historias de a una, y el video de la casa más chico (20/08/2026)"
Cohesion: 0.50
Nodes (4): 21. +54: las historias de a una, y el video de la casa más chico (20/08/2026), AHORA VAN DE A UNA, EL VIDEO DE LA CASA, LAS HISTORIAS NO SONABAN, Y NO ERA EL BOTÓN

### Community 42 - "26. Los estilos fantasma, y el menú de teléfono (21/08/2026)"
Cohesion: 0.50
Nodes (4): 26. Los estilos fantasma, y el menú de teléfono (21/08/2026), CÓMO SE ENCONTRÓ (importa, porque el primer intento falló), EL FANTASMA: SWUP NUNCA TOCA EL `<head>`, EL MENÚ HAMBURGUESA

### Community 43 - "28. El par ES/EN: traducción automática de Google (22/08/2026)"
Cohesion: 0.50
Nodes (4): 28. El par ES/EN: traducción automática de Google (22/08/2026), DETALLES QUE IMPORTAN, LAS TRES COSAS QUE COSTARON, TODAS MEDIDAS, LO QUE NO SE TRADUCE, Y POR QUÉ

### Community 44 - "5. Estado actual — qué está hecho"
Cohesion: 0.50
Nodes (4): 5. Estado actual — qué está hecho, `index.html` (la portada "Archivo") — rehecha el 20/08/2026, Las otras 7 páginas de proyecto, `proyectos/simbio.html` — la única página de proyecto hecha

### Community 45 - "22. La caja de cartón, y por qué se trababa (20/08/2026)"
Cohesion: 0.67
Nodes (3): 22. La caja de cartón, y por qué se trababa (20/08/2026), POR QUÉ SE TRABABA: `left`/`top` CONTRA `transform`, QUÉ HACE QUE PAREZCA UNA CAJA Y NO UN CUBO VERDE

### Community 46 - "23. El bug del sonido que seguía sonando: `isIntersecting` no es el threshold (22/08/2026)"
Cohesion: 0.50
Nodes (4): 23. El bug del sonido que seguía sonando: `isIntersecting` no es el threshold (22/08/2026), LA FORMA CORRECTA, LOS OTROS DOS CASOS DE "SUENA ALGO QUE NO ESTOY MIRANDO", MEDIDO, EN TRES VENTANAS

### Community 47 - "29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026)"
Cohesion: 0.18
Nodes (11): 29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026), CÓMO SE VERIFICÓ, EL BUG DEL `1fr` QUE NO ES `1fr`, EL VIDEO DEL HERO: NO ERA EL PESO, ERA EL MATERIAL, EL VISOR DEL LIBRO DEJÓ DE FUNCIONAR — Y NO DIO NINGÚN ERROR, LAS SOMBRAS DEL LIBRO, TERCERA VERSIÓN Y ÚLTIMA, LO DEMÁS, LOS DOS BLOQUES QUE NUNCA SE ALINEABAN (+3 more)

### Community 48 - "30. El ruido fantasma: eran DOS bugs, y el segundo era el bueno (22/08/2026)"
Cohesion: 0.40
Nodes (5): 30. El ruido fantasma: eran DOS bugs, y el segundo era el bueno (22/08/2026), CÓMO SE ENCONTRÓ, EL BUG ADENTRO DEL ARREGLO: `pause` ES ASÍNCRONO, LA REGLA DEL TEASER NO ES LA DE LAS HISTORIAS, LA REGLA GENERAL PARA TODO EL SITIO

### Community 49 - "31. Tipines: tres cosas rotas y por qué (22/08/2026)"
Cohesion: 0.33
Nodes (6): 1. EL PASE DE PÁGINA "MAL ARTICULADO Y CON DESTIEMPO", 2. EL "VER EN GRANDE" NO TENÍA LA ANIMACIÓN DEL LIBRO, 31. Tipines: tres cosas rotas y por qué (22/08/2026), 3. EL TEXTO DE LA MINISERIE DESBORDABA LA SECCIÓN, 4. EL MINI-JUEGO: LAS CUATRO PIEZAS AHORA SE TURNAN, QUEDA PENDIENTE

### Community 50 - "23. Simbio en mobile (20/08/2026)"
Cohesion: 0.67
Nodes (3): 23. Simbio en mobile (20/08/2026), 30-bis. El que de verdad molestaba: ATRAVESAR la sección, LA REGLA GENERAL, CORREGIDA

### Community 51 - "32. Tipines: la composición de la miniserie y el botón que no se veía (22/08/2026)"
Cohesion: 0.67
Nodes (3): 32. Tipines: la composición de la miniserie y el botón que no se veía (22/08/2026), EL BOTÓN DE JUGAR ERA UN PROBLEMA DE CONTRASTE, LA SEÑAL ARRANCA EN LA COLUMNA 2

### Community 52 - "33. Mobiliario de Museo: de cero a página entera (22/08/2026)"
Cohesion: 0.09
Nodes (23): 33-bis. La segunda vuelta: blanco, y por qué se cortaba en el teléfono (23/08/2026), 33-decies. La deformación de Exposición: la caja de recorte vivía en una sola rama (24/08/2026), 33-duodecies. El recorte del carrusel: un caso circular del grid (24/08/2026), 33. Mobiliario de Museo: de cero a página entera (22/08/2026), 33-nonies. Exposición con alfa, y el espejismo de la caja de recorte (23/08/2026), 33-octies. Segunda entrega de renders, y el recorte del vacío (23/08/2026), 33-quater. El recorte del negro: tres intentos, y el bueno era el simple (23/08/2026), 33-quaterdecies. El temblor del centrado: el suavizado era el problema (24/08/2026) (+15 more)

### Community 57 - "27. Repaso de teléfono: el menú y los tamaños de todo (22/08/2026)"
Cohesion: 0.67
Nodes (3): 27. Repaso de teléfono: el menú y los tamaños de todo (22/08/2026), EL MENÚ: EL PROBLEMA ERA LA PASTILLA ESTIRADA, EL REPASO: LOS PROBLEMAS ERAN SISTÉMICOS, NO DE UNA PÁGINA

### Community 58 - "34. Las pastillas, la portada de Simbio y el fin de la preportada (25/08/2026)"
Cohesion: 0.40
Nodes (5): 34. Las pastillas, la portada de Simbio y el fin de la preportada (25/08/2026), La Tesis, afuera por ahora, Las pastillas, corregidas, Se fue la preportada, Simbio vuelve a la fila

### Community 60 - "31. La tira de pictogramas: por qué ningún recorte servía (22/08/2026)"
Cohesion: 0.50
Nodes (4): 31. La tira de pictogramas: por qué ningún recorte servía (22/08/2026), CÓMO QUEDÓ, LA LECCIÓN, QUE SIRVE PARA CUALQUIER VIDEO, LA MEDICIÓN QUE LO MOSTRÓ

### Community 61 - "35. El click deja de ser un pulso y pasa a ser un encuadre (26/08/2026)"
Cohesion: 0.50
Nodes (4): 35. El click deja de ser un pulso y pasa a ser un encuadre (26/08/2026), CÓMO ESTÁ HECHO, Y POR QUÉ ASÍ, DÓNDE, QUÉ QUEDÓ

## Knowledge Gaps
- **214 isolated node(s):** `PROYECTOS`, `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)` (+209 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ARCHIVO / MI CAJÓN — bitácora del proyecto` connect `ARCHIVO / MI CAJÓN — bitácora del proyecto` to `19. La portada, segunda pasada: sacar y dar aire (20/08/2026)`, `3. Tipografía`, `23. La caja como caja, el aire y un solo crema (21/08/2026)`, `27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)`, `20. La portada, tercera pasada: una pantalla por sección (20/08/2026)`, `21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)`, `25. Amigos Tipines: la tercera página de proyecto (21/08/2026)`, `19. +54: la primera página de proyecto después de Simbio (20/08/2026)`, `6. Las imágenes — el pipeline`, `22. El control de sonido del sitio, y las historias sin tocar la paleta (22/08/2026)`, `20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)`, `18. "ARCHIVO": remake de la portada (20/08/2026)`, `21. +54: las historias de a una, y el video de la casa más chico (20/08/2026)`, `26. Los estilos fantasma, y el menú de teléfono (21/08/2026)`, `28. El par ES/EN: traducción automática de Google (22/08/2026)`, `5. Estado actual — qué está hecho`, `22. La caja de cartón, y por qué se trababa (20/08/2026)`, `23. El bug del sonido que seguía sonando: `isIntersecting` no es el threshold (22/08/2026)`, `29. Tipines, tercera vuelta: por qué se trababa el video y otros cinco bugs (22/08/2026)`, `30. El ruido fantasma: eran DOS bugs, y el segundo era el bueno (22/08/2026)`, `31. Tipines: tres cosas rotas y por qué (22/08/2026)`, `23. Simbio en mobile (20/08/2026)`, `32. Tipines: la composición de la miniserie y el botón que no se veía (22/08/2026)`, `33. Mobiliario de Museo: de cero a página entera (22/08/2026)`, `27. Repaso de teléfono: el menú y los tamaños de todo (22/08/2026)`, `34. Las pastillas, la portada de Simbio y el fin de la preportada (25/08/2026)`, `31. La tira de pictogramas: por qué ningún recorte servía (22/08/2026)`, `35. El click deja de ser un pulso y pasa a ser un encuadre (26/08/2026)`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Why does `33. Mobiliario de Museo: de cero a página entera (22/08/2026)` connect `33. Mobiliario de Museo: de cero a página entera (22/08/2026)` to `ARCHIVO / MI CAJÓN — bitácora del proyecto`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)` connect `27. Tipines, segunda vuelta: la ronda de correcciones de Mati (21/08/2026)` to `ARCHIVO / MI CAJÓN — bitácora del proyecto`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `PROYECTOS`, `graphify`, `Usage` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ARCHIVO / MI CAJÓN — bitácora del proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `33. Mobiliario de Museo: de cero a página entera (22/08/2026)` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._