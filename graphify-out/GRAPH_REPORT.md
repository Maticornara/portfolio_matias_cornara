# Graph Report - CODIGO_CLAUDE  (2026-08-21)

## Corpus Check
- 29 files · ~57,431,989 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 259 nodes · 311 edges · 37 communities (33 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75448184`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.js
- ARCHIVO / MI CAJÓN — bitácora del proyecto
- sandbox.js
- simbio-scroll.js
- What You Must Do When Invoked
- /graphify
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
- 19. +54: la primera página de proyecto después de Simbio (20/08/2026)
- 23. La caja como caja, el aire y un solo crema (21/08/2026)
- archivo.js
- 19. La portada, segunda pasada: sacar y dar aire (20/08/2026)
- 20. La portada, tercera pasada: una pantalla por sección (20/08/2026)
- 21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)
- Archivo — portfolio de Matías Cornara
- 25. Amigos Tipines: la tercera página de proyecto (21/08/2026)
- optimizar-tipines.ps1
- tipines.js
- 20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)
- 6. Las imágenes — el pipeline

## God Nodes (most connected - your core abstractions)
1. `ARCHIVO / MI CAJÓN — bitácora del proyecto` - 30 edges
2. `init()` - 13 edges
3. `What You Must Do When Invoked` - 12 edges
4. `/graphify` - 11 edges
5. `init54()` - 9 edges
6. `Portfolio "Archivo" — mapa del proyecto` - 9 edges
7. `23. La caja como caja, el aire y un solo crema (21/08/2026)` - 9 edges
8. `graphify reference: extra exports and benchmark` - 8 edges
9. `alScrollear()` - 7 edges
10. `activarScrubbing()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `initTira()` --indirect_call--> `alScrollear()`  [INFERRED]
  js/mas-54.js → js/simbio-scroll.js

## Import Cycles
- None detected.

## Communities (37 total, 4 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.23
Nodes (14): avisarSiEsArchivo(), init(), initBlurPortada(), initCarpetas(), initColumnaSincro(), initCursor(), initHoverReveal(), initLupa() (+6 more)

### Community 1 - "ARCHIVO / MI CAJÓN — bitácora del proyecto"
Cohesion: 0.05
Nodes (37): 0. Cómo levantar el sitio, 10. Herramientas de diagnóstico, 11. Mapa de archivos, 12. Pendientes, 13. Perillas para editar a mano (11/08/2026), 14. Rebranding tipográfico de Simbio + arreglos (12/08/2026), 15. La grilla manda: 4 columnas para todo (12/08/2026), 16. Ajustes de composición y las carpetas (12/08/2026) (+29 more)

### Community 2 - "sandbox.js"
Cohesion: 0.52
Nodes (6): init(), initBooklet(), initCursor(), initFolder(), initHoverReveal(), initReveal()

### Community 3 - "simbio-scroll.js"
Cohesion: 0.25
Nodes (17): activarScrubbing(), actualizarFase(), actualizarProgreso(), alScrollear(), cargarUna(), dibujar(), escribirFase(), faseDeFrame() (+9 more)

### Community 4 - "What You Must Do When Invoked"
Cohesion: 0.13
Nodes (15): Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Step 0 - GitHub repos and multi-path merge (only if a URL or several paths), Step 1 - Ensure graphify is installed, Step 2.5 - Video and audio (only if video files detected), Step 2 - Detect files, Step 3 - Extract entities and relationships (+7 more)

### Community 5 - "/graphify"
Cohesion: 0.17
Nodes (11): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, PowerShell 5.1: Vertical scrolling stops working (+3 more)

### Community 11 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 12 - "Portfolio "Archivo" — mapa del proyecto"
Cohesion: 0.20
Nodes (9): Antes de tocar nada: cómo se corre, Arquitectura, Diagnóstico, Estructura, graphify, La bitácora, Perillas para editar a mano, Portfolio "Archivo" — mapa del proyecto (+1 more)

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
Cohesion: 0.38
Nodes (10): init54(), initAlterna(), initCarrusel(), initFotosCasa(), initHistorias(), initPostales(), initTeaser(), initTira() (+2 more)

### Community 24 - "optimizar-54.ps1"
Cohesion: 0.61
Nodes (7): ConvertirImagen(), ConvertirPNG(), ConvertirVideo(), ConvertirVideoRecortado(), HayQueHacerlo(), Peso(), PosterDeVideo()

### Community 25 - "19. +54: la primera página de proyecto después de Simbio (20/08/2026)"
Cohesion: 0.33
Nodes (6): 19. +54: la primera página de proyecto después de Simbio (20/08/2026), BUGS QUE COSTARON TIEMPO ACÁ — no repetirlos, EL PIPELINE DE ASSETS — `tools/optimizar-54.ps1`, LO QUE FALTA, LO QUE SE DECIDIÓ Y POR QUÉ, PERILLAS DE ESTA PÁGINA

### Community 26 - "23. La caja como caja, el aire y un solo crema (21/08/2026)"
Cohesion: 0.22
Nodes (9): 20-bis. La banda de pictogramas y el video de la casa (20/08/2026), 23. La caja como caja, el aire y un solo crema (21/08/2026), APTITUDES, EL NOMBRE Y LA FRASE, DEL MISMO LARGO, FUERA LAS RAYAS, LA ANIMACIÓN: DE ARRIBA A ABAJO, Y LA PERSPECTIVA ACOMPAÑA, LA DIAGONAL QUE NO IBA: LA TAPA TIENE DOS SOLAPAS, NO CUATRO, LOS AGARRES: EL AGUJERO VA OSCURO (+1 more)

### Community 27 - "archivo.js"
Cohesion: 0.60
Nodes (5): acomodarDibujo(), init(), initDesenfoque(), initEsquina(), initMedida()

### Community 28 - "19. La portada, segunda pasada: sacar y dar aire (20/08/2026)"
Cohesion: 0.33
Nodes (6): 19. La portada, segunda pasada: sacar y dar aire (20/08/2026), EL AIRE ES EL ÚNICO SEPARADOR, EL GRID: ORDENADO, RECTO Y DEL MISMO TAMAÑO, LA CAJA DEL HERO, LAS TARJETAS Y SUS LINKS, LO QUE SALIÓ

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
Cohesion: 0.56
Nodes (8): ConvertirImagen(), ConvertirImagenAlfa(), ConvertirSenal(), ConvertirVideo(), ConvertirVideoLoop(), HayQueHacerlo(), Peso(), PosterDeVideo()

### Community 34 - "tipines.js"
Cohesion: 0.60
Nodes (5): initLibro(), initPaneo(), initTele(), initTipines(), reproducir()

### Community 35 - "20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)"
Cohesion: 0.40
Nodes (5): 20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026), BUGS DE ESTA RONDA, CADA PARTE, LO ESTRUCTURAL, LO QUE FALTA

### Community 36 - "6. Las imágenes — el pipeline"
Cohesion: 0.40
Nodes (5): 6. Las imágenes — el pipeline, El video de proceso, La foto de portada, Las tres muestras de pieza, Los líquenes

## Knowledge Gaps
- **129 isolated node(s):** `PROYECTOS`, `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ARCHIVO / MI CAJÓN — bitácora del proyecto` connect `ARCHIVO / MI CAJÓN — bitácora del proyecto` to `25. Amigos Tipines: la tercera página de proyecto (21/08/2026)`, `20. +54, segunda vuelta: revisión completa parte por parte (20/08/2026)`, `6. Las imágenes — el pipeline`, `19. +54: la primera página de proyecto después de Simbio (20/08/2026)`, `23. La caja como caja, el aire y un solo crema (21/08/2026)`, `19. La portada, segunda pasada: sacar y dar aire (20/08/2026)`, `20. La portada, tercera pasada: una pantalla por sección (20/08/2026)`, `21. La esquina, bien hecha: por qué la caja flotaba (20/08/2026)`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `23. La caja como caja, el aire y un solo crema (21/08/2026)` connect `23. La caja como caja, el aire y un solo crema (21/08/2026)` to `ARCHIVO / MI CAJÓN — bitácora del proyecto`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `25. Amigos Tipines: la tercera página de proyecto (21/08/2026)` connect `25. Amigos Tipines: la tercera página de proyecto (21/08/2026)` to `ARCHIVO / MI CAJÓN — bitácora del proyecto`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `PROYECTOS`, `graphify`, `Usage` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ARCHIVO / MI CAJÓN — bitácora del proyecto` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `What You Must Do When Invoked` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._