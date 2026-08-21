# =============================================================================
# RECORTAR-TRANSPARENCIA.PS1
# Recorta el margen transparente que rodea a un PNG y guarda una copia.
#
# PARA QUE SIRVE
#   Los renders de Blender salen a 1920x1080 con la pieza chiquita en el medio
#   y todo lo demas transparente. En la web eso se paga dos veces:
#     - la imagen "mide" 1920 de ancho pero de eso solo la mitad se ve, asi que
#       para agrandar la pieza hay que agrandar el aire vacio tambien y termina
#       saliendose de la pantalla;
#     - se descarga peso de pixeles que no muestran nada.
#   Recortada, el archivo empieza y termina donde empieza y termina el dibujo:
#   el ancho que se le da en el CSS es el ancho REAL de lo que se ve.
#
# NO TOCA EL ORIGINAL. Guarda al lado una copia con sufijo "-recorte".
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\recortar-transparencia.ps1 `
#              -Archivo assets\simbio\foto\REAL3.png
#
#   -Umbral  (0-255) que tan transparente cuenta como "vacio". 8 por defecto:
#            asi las sombras muy suaves del Shadow Catcher no se pierden.
#   -Margen  pixeles de aire que deja alrededor del dibujo. 0 por defecto.
# =============================================================================

param(
  [Parameter(Mandatory=$true)][string]$Archivo,
  [int]$Umbral = 8,
  [int]$Margen = 0
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$ruta = (Resolve-Path $Archivo).Path
$img  = [System.Drawing.Bitmap]::FromFile($ruta)

# LockBits y no GetPixel: GetPixel serian 2 millones de llamadas por imagen y
# el script tardaria minutos. Asi se copia el mapa de bits de una sola vez.
$rect = New-Object System.Drawing.Rectangle(0, 0, $img.Width, $img.Height)
$datos = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
                       [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$largo = [Math]::Abs($datos.Stride) * $img.Height
$bytes = New-Object byte[] $largo
[System.Runtime.InteropServices.Marshal]::Copy($datos.Scan0, $bytes, 0, $largo)
$img.UnlockBits($datos)

# El formato es BGRA: el alfa es el CUARTO byte de cada pixel.
$x1 = $img.Width; $y1 = $img.Height; $x2 = -1; $y2 = -1
for ($y = 0; $y -lt $img.Height; $y++) {
  $fila = $y * $datos.Stride
  for ($x = 0; $x -lt $img.Width; $x++) {
    if ($bytes[$fila + $x * 4 + 3] -gt $Umbral) {
      if ($x -lt $x1) { $x1 = $x }
      if ($x -gt $x2) { $x2 = $x }
      if ($y -lt $y1) { $y1 = $y }
      if ($y -gt $y2) { $y2 = $y }
    }
  }
}

if ($x2 -lt 0) {
  Write-Output "La imagen es transparente entera, no hay nada que recortar."
  $img.Dispose(); exit
}

$x1 = [Math]::Max(0, $x1 - $Margen)
$y1 = [Math]::Max(0, $y1 - $Margen)
$x2 = [Math]::Min($img.Width  - 1, $x2 + $Margen)
$y2 = [Math]::Min($img.Height - 1, $y2 + $Margen)
$ancho = $x2 - $x1 + 1
$alto  = $y2 - $y1 + 1

Write-Output ("original : " + $img.Width + "x" + $img.Height)
Write-Output ("dibujo   : x " + $x1 + "-" + $x2 + " · y " + $y1 + "-" + $y2)
Write-Output ("recorte  : " + $ancho + "x" + $alto)

$corte = New-Object System.Drawing.Bitmap($ancho, $alto,
                    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($corte)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $ancho, $alto)),
             (New-Object System.Drawing.Rectangle($x1, $y1, $ancho, $alto)),
             [System.Drawing.GraphicsUnit]::Pixel)

$salida = Join-Path (Split-Path $ruta) `
          ([IO.Path]::GetFileNameWithoutExtension($ruta) + "-recorte.png")
$corte.Save($salida, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose(); $corte.Dispose(); $img.Dispose()
Write-Output ("guardado : " + $salida)
