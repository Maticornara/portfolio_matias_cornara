# =============================================================================
# VIDEO-A-FRAMES.PS1
# Convierte un video en lo que el sitio sabe usar.
#
# Tres modos, segun para que lo necesites:
#
#   -Modo frames   (por defecto)
#       Saca la secuencia de PNG numerados, igual que si vinieran de Blender.
#       Es el mejor para las animaciones del sitio: se controlan con scroll o
#       con loop de rebote, y se ven perfectas.
#       Despues hay que pasarlos por optimizar-frames.ps1.
#
#   -Modo video
#       Deja un MP4 y un WebM optimizados para web, sin audio.
#       Para meter como <video> con loop. Es lo mas liviano de todo.
#
#   -Modo gif
#       Hace el GIF. Anda, pero AVISO: el GIF solo maneja 256 colores y
#       comprime mal los degrades. En los renders de SIMBIO (fondo crema
#       suave, sombras blandas) se ven bandas, y pesa varias veces mas que
#       el mismo movimiento en video. Usarlo solo si hace falta un archivo
#       que se pueda mandar por chat o pegar en otro lado.
#
# EJEMPLOS
#   powershell -ExecutionPolicy Bypass -File tools\video-a-frames.ps1 -Video "C:\ruta\clip.mp4" -Salida "assets\simbio\proceso\prueba-tanza"
#   ... -Modo video -Video "clip.mp4" -Salida "assets\simbio\proceso\prueba"
#   ... -Modo gif   -Video "clip.mp4" -Salida "assets\simbio\proceso\prueba" -Fps 12 -Ancho 600
# =============================================================================

param(
  [Parameter(Mandatory=$true)][string]$Video,
  [Parameter(Mandatory=$true)][string]$Salida,   # carpeta (frames) o nombre base (video/gif)
  [ValidateSet("frames","video","gif")][string]$Modo = "frames",
  [int]$Fps = 24,
  [int]$Ancho = 1280
)

$ErrorActionPreference = "Stop"

# --- Encontrar ffmpeg ---------------------------------------------------
# Recien instalado por winget, el PATH de esta ventana todavia no lo tiene,
# asi que lo buscamos tambien en la carpeta donde winget lo deja.
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) {
  $posibles = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\ffmpeg.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin\ffmpeg.exe"
  )
  foreach ($p in $posibles) {
    $hit = Get-Item $p -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) { $ffmpeg = $hit.FullName; break }
  }
}
if (-not $ffmpeg) { throw "No encuentro ffmpeg. Abri una ventana nueva de PowerShell y proba: ffmpeg -version" }

if (-not (Test-Path $Video)) { throw "No existe el video: $Video" }

$Raiz = Split-Path -Parent $PSScriptRoot
if (-not [System.IO.Path]::IsPathRooted($Salida)) { $Salida = Join-Path $Raiz $Salida }

Write-Output "ffmpeg: $ffmpeg"
Write-Output "modo:   $Modo"
Write-Output ""

switch ($Modo) {

  "frames" {
    # Carpeta de salida, y los PNG numerados desde 0000 con 4 digitos:
    # el mismo formato que espera el resto del sitio.
    if (-not (Test-Path $Salida)) { New-Item -ItemType Directory -Path $Salida | Out-Null }
    $patron = Join-Path $Salida "%04d.png"
    & $ffmpeg -y -i $Video -vf "fps=$Fps,scale=${Ancho}:-2:flags=lanczos" -start_number 0 $patron
    $n = (Get-ChildItem $Salida -Filter *.png).Count
    Write-Output ""
    Write-Output "$n frames PNG en: $Salida"
    Write-Output "SIGUIENTE PASO: agregar esa carpeta a la tabla de optimizar-frames.ps1 y correrlo."
  }

  "video" {
    # -an saca el audio (no hace falta y pesa).
    # crf: menor = mejor calidad y mas peso. 26 es un buen punto para web.
    # faststart: deja el indice al principio, asi empieza a reproducirse
    # antes de terminar de bajar.
    & $ffmpeg -y -i $Video -an -vf "scale=${Ancho}:-2:flags=lanczos" `
      -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart "$Salida.mp4"
    & $ffmpeg -y -i $Video -an -vf "scale=${Ancho}:-2:flags=lanczos" `
      -c:v libvpx-vp9 -crf 34 -b:v 0 "$Salida.webm"
    Write-Output ""
    foreach ($f in @("$Salida.mp4", "$Salida.webm")) {
      if (Test-Path $f) { "{0} · {1:N0} KB" -f (Split-Path $f -Leaf), ((Get-Item $f).Length/1KB) }
    }
  }

  "gif" {
    # Dos pasadas: primero se calcula una paleta a medida del video y
    # despues se aplica. Con la paleta por defecto los degrades quedan
    # sucios; asi es lo mejor que puede dar un GIF.
    $paleta = Join-Path $env:TEMP "paleta-$([guid]::NewGuid().ToString('N')).png"
    & $ffmpeg -y -i $Video -vf "fps=$Fps,scale=${Ancho}:-2:flags=lanczos,palettegen=stats_mode=diff" $paleta
    & $ffmpeg -y -i $Video -i $paleta -lavfi "fps=$Fps,scale=${Ancho}:-2:flags=lanczos[x];[x][1:v]paletteuse=dither=sierra2_4a" "$Salida.gif"
    Remove-Item $paleta -ErrorAction SilentlyContinue
    Write-Output ""
    if (Test-Path "$Salida.gif") {
      "{0} · {1:N0} KB" -f (Split-Path "$Salida.gif" -Leaf), ((Get-Item "$Salida.gif").Length/1KB)
      Write-Output "Si pesa mucho: bajar -Fps (probar 12) o -Ancho (probar 600)."
    }
  }
}
