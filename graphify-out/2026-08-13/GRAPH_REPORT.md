# Graph Report - .  (2026-08-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 47 nodes · 76 edges · 11 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- main.js
- init
- sandbox.js
- simbio-scroll.js
- activarScrubbing
- iniciar

## God Nodes (most connected - your core abstractions)
1. `init()` - 13 edges
2. `iniciar()` - 7 edges
3. `activarScrubbing()` - 6 edges
4. `init()` - 6 edges
5. `actualizarFase()` - 5 edges
6. `alScrollear()` - 5 edges
7. `pintarDebug()` - 4 edges
8. `pasoTexto()` - 3 edges
9. `escribirFase()` - 3 edges
10. `hayFrames()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `init()` --calls--> `initTypewriter()`  [EXTRACTED]
  js/main.js → js/main.js  _Bridges community 0 → community 1_
- `activarScrubbing()` --calls--> `actualizarFase()`  [EXTRACTED]
  js/simbio-scroll.js → js/simbio-scroll.js  _Bridges community 3 → community 4_
- `iniciar()` --calls--> `medirCanvas()`  [EXTRACTED]
  js/simbio-scroll.js → js/simbio-scroll.js  _Bridges community 4 → community 5_

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.25
Nodes (6): initHoverReveal(), initNavEsquiva(), initParallaxLiquenes(), initReveal(), initTypewriter(), PROYECTOS

### Community 1 - "init"
Cohesion: 0.25
Nodes (8): init(), initBlurPortada(), initCarpetas(), initColumnaSincro(), initCursor(), initLupa(), initReglaGrilla(), initTilt()

### Community 2 - "sandbox.js"
Cohesion: 0.52
Nodes (6): init(), initBooklet(), initCursor(), initFolder(), initHoverReveal(), initReveal()

### Community 3 - "simbio-scroll.js"
Cohesion: 0.60
Nodes (5): actualizarFase(), escribirFase(), faseDeFrame(), pasoTexto(), prefijoComun()

### Community 4 - "activarScrubbing"
Cohesion: 0.47
Nodes (6): activarScrubbing(), alScrollear(), dibujar(), medirCanvas(), pintarDebug(), progresoDeScroll()

### Community 5 - "iniciar"
Cohesion: 0.33
Nodes (6): actualizarProgreso(), cargarUna(), hayFrames(), iniciar(), mostrarMensaje(), precargar()

## Knowledge Gaps
- **1 isolated node(s):** `PROYECTOS`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `init` to `main.js`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `iniciar()` connect `iniciar` to `simbio-scroll.js`, `activarScrubbing`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `PROYECTOS` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._