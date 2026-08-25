# =============================================================================
# OPTIMIZAR-ESTATICAS-MUSEO.PS1
# Las imagenes fijas de Mobiliario de Museo: portadas, mockups, detalles,
# planos y fotos de contexto. Los frames de animacion los hace el otro
# script (optimizar-frames-museo.ps1).
#
# POR QUE HACE FALTA
#   Los originales estan en carpetas con espacios y acentos, con nombres
#   inconsistentes (uno tiene una llave rota: "PANALES DETALLA}ES.png", otro
#   dice "COMUNIACION" sin la C) y algunos pesan 5 MB. Este script los deja
#   con nombre limpio en assets/mobiliario-museo/ y en tamano de web.
#
# LA REGLA DE LOS DOS FORMATOS
#   PNG  -> todo lo que tiene transparencia y tiene que flotar sobre la
#           pagina: portadas, detalles, planos. Sin fondo horneado, asi
#           sirven igual sobre crema que sobre negro.
#   JPG  -> lo que ya es opaco de origen: las fotos y los mockups. Meterlos
#           en PNG solo los haria pesar el triple sin ganar nada.
#
# NO TOCA LOS ORIGINALES. Se puede volver a correr: saltea lo ya hecho.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-estaticas-museo.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$CalidadJpg = 88

$Raiz    = Split-Path -Parent $PSScriptRoot
$Origen  = Join-Path $Raiz "assets\mobiliario museo"
$Destino = Join-Path $Raiz "assets\mobiliario-museo"

# Los nombres de origen se buscan con comodin y NO se escriben a mano:
# hay acentos y una llave que rompen el parseo del script.
$ctx = (Get-ChildItem -LiteralPath $Origen -Directory | Where-Object { $_.Name -like "CONTEXTO*" }).FullName

$Piezas = @(
  # --- Portadas: transparentes, encabezan cada sistema y van al carrusel ---
  @{ dir="$Origen\DESCANSO\PORTADA";     buscar="PORTADA_*.png";      salida="portada-descanso.png";      ancho=1400 }
  @{ dir="$Origen\EXPOSICION\PORTADA";   buscar="PORTADA_*.png";      salida="portada-exposicion.png";    ancho=1200 }
  @{ dir="$Origen\COMUNICACION\PORTADA"; buscar="PORTADA_*.png";      salida="portada-comunicacion.png";  ancho=1800 }

  # --- Detalles en circulo: renders transparentes ---
  # El de Descanso es el UNICO opaco de todos (fondo gris con alfa parcial).
  # Sale como JPG sobre blanco, que es el mismo fondo que el circulo y que la
  # animacion, asi que no se nota que no flota como los otros.
  @{ dir="$Origen\DESCANSO\DETALLES";    buscar="DESCANSO DESACTIVADO*"; salida="detalle-descanso-perilla.jpg"; ancho=1200 }
  @{ dir="$Origen\EXPOSICION\DETALLES";   buscar="APERTURA CAJONES*"; salida="detalle-expo-abanico.png";        ancho=1200 }
  @{ dir="$Origen\EXPOSICION\DETALLES";   buscar="CAJONES.*";         salida="detalle-expo-varilla.png";        ancho=1200 }
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="COMUNICACION ELE*"; salida="detalle-comunicacion-ele.png";    ancho=1200 }
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="*PIEZA ROSCA*";     salida="detalle-comunicacion-rosca.png";  ancho=1200 }

  # --- Planos de linea: van a la pantalla de investigacion, no al circulo ---
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="detalle panel*";     salida="plano-panel.png";     ancho=1423 }
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="detalle tomate*";    salida="plano-tomate.png";    ancho=1423 }
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="explotada_modulos*"; salida="plano-explotada.png"; ancho=1423 }

  # El panel que YA trae dibujados los dos circulos rojos de llamada.
  # Es la imagen sobre la que va la flecha del "sistema de riel".
  @{ dir="$Origen\COMUNICACION\DETALLES"; buscar="PANALES DETALLA*";   salida="panel-riel.png";      ancho=1026 }

  # --- Contexto e investigacion ---
  # POSTURAS: 5823x3417 de origen (segunda entrega, 24/08). Sale a 2200 para
  # que en pantalla retina se vea al doble de su tamano de CSS (1100px).
  # Va en JPG y no en PNG porque es 85% foto opaca: en PNG pesaba 1,7 MB.
  # El 15% transparente son los huecos entre las tres fotos, y se componen
  # contra el crema-2, que es el fondo de SU seccion. Si esa seccion cambia
  # de zona, este color cambia con ella.
  @{ dir=$ctx; buscar="POSTURAS*";      salida="posturas.jpg";      ancho=2200; fondo="#EAE1CF" }
  @{ dir=$ctx; buscar="MUSEO_FACHADA*"; salida="museo-fachada.jpg";  ancho=1600 }
  @{ dir=$ctx; buscar="MUSEO_ADENTRO*"; salida="museo-adentro.jpg";  ancho=1600 }
  # Ancha a proposito (3646 de origen): es la que panea en loop en el cierre.
  @{ dir=$ctx; buscar="PARTES_FINAL*";  salida="partes-final.jpg";   ancho=2800 }

  # --- La ficha del home ---------------------------------------------------
  # La ficha del indice es 4:3 y su imagen va con object-fit: cover, asi que
  # una panoramica de 2.14 como la portada de Comunicacion perderia los
  # paneles de los costados. Por eso NO se manda la portada tal cual: se la
  # compone entera sobre un lienzo 4:3 en crema. Asi el cover no recorta nada,
  # porque el archivo YA viene con la proporcion de la ficha.
  #
  # saturacion 1.25: "un poco mas", pedido de Mati. 1 = sin tocar.
  @{ dir="$Origen\COMUNICACION\PORTADA"; buscar="PORTADA_*.png"; salida="home-museo.jpg";
     lienzo=@(1600,1200); saturacion=1.25; fondo="#F3EDE1"; ancho=1600 }

  # --- Mockups: fotomontajes opacos ---
  @{ dir="$Origen\MOCKUPS"; buscar="COMUNIACION*";            salida="mockup-comunicacion.jpg";           ancho=1600 }
  @{ dir="$Origen\MOCKUPS"; buscar="DESCANSO + COMUNICACION*"; salida="mockup-descanso-comunicacion.jpg"; ancho=1600 }
  @{ dir="$Origen\MOCKUPS"; buscar="EXPOSICION*";             salida="mockup-exposicion.jpg";             ancho=1600 }
)

Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                     [System.Drawing.Imaging.Encoder]::Quality, [long]$CalidadJpg)

if (-not (Test-Path $Destino)) { New-Item -ItemType Directory -Path $Destino -Force | Out-Null }

foreach ($p in $Piezas) {
  $salida = Join-Path $Destino $p.salida
  if (Test-Path $salida) { Write-Output ("  ya estaba: " + $p.salida); continue }

  $f = Get-ChildItem -LiteralPath $p.dir -Filter $p.buscar -EA SilentlyContinue | Select-Object -First 1
  if (-not $f) { Write-Output ("  NO ENCONTRE: " + $p.buscar + "  en " + $p.dir); continue }

  $img = [System.Drawing.Image]::FromFile($f.FullName)
  # Nunca agrandar: si el original ya es mas chico que el ancho pedido, se deja.
  $ancho = [math]::Min($p.ancho, $img.Width)

  # Si un PNG no necesita reescalado, se COPIA en vez de recodificarse.
  # El codificador PNG de .NET no optimiza nada: recomprimir sin achicar
  # deja el archivo MAS pesado que el original (medido: +15% de media).
  if ((-not $p.salida.EndsWith(".jpg")) -and ($ancho -eq $img.Width) -and (-not $p.ContainsKey("lienzo")) -and (-not $p.ContainsKey("saturacion"))) {
    $w = $img.Width; $h = $img.Height   # se leen ANTES de liberar la imagen
    $img.Dispose()
    Copy-Item -LiteralPath $f.FullName -Destination $salida
    $kb = [int]((Get-Item $salida).Length/1KB)
    Write-Output ("  {0,-36} {1,4}x{2,-4}  copiado tal cual, {3} KB" -f $p.salida, $w, $h, $kb)
    continue
  }
  $alto  = [int][math]::Round($img.Height * ($ancho / $img.Width))

  # LIENZO FIJO: la pieza sale con la proporcion que pide quien la consume,
  # no con la suya. Tiene que ir DESPUES de calcular $alto, porque lo pisa.
  if ($p.ContainsKey("lienzo") -and $p.lienzo) {
    $ancho = $p.lienzo[0]
    $alto  = $p.lienzo[1]
  }

  $esJpg = $p.salida.EndsWith(".jpg")
  if ($esJpg) {
    $bmp = New-Object System.Drawing.Bitmap($ancho, $alto)
  } else {
    $bmp = New-Object System.Drawing.Bitmap($ancho, $alto, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  }
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  if ($esJpg) {
    # Fondo propio si la pieza lo pide; si no, blanco.
    $colorFondo = if ($p.ContainsKey("fondo")) { [System.Drawing.ColorTranslator]::FromHtml($p.fondo) }
                  else { [System.Drawing.Color]::White }
    $g.Clear($colorFondo)
  } else {
    $g.Clear([System.Drawing.Color]::Transparent)
  }
  $g.InterpolationMode = "HighQualityBicubic"
  $g.PixelOffsetMode = "HighQuality"

  # Saturacion, si la pieza la pide. Se aplica con una matriz de color de
  # GDI+: mezcla cada canal con la luminancia del pixel. Con s = 1 la matriz
  # es la identidad y no cambia nada.
  $atributos = $null
  if ($p.ContainsKey("saturacion") -and $p.saturacion -ne 1) {
    $sat = [double]$p.saturacion
    # Pesos de luminancia percibida. No son iguales entre si porque el ojo
    # ve el verde mucho mas que el azul.
    $lr = 0.3086; $lg = 0.6094; $lb = 0.0820
    # Se arma por propiedades con nombre y no pasando el array al
    # constructor: PowerShell desarma un array escalonado en argumentos
    # sueltos y ColorMatrix no tiene una sobrecarga de 5.
    $matriz = New-Object System.Drawing.Imaging.ColorMatrix
    $matriz.Matrix00 = $lr * (1 - $sat) + $sat
    $matriz.Matrix01 = $lr * (1 - $sat)
    $matriz.Matrix02 = $lr * (1 - $sat)
    $matriz.Matrix10 = $lg * (1 - $sat)
    $matriz.Matrix11 = $lg * (1 - $sat) + $sat
    $matriz.Matrix12 = $lg * (1 - $sat)
    $matriz.Matrix20 = $lb * (1 - $sat)
    $matriz.Matrix21 = $lb * (1 - $sat)
    $matriz.Matrix22 = $lb * (1 - $sat) + $sat
    $matriz.Matrix33 = 1
    $matriz.Matrix44 = 1
    $atributos = New-Object System.Drawing.Imaging.ImageAttributes
    $atributos.SetColorMatrix($matriz)
  }

  if ($p.ContainsKey("lienzo") -and $p.lienzo) {
    # LIENZO FIJO: la pieza entra ENTERA y centrada, con el sobrante del
    # color de fondo. Sirve para que un archivo de proporcion cualquiera
    # salga con la proporcion exacta que necesita quien lo consume.
    $esc = [math]::Min($ancho / $img.Width, $alto / $img.Height)
    $w = [int]($img.Width * $esc); $h = [int]($img.Height * $esc)
    $x = [int](($ancho - $w) / 2); $y = [int](($alto - $h) / 2)
    $destino = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
  } else {
    $destino = New-Object System.Drawing.Rectangle(0, 0, $ancho, $alto)
  }

  if ($atributos) {
    $g.DrawImage($img, $destino, 0, 0, $img.Width, $img.Height,
                 [System.Drawing.GraphicsUnit]::Pixel, $atributos)
  } else {
    $g.DrawImage($img, $destino)
  }

  if ($esJpg) { $bmp.Save($salida, $codec, $params) }
  else        { $bmp.Save($salida, [System.Drawing.Imaging.ImageFormat]::Png) }

  $kbAntes = [int]($f.Length/1KB)
  $kbAhora = [int]((Get-Item $salida).Length/1KB)
  Write-Output ("  {0,-36} {1,4}x{2,-4}  {3,5} KB -> {4,4} KB" -f $p.salida, $ancho, $alto, $kbAntes, $kbAhora)

  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
}

Write-Output ""
Write-Output "Listo."
