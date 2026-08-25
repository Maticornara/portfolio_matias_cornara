# =============================================================================
# OPTIMIZAR-PORTADA-SIMBIO.PS1
# Arma la miniatura de Simbio para la ficha del home.
#
# QUE HACE
#   Toma el render REAL.png (1920x1080, fondo transparente, la pieza corrida a
#   la derecha) y le recorta una ventana 4:3 CENTRADA EN LA PIEZA, no en la
#   imagen. Despues la achica a 1200x900 y la guarda como home-simbio.png.
#
# POR QUE 4:3 Y NO EL 16:9 ORIGINAL
#   La ficha del home mide 4:3 en las cuatro tarjetas. Con object-fit: cover
#   el navegador recortaria el 16:9 solo, pero lo haria por el centro de la
#   IMAGEN y la pieza esta corrida a la derecha: se comia media pieza. Este
#   script recorta antes, midiendo donde esta el dibujo de verdad.
#
# EL FONDO SIGUE SIENDO TRANSPARENTE a proposito: en la ficha, abajo esta el
#   crema del sitio. Es lo mismo que hace la imagen de Amigos Tipines.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-portada-simbio.ps1
#
#   -Ancho  ancho final en px (1200 por defecto; el alto sale de 4:3)
# =============================================================================

param(
  [string]$Origen  = "assets\simbio\foto\REAL.png",
  [string]$Destino = "assets\simbio\foto\home-simbio.png",
  [int]$Ancho      = 1200,
  [int]$Umbral     = 8
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$raiz  = Split-Path -Parent $PSScriptRoot
$ruta  = Join-Path $raiz $Origen
$salida= Join-Path $raiz $Destino

$img  = [System.Drawing.Bitmap]::FromFile($ruta)
$rect = New-Object System.Drawing.Rectangle(0,0,$img.Width,$img.Height)
$datos= $img.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes= New-Object byte[] ($datos.Stride * $img.Height)
[System.Runtime.InteropServices.Marshal]::Copy($datos.Scan0,$bytes,0,$bytes.Length)
$img.UnlockBits($datos)

# --- donde empieza y termina el dibujo (el resto es aire transparente) -------
$x0=$img.Width; $y0=$img.Height; $x1=-1; $y1=-1
for($y=0; $y -lt $img.Height; $y++){
  $fila = $y * $datos.Stride
  for($x=0; $x -lt $img.Width; $x++){
    if($bytes[$fila + $x*4 + 3] -gt $Umbral){
      if($x -lt $x0){$x0=$x}; if($x -gt $x1){$x1=$x}
      if($y -lt $y0){$y0=$y}; if($y -gt $y1){$y1=$y}
    }
  }
}
if($x1 -lt 0){ throw "La imagen esta entera transparente." }

# --- la ventana 4:3 mas grande que entra, centrada en la pieza ---------------
$altoV  = $img.Height
$anchoV = [int]([math]::Round($altoV * 4 / 3))
if($anchoV -gt $img.Width){ $anchoV = $img.Width; $altoV = [int]([math]::Round($anchoV * 3 / 4)) }

$cx = [int](($x0 + $x1) / 2)
$cy = [int](($y0 + $y1) / 2)
$vx = [math]::Max(0, [math]::Min($img.Width  - $anchoV, $cx - [int]($anchoV/2)))
$vy = [math]::Max(0, [math]::Min($img.Height - $altoV,  $cy - [int]($altoV/2)))

$altoFinal = [int]([math]::Round($Ancho * 3 / 4))
$destinoBmp = New-Object System.Drawing.Bitmap($Ancho, $altoFinal, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($destinoBmp)
$g.CompositingMode    = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$origenRect  = New-Object System.Drawing.Rectangle($vx, $vy, $anchoV, $altoV)
$destinoRect = New-Object System.Drawing.Rectangle(0, 0, $Ancho, $altoFinal)
$g.DrawImage($img, $destinoRect, $origenRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$destinoBmp.Save($salida, [System.Drawing.Imaging.ImageFormat]::Png)
$destinoBmp.Dispose(); $img.Dispose()

$kb = [int]((Get-Item $salida).Length / 1KB)
Write-Host "OK  ventana $anchoV x $altoV desde ($vx,$vy)  ->  $Ancho x $altoFinal  ($kb KB)"
Write-Host "    $Destino"
