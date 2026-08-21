<#
================================================================================
 OPTIMIZAR-54.PS1 — versiones web de los assets de +54
================================================================================

 POR QUÉ EXISTE
 La carpeta assets/+54 pesa ~100 MB en originales: tres animaciones de 10 a 27
 MB, un teaser de 20 MB, y cuatro posters de 3356x4760 (uno de ellos 9,9 MB).
 Servir eso tal cual es una página que tarda un minuto en arrancar. Este script
 genera al lado una carpeta web/ con las mismas piezas en tamaño de pantalla.

 El HTML SIEMPRE apunta a assets/+54/web/. Los originales no se tocan nunca:
 quedan como archivo maestro para reimprimir o reexportar.

 CÓMO SE CORRE
   powershell -ExecutionPolicy Bypass -File tools\optimizar-54.ps1

 Es idempotente: si el archivo de salida ya existe y es más nuevo que el
 original, lo saltea. Para rehacer todo:
   powershell -ExecutionPolicy Bypass -File tools\optimizar-54.ps1 -Forzar

 REQUISITO: ffmpeg en el PATH (el mismo que usa tools\video-a-frames.ps1).

 QUÉ GENERA
   web/ilustraciones.mp4     hero — la tira de pictogramas
   web/logo.mp4              sección 2 — el comportamiento del logo
   web/paleta.mp4            sección 2 — la paleta
   web/exposicion.mp4        sección 5 — las vistas de la casa
   web/teaser.mp4            sección 4 — el único que conserva audio
   web/*.jpg                 primer cuadro de cada video (atributo poster)
   web/tira.jpg              frame_largo_1 (8566x1080) como JPEG
   web/poster-N.jpg          los 4 posters a 1400 px de ancho
   web/mockup-N.jpg          los 3 mockups del manual de marca
   web/mckp-web.jpg          la captura del sitio

 Las POSTALES no pasan por acá: ya vienen a 420x297 y entre 27 y 250 KB.
================================================================================
#>

param(
  [switch]$Forzar
)

$ErrorActionPreference = "Stop"

$raiz    = Split-Path -Parent $PSScriptRoot
$origen  = Join-Path $raiz "assets\+54"
$destino = Join-Path $origen "web"

if (-not (Test-Path $origen)) {
  Write-Host "No encuentro $origen" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Host "Falta ffmpeg en el PATH." -ForegroundColor Red
  Write-Host "  winget install Gyan.FFmpeg   (y despues abri una consola nueva)"
  exit 1
}

New-Item -ItemType Directory -Force -Path $destino | Out-Null

# ------------------------------------------------------------------------------
# Saltea si la salida ya existe y es mas nueva que la entrada.
# ------------------------------------------------------------------------------
function HayQueHacerlo($entrada, $salida) {
  if ($Forzar) { return $true }
  if (-not (Test-Path $salida)) { return $true }
  return (Get-Item $entrada).LastWriteTime -gt (Get-Item $salida).LastWriteTime
}

function Peso($ruta) {
  if (-not (Test-Path $ruta)) { return "" }
  $kb = [math]::Round((Get-Item $ruta).Length / 1KB)
  if ($kb -ge 1024) { return "{0:N1} MB" -f ($kb / 1024) }
  return "$kb KB"
}

# ------------------------------------------------------------------------------
# VIDEO
#   -an            saca el audio. Ninguna de las animaciones lo usa, y el audio
#                  de un loop mudo es peso puro.
#   crf 30         calidad visual. Son colores planos y degrades suaves: aguantan
#                  un crf alto sin que se note. Bajalo a 26 si ves banding.
#   faststart      manda el indice al principio del archivo, asi el navegador
#                  puede empezar a reproducir sin bajarlo entero. Sin esto, un
#                  video de 30 s no arranca hasta que termina de descargar.
#   yuv420p        el unico pix_fmt que reproducen todos los navegadores.
# ------------------------------------------------------------------------------
function ConvertirVideo($entrada, $salida, $anchoMax, $crf, $conAudio) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }

  # -2 en la altura: la deja par, que es lo que exige h264.
  $filtro = "scale='min($anchoMax,iw)':-2"
  $opciones = @(
    "-y", "-v", "error",
    "-i", $entrada,
    "-vf", $filtro,
    "-c:v", "libx264", "-crf", "$crf", "-preset", "slow",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart"
  )
  if ($conAudio) { $opciones += @("-c:a", "aac", "-b:a", "96k") } else { $opciones += "-an" }
  $opciones += $salida

  & ffmpeg @opciones
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# POSTER DEL VIDEO
# El primer cuadro, como JPEG. Va en el atributo poster="" del <video>: con
# preload="none" el navegador no baja un solo byte del video hasta que hace
# falta, pero el lugar no queda en blanco.
# ------------------------------------------------------------------------------
# $segundo = desde que momento del video sacar el cuadro. NO siempre sirve el
# primero: el teaser abre en negro, y un rectangulo negro como vista previa no
# dice nada de la pieza. Para las animaciones que arrancan con imagen, 0 esta
# bien; para las que hacen fade in, pone 2 o 3.
function PosterDeVideo($entrada, $salida, $anchoMax, $segundo = 0) {
  if (-not (Test-Path $entrada)) { return }
  if (-not (HayQueHacerlo $entrada $salida)) { return }
  # -ss ANTES de -i busca el cuadro sin decodificar todo lo anterior.
  & ffmpeg -y -v error -ss $segundo -i $entrada -vf "scale='min($anchoMax,iw)':-2" -frames:v 1 -q:v 4 $salida
  Write-Host "  $(Split-Path -Leaf $salida)  ($(Peso $salida))" -ForegroundColor DarkGreen
}

# ------------------------------------------------------------------------------
# IMAGEN
# q:v 3 es alta calidad (la escala de ffmpeg va de 2 = mejor a 31 = peor).
# Los posters son color plano con tipografia grande: con q mas alto aparecen
# halos alrededor de las letras.
# ------------------------------------------------------------------------------
function ConvertirImagen($entrada, $salida, $anchoMax, $q) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  & ffmpeg -y -v error -i $entrada -vf "scale='min($anchoMax,iw)':-1" -q:v $q $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}


Write-Host ""
Write-Host "VIDEOS" -ForegroundColor Cyan

$paraWeb = Join-Path $origen "PARA WEB"

ConvertirVideo (Join-Path $paraWeb "animacion_ilustraciones.mp4") (Join-Path $destino "ilustraciones.mp4") 1280 30 $false
ConvertirVideo (Join-Path $paraWeb "animacion_paleta.mp4")        (Join-Path $destino "paleta.mp4")        1000 30 $false
ConvertirVideo (Join-Path $paraWeb "animacion_exposicion.mp4")    (Join-Path $destino "exposicion.mp4")    1280 30 $false
ConvertirVideo (Join-Path $origen  "COMPORTAMIENTO.mp4")          (Join-Path $destino "logo.mp4")          1000 30 $false

# EL TEASER. Se busca con comodin y no por nombre exacto a proposito: el
# archivo se llama "+54 GESTION CULTURAL 2025.mp4" con tilde en la O, y una
# tilde escrita aca adentro rompe el script entero. PowerShell 5.1 lee los
# .ps1 como ANSI, y la O con tilde en UTF-8 termina en un byte que interpreta
# como comilla tipografica: a partir de ahi cree que todo el resto del archivo
# es una cadena de texto sin cerrar. Nos costo una corrida completa.
# Con el comodin el nombre no aparece nunca en el codigo, y ademas sigue
# andando si el archivo se renombra al exportarlo de nuevo.
$teaser = Get-ChildItem (Join-Path $origen "TEASER") -Filter *.mp4 | Select-Object -First 1
if ($teaser) {
  # crf 28 (un poco mejor que el resto) y CON audio: es la unica pieza que se
  # mira, no que corre de fondo.
  ConvertirVideo $teaser.FullName (Join-Path $destino "teaser.mp4") 1280 28 $true
} else {
  Write-Host "  falta: el video del teaser en TEASER\" -ForegroundColor Yellow
}

# LAS TRES HISTORIAS. Son verticales (1080x1920) y en pantalla se ven a menos
# de 250 px de ancho, asi que 540 de ancho ya cubre pantallas de doble
# densidad y de sobra. Se buscan con comodin y se numeran por orden alfabetico:
# asi el nombre exacto del archivo no importa.
$historias = Get-ChildItem (Join-Path $origen "HISTORIAS") -Filter *.mp4 -ErrorAction SilentlyContinue | Sort-Object Name
if ($historias) {
  $n = 1
  foreach ($h in $historias) {
    ConvertirVideo $h.FullName (Join-Path $destino "historia-$n.mp4") 540 30 $false
    $n++
  }
} else {
  Write-Host "  falta: los videos de historias en HISTORIAS\" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "POSTERS DE VIDEO (primer cuadro)" -ForegroundColor Cyan

PosterDeVideo (Join-Path $destino "ilustraciones.mp4") (Join-Path $destino "ilustraciones.jpg") 1280
PosterDeVideo (Join-Path $destino "paleta.mp4")        (Join-Path $destino "paleta.jpg")        1000
PosterDeVideo (Join-Path $destino "exposicion.mp4")    (Join-Path $destino "exposicion.jpg")    1280
PosterDeVideo (Join-Path $destino "logo.mp4")          (Join-Path $destino "logo.jpg")          1000
# El teaser a los 12 s: los primeros segundos son negro.
PosterDeVideo (Join-Path $destino "teaser.mp4")        (Join-Path $destino "teaser.jpg")        1280 12

for ($i = 1; $i -le 3; $i++) {
  PosterDeVideo (Join-Path $destino "historia-$i.mp4") (Join-Path $destino "historia-$i.jpg") 540 1
}

Write-Host ""
Write-Host "IMAGENES" -ForegroundColor Cyan

# LA TIRA. Se queda en 8566 px de ancho a proposito: es la pieza que se
# scrollea en horizontal y bajarle el ancho es bajarle la nitidez justo a lo
# unico que se mira de cerca en esa pantalla. Lo que cambia es el formato:
# de PNG (4,8 MB) a JPEG.
ConvertirImagen (Join-Path $paraWeb "frame_largo_1.png") (Join-Path $destino "tira.jpg") 8566 3

# LOS 4 POSTERS. De 3356x4760 a 1400 de ancho: en pantalla nunca se ven a mas
# de ~700 px, asi que 1400 ya cubre las pantallas de doble densidad.
for ($i = 1; $i -le 4; $i++) {
  ConvertirImagen (Join-Path $origen "POSTERS\POSTER $i.jpg") (Join-Path $destino "poster-$i.jpg") 1400 3
}

# MOCKUPS del manual de marca
ConvertirImagen (Join-Path $origen "MOCKUPS\MANUAL DE MARCA.jpeg")   (Join-Path $destino "mockup-1.jpg") 1400 4
ConvertirImagen (Join-Path $origen "MOCKUPS\MANUAL DE MARCA 2.jpeg") (Join-Path $destino "mockup-2.jpg") 1400 4
ConvertirImagen (Join-Path $origen "MOCKUPS\MANUAL DE MARCA 3.jpeg") (Join-Path $destino "mockup-3.jpg") 1400 4

# La captura del sitio. Va a 2400 y no a 1600: en la pagina se ve a pantalla
# completa, asi que necesita ancho de verdad.
ConvertirImagen (Join-Path $paraWeb "MCKP_WEB.jpeg") (Join-Path $destino "mckp-web.jpg") 2400 3

# LAS 4 FOTOS DE LA INSTALACION.
#
# SALEN COMO PNG Y NO COMO JPEG, y no es un detalle: los originales tienen
# FONDO TRANSPARENTE (la habitacion flota, no hay fondo). El JPEG no guarda
# canal alfa, asi que al convertirlas ffmpeg rellena la transparencia con
# NEGRO: las cuatro quedaban como un rectangulo negro con la pieza adentro.
# En PNG la transparencia se conserva y el crema de la pagina se ve a traves,
# que es el mismo criterio que ya usa la portada de Simbio.
#
# Van numeradas 1 a 4 y ESE ORDEN IMPORTA: es el orden en el que aparecen una
# tras otra en la pagina (ver la parte de la instalacion en mas-54.html).
# No reordenarlas.
function ConvertirPNG($entrada, $salida, $anchoMax) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  # rgba: conserva el canal alfa. compression_level 100 = el PNG mas chico que
  # sabe hacer ffmpeg (es lento, pero esto se corre una vez).
  & ffmpeg -y -v error -i $entrada -vf "scale='min($anchoMax,iw)':-1" `
    -pix_fmt rgba -compression_level 100 $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

for ($i = 1; $i -le 4; $i++) {
  ConvertirPNG (Join-Path $paraWeb "fotos instalacion\$i.png") (Join-Path $destino "instalacion-$i.png") 1100
}

Write-Host ""
$total = (Get-ChildItem $destino -File | Measure-Object -Property Length -Sum).Sum
Write-Host ("web/ = {0:N1} MB en {1} archivos" -f ($total / 1MB), (Get-ChildItem $destino -File).Count) -ForegroundColor Cyan
Write-Host ""
