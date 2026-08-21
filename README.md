# Archivo — portfolio de Matías Cornara

Sitio estático. HTML, CSS y JavaScript puro: sin build step, sin `package.json`,
sin dependencias que instalar.

## Cómo correrlo

**No funciona abriendo los HTML con doble click.** El protocolo `file://` bloquea
la carga de imágenes dentro de un `<canvas>`, y las animaciones de scroll quedan
muertas aunque el código esté bien.

```
tools\servidor.bat
```

Y después entrar por:

```
http://localhost:8123/
http://localhost:8123/proyectos/simbio.html
```

## Estructura

| Carpeta | Qué hay |
|---|---|
| `index.html` | La portada entera |
| `css/` | `archivo.css` (portada) y `simbio.css` (página de proyecto) |
| `js/` | Scroll-scrubbing, cursor, transiciones, animaciones de pieza |
| `assets/` | Imágenes, frames y video — incluye los originales pesados |
| `proyectos/` | Las páginas de cada proyecto |
| `notas/` | `DECISIONES.md`, la bitácora larga del proyecto |
| `tools/` | Servidor local y pipelines de assets en PowerShell |

La pieza central es `js/simbio-scroll.js`: hace scroll-scrubbing de un ensamble
de 375 frames sobre canvas.

## Parámetros de diagnóstico

Se agregan a la URL:

| | |
|---|---|
| `?grid` | dibuja las 4 columnas de la grilla encima de la página |
| `?debug=1` | protocolo, frames cargados, frame actual, avance |
| `?frame=340` | dibuja ese frame del ensamble sin scrollear |

## Sobre los assets

`assets/` incluye tanto las versiones optimizadas que usa el sitio (las carpetas
terminadas en `-web`) como los originales sin comprimir de los que salieron. Los
originales son la mayor parte del peso del repositorio; se conservan acá como
respaldo. Las conversiones se hacen con los scripts de `tools/`.
