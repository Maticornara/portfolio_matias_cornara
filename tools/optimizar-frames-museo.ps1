# =============================================================================
# OPTIMIZAR-FRAMES-MUSEO.PS1
# Convierte los PNG de Blender de Mobiliario de Museo a frames web.
#
# HERMANO DE optimizar-frames.ps1, separado a proposito: aquel es de Simbio
# y filtra por nombre numerico puro (0000.png). Los de Museo vienen con
# prefijo (ASIENTO_00000.png), en tres carpetas distintas y con dos
# proporciones distintas, asi que no entraban en la misma tabla.
#
# POR QUE HACE FALTA
#   Los originales son 1007 PNG a 1920: 654 MB en disco y casi 9 GB de RAM
#   al descomprimir. Es el mismo muro que Simbio. Convertidos quedan en
#   ~70 MB repartidos en tres secuencias que cargan por separado.
#
# QUE HACE CON CADA SECUENCIA
#   - La achica al tamano de la tabla de abajo, respetando la proporcion
#   - Aplasta el fondo contra NEGRO, no contra el crema
#   - Renumera: ASIENTO_00042.png -> 0042.jpg (sin prefijo, 4 digitos)
#   - Guarda JPG de calidad 93 en assets/mobiliario-museo/
#
# POR QUE NEGRO Y NO CREMA (al reves que Simbio)
#   Los renders de Museo NO vienen sobre transparencia como los de Simbio.
#   Descanso y Comunicacion vienen con negro puro horneado y Exposicion con
#   alfa. Aplastar contra crema dejaria un rectangulo negro flotando sobre
#   la pagina. Van sobre negro, y las secciones de animacion son negras.
#   OJO: el negro de aca es #000000, NO el --negro (#0B0B0B) del sitio.
#   Tiene que coincidir con el que ya viene horneado en los renders.
#
# LOS DOS FRAMES QUE FALTAN
#   La secuencia de Exposicion no tiene los archivos 00264 y 00265. Es un
#   agujero conocido del render original. Al final se duplica el 0263 en su
#   lugar para que la numeracion quede sin baches: si faltara un archivo, el
#   precargador lo contaria como error de carga.
#
# NO TOCA LOS ORIGINALES. Se puede cortar y volver a correr: saltea lo hecho.
# Para forzar la reconversion, borrar la carpeta de destino.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-frames-museo.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$Calidad    = 93          # Simbio usa 91. Aca un poco mas alto a pedido de Mati.
$ColorFondo = "#000000"   # El negro horneado en los renders. Ver nota de arriba.

$Raiz    = Split-Path -Parent $PSScriptRoot
$Origen  = Join-Path $Raiz "assets\mobiliario museo"
$Destino = Join-Path $Raiz "assets\mobiliario-museo"

# --- LAS SECUENCIAS -----------------------------------------------------
# Ancho/Alto respetan la proporcion de cada render: Descanso y Comunicacion
# son 1920x1080 (16:9), Exposicion es 1920x1282 (mas alto, casi 3:2).
$Secuencias = @(
  @{ Nombre="descanso";     Carpeta="DESCANSO\FRAMES_DESCANSO_WEB";         Prefijo="ASIENTO_";      Ancho=1600; Alto=900  }
  @{ Nombre="exposicion";   Carpeta="EXPOSICION\FRAMES_EXPO_WEB";           Prefijo="EXPO_";         Ancho=1600; Alto=1068 }
  @{ Nombre="comunicacion"; Carpeta="COMUNICACION\FRAMES_COMUNICACION_WEB"; Prefijo="COMUNICACION_"; Ancho=1600; Alto=900  }
)

Add-Type -AssemblyName System.Drawing
$fondo = [System.Drawing.ColorTranslator]::FromHtml($ColorFondo)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                     [System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

foreach ($sec in $Secuencias) {
  $carpetaOrigen  = Join-Path $Origen $sec.Carpeta
  $carpetaDestino = Join-Path $Destino ("frames-" + $sec.Nombre)

  if (-not (Test-Path $carpetaOrigen)) {
    Write-Output ("[" + $sec.Nombre + "] no existe la carpeta, la salteo.")
    continue
  }
  if (-not (Test-Path $carpetaDestino)) {
    New-Item -ItemType Directory -Path $carpetaDestino -Force | Out-Null
  }

  $archivos = Get-ChildItem $carpetaOrigen -Filter *.png | Sort-Object Name
  Write-Output ("[" + $sec.Nombre + "] " + $archivos.Count + " frames -> " + $sec.Ancho + "x" + $sec.Alto)

  $hechos = 0
  foreach ($archivo in $archivos) {
    # ASIENTO_00042 -> 0042. Si el nombre no termina en numero, lo salteo.
    $num = $archivo.BaseName -replace [regex]::Escape($sec.Prefijo), ""
    if ($num -notmatch '^\d+$') { continue }
    $salida = Join-Path $carpetaDestino ((([int]$num).ToString("0000")) + ".jpg")
    if (Test-Path $salida) { continue }

    $img = [System.Drawing.Image]::FromFile($archivo.FullName)
    $bmp = New-Object System.Drawing.Bitmap($sec.Ancho, $sec.Alto)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear($fondo)
    $g.InterpolationMode = "HighQualityBicubic"
    $g.PixelOffsetMode = "HighQuality"
    $g.DrawImage($img, 0, 0, $sec.Ancho, $sec.Alto)
    $bmp.Save($salida, $codec, $params)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    $hechos++
  }

  # El bache de Exposicion: 0264 y 0265 no existen en el render original.
  if ($sec.Nombre -eq "exposicion") {
    $modelo = Join-Path $carpetaDestino "0263.jpg"
    foreach ($faltante in @("0264.jpg", "0265.jpg")) {
      $destinoFaltante = Join-Path $carpetaDestino $faltante
      if ((Test-Path $modelo) -and (-not (Test-Path $destinoFaltante))) {
        Copy-Item $modelo $destinoFaltante
        Write-Output ("           tapado el bache: " + $faltante + " (copia de 0263)")
      }
    }
  }

  $jpgs = Get-ChildItem $carpetaDestino -Filter *.jpg
  $peso = ($jpgs | Measure-Object -Property Length -Sum).Sum
  Write-Output ("           convertidos ahora: " + $hechos + " · total en carpeta: " + $jpgs.Count + " · peso: {0:N1} MB" -f ($peso / 1MB))
}

Write-Output ""
Write-Output "Listo."
