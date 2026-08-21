# =============================================================================
# OPTIMIZAR-FRAMES.PS1
# Convierte los PNG de Blender a versiones livianas para la web.
#
# POR QUE HACE FALTA
#   Los PNG salen a 1920 y con transparencia. La secuencia del ensamble son
#   549 MB y ~2,9 GB de RAM al descomprimir: ningun navegador lo aguanta.
#   Convertidos quedan en ~12 MB.
#
# QUE HACE CON CADA SECUENCIA
#   - La achica al tamano de la tabla de abajo
#   - Aplasta la transparencia contra el color de fondo de la pagina
#   - Guarda JPG de calidad 82 en una carpeta hermana con sufijo "-web"
#   - Ignora los PNG que no tengan nombre numerico (F1.png, F2.png, etc.)
#
# EL COSTO DE APLASTAR EL FONDO
#   Se pierde la transparencia. El render se ve siempre sobre el crema de la
#   pagina, asi que visualmente da igual. PERO el color de aca tiene que ser
#   el MISMO que el fondo de la pagina: si no, se ve el rectangulo de la
#   imagen recortado. Si cambia el fondo, hay que volver a correr esto.
#
# NO TOCA LOS ORIGINALES. Se puede cortar y volver a correr: saltea lo hecho.
# Para forzar la reconversion, borrar la carpeta "-web" correspondiente.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-frames.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$Calidad    = 91
$ColorFondo = "#F3EDE1"   # --crema. Tiene que coincidir con el fondo de la pagina.

$Raiz = Split-Path -Parent $PSScriptRoot

# --- LAS SECUENCIAS -----------------------------------------------------
# Origen y destino son relativos a /assets/simbio/.
# Recurse: solo la del ensamble, que viene repartida en 4 subcarpetas.
# El tamano respeta la proporcion de cada secuencia: la del ensamble y la de
# hongos son 16:9, la de algas es cuadrada.
$Secuencias = @(
  @{ Nombre="ensamble"; Origen="frames";                Destino="frames-web";                Ancho=1600; Alto=900; Recurse=$true  }
  @{ Nombre="hongos";   Origen="muestra-piezas-hongos"; Destino="muestra-piezas-hongos-web"; Ancho=1280; Alto=720; Recurse=$false }
  @{ Nombre="algas";    Origen="muestra-alga";          Destino="muestra-alga-web";          Ancho=1100; Alto=1100; Recurse=$false }
  @{ Nombre="arbol";    Origen="muestra-pieza-arbol";   Destino="muestra-pieza-arbol-web";   Ancho=1280; Alto=720; Recurse=$false }
)

Add-Type -AssemblyName System.Drawing
$fondo = [System.Drawing.ColorTranslator]::FromHtml($ColorFondo)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                     [System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

foreach ($sec in $Secuencias) {
  $origen  = Join-Path $Raiz ("assets\simbio\" + $sec.Origen)
  $destino = Join-Path $Raiz ("assets\simbio\" + $sec.Destino)

  if (-not (Test-Path $origen)) {
    Write-Output ("[" + $sec.Nombre + "] no existe la carpeta, la salteo.")
    continue
  }

  # Solo PNG con nombre numerico: F1.png y compania son planos fijos,
  # no cuadros de la secuencia.
  if ($sec.Recurse) {
    $archivos = Get-ChildItem $origen -Recurse -Filter *.png
  } else {
    $archivos = Get-ChildItem $origen -Filter *.png
  }
  $archivos = $archivos | Where-Object { $_.BaseName -match '^\d+$' } | Sort-Object Name

  if ($archivos.Count -eq 0) {
    Write-Output ("[" + $sec.Nombre + "] carpeta vacia todavia, la salteo.")
    continue
  }

  if (-not (Test-Path $destino)) { New-Item -ItemType Directory -Path $destino | Out-Null }

  $primero = $archivos[0].BaseName
  $ultimo  = $archivos[-1].BaseName
  Write-Output ("[" + $sec.Nombre + "] " + $archivos.Count + " frames (" + $primero + " a " + $ultimo + ") -> " + $sec.Ancho + "x" + $sec.Alto)

  $hechos = 0
  foreach ($archivo in $archivos) {
    $salida = Join-Path $destino ($archivo.BaseName + ".jpg")
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

  $peso = (Get-ChildItem $destino -Filter *.jpg | Measure-Object -Property Length -Sum).Sum
  Write-Output ("           convertidos ahora: " + $hechos + " · peso total: {0:N1} MB" -f ($peso / 1MB))
}

Write-Output ""
Write-Output "Listo."
