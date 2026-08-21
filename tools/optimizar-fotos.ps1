# =============================================================================
# OPTIMIZAR-FOTOS.PS1
# Convierte una carpeta de fotos sueltas a JPG livianos para la web.
#
# EN QUE SE DIFERENCIA DE OPTIMIZAR-FRAMES.PS1
#   El de frames fuerza un tamano exacto (1600x900) porque son secuencias donde
#   todos los cuadros tienen que medir lo mismo. Estas son fotos sueltas, unas
#   verticales y otras horizontales: aca se limita el LADO MAS LARGO y el otro
#   sale de la proporcion. Nada se estira ni se recorta.
#
# POR QUE HACE FALTA
#   Las fotos de camara vienen a 2736x3648 y 13 MB cada una. Cuatro de esas son
#   51 MB: la pagina tardaria mas en abrir esa carpeta que todo el resto del
#   sitio junto. Convertidas quedan en unos cientos de KB.
#
# NO TOCA LOS ORIGINALES. Escribe en una carpeta hermana con sufijo "-web".
# Se puede cortar y volver a correr: saltea lo que ya convirtio.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-fotos.ps1 `
#              -Carpeta assets\simbio\prototipo
#
#   -Lado     pixeles del lado mas largo. 1600 por defecto (alcanza de sobra:
#             en pantalla ninguna de estas fotos se ve a mas de 800).
#   -Calidad  1 a 100. 88 por defecto.
# =============================================================================

param(
  [Parameter(Mandatory=$true)][string]$Carpeta,
  [int]$Lado = 1600,
  [int]$Calidad = 88
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$origen  = (Resolve-Path $Carpeta).Path
$destino = $origen + "-web"
if (-not (Test-Path $destino)) { New-Item -ItemType Directory -Path $destino | Out-Null }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                     [System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

# El "\*" al final es necesario: -Include sin comodin en la ruta no filtra nada
# y devuelve la lista vacia (me paso).
$archivos = Get-ChildItem (Join-Path $origen "*") -Include *.png,*.jpg,*.jpeg -File |
            Sort-Object Name
if ($archivos.Count -eq 0) { Write-Output "No hay fotos en $origen"; exit }

foreach ($archivo in $archivos) {
  $salida = Join-Path $destino ($archivo.BaseName + ".jpg")
  if (Test-Path $salida) { Write-Output ("  ya estaba: " + $archivo.BaseName); continue }

  $img = [System.Drawing.Image]::FromFile($archivo.FullName)

  # El lado mas largo va a $Lado; el otro se calcula para no deformar.
  # Si la foto ya es mas chica, no se agranda (escala tope 1).
  $escala = [Math]::Min(1.0, $Lado / [Math]::Max($img.Width, $img.Height))
  $ancho = [int][Math]::Round($img.Width * $escala)
  $alto  = [int][Math]::Round($img.Height * $escala)

  $bmp = New-Object System.Drawing.Bitmap($ancho, $alto)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  # Blanco abajo: si la foto tiene transparencia, el JPG no la soporta y sin
  # esto quedaria fondo negro.
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = "HighQualityBicubic"
  $g.PixelOffsetMode = "HighQuality"
  $g.DrawImage($img, 0, 0, $ancho, $alto)
  $bmp.Save($salida, $codec, $params)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()

  $kb = [Math]::Round((Get-Item $salida).Length / 1KB)
  Write-Output ("  " + $archivo.Name + " -> " + $ancho + "x" + $alto + " · " + $kb + " KB")
}

$peso = (Get-ChildItem $destino -Filter *.jpg | Measure-Object -Property Length -Sum).Sum
Write-Output ("Listo. Carpeta -web: {0:N1} MB" -f ($peso / 1MB))
