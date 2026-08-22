<#
================================================================================
 OPTIMIZAR-TIPINES.PS1 — versiones web de los assets de Amigos Tipines
================================================================================

 POR QUE EXISTE
 La carpeta "assets\amigos tipines" pesa ~480 MB en originales, y no es que
 sean muchos archivos: son DOS.

   VIDEO_FINAL_TIPINES.mp4   311 MB   2:40 · 1080p · 15,5 Mbps
   imagenes\HERO3.mov        139 MB   0:08 · 1080p · codec DXV

 El .mov es el caso grave y conviene entenderlo antes de tocar nada: DXV es el
 codec de Resolume, pensado para descomprimirse en la placa de video de una VJ.
 NINGUN navegador lo reproduce. No es que pese mucho: es que puesto en un
 <video> no se ve nada, ni en Chrome ni en Safari. Tiene que pasar por aca si o
 si. Ocho segundos de video ocupando 139 MB son 16 MB por segundo.

 Las 17 paginas del libro son otro tema: pesan 22 MB en PNG y el librito las va
 cargando a medida que se hojea. En JPEG el mismo material baja a ~3 MB.
 Se convierten A SU TAMANO ORIGINAL (1190x842 los pliegos, 595x842 tapa y
 contratapa): son A4 a 72 dpi, no hay resolucion de mas para tirar.

 El HTML SIEMPRE apunta a "assets/amigos tipines/web/". Los originales no se
 tocan nunca: quedan como archivo maestro.

 COMO SE CORRE
   powershell -ExecutionPolicy Bypass -File tools\optimizar-tipines.ps1

 Es idempotente: si la salida ya existe y es mas nueva que la entrada, saltea.
 Para rehacer todo:
   powershell -ExecutionPolicy Bypass -File tools\optimizar-tipines.ps1 -Forzar

 REQUISITO: ffmpeg en el PATH (el mismo que usan los otros scripts de tools\).

 QUE GENERA
   web\hero-1.jpg            hero — los tres personajes
   web\hero-2.jpg            hero — el libro impreso
   web\hero-3.mp4 / .jpg     hero — el plano de la cascada, mudo y en loop
   web\senal.mp4 / .jpg      la carta de ajuste de TippinesTV, 4 s en loop
   web\serie.mp4 / .jpg      la miniserie completa, CON audio
   web\tele.png              el marco de la tele — PNG, tiene alfa
   web\juego.jpg             la captura del mini-juego
   web\sprite-*.png          las tres hojas de sprites — PNG, tienen alfa
   web\juguetes.png         las 3 figuras pintadas — PNG, tiene alfa
   web\stl.png              los 3 modelos en gris — PNG, tiene alfa
   web\libro\tapa.jpg        A4
   web\libro\01..15.jpg      los 15 pliegos A3 (dos A4 unidas por el lomo)
   web\libro\contratapa.jpg  A4

 POR QUE ALGUNAS SALEN EN PNG Y NO EN JPEG
 tele.png y los sprites tienen FONDO TRANSPARENTE, y eso es justamente para lo
 que sirven: el video se ve por el agujero de la pantalla de la tele, y los
 sprites se apoyan sobre el fondo de la seccion. JPEG no tiene canal alfa: al
 convertirlos, el agujero se rellena de blanco y la tele deja de ser una tele.
================================================================================
#>

param(
  [switch]$Forzar
)

$ErrorActionPreference = "Stop"

$raiz    = Split-Path -Parent $PSScriptRoot
$origen  = Join-Path $raiz "assets\amigos tipines"
$destino = Join-Path $origen "web"
$libro   = Join-Path $destino "libro"

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
New-Item -ItemType Directory -Force -Path $libro   | Out-Null

# Saltea si la salida ya existe y es mas nueva que la entrada.
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
#   crf        calidad. Mas alto = mas chico y mas sucio. 30 para los loops
#              mudos, 31 para la miniserie (que dura 2:40 y es el archivo mas
#              pesado de la pagina por lejos).
#   faststart  manda el indice al principio, asi el navegador puede empezar a
#              reproducir sin bajar el archivo entero. En un video de 2:40 esto
#              es la diferencia entre que arranque al toque o al minuto.
#   yuv420p    el unico pix_fmt que reproducen todos los navegadores. El .mov
#              viene en DXV, que ademas es 4:4:4 — sin esto, Chrome muestra
#              negro.
#   -2         en la altura: la deja par, que es lo que exige h264.
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

  $opciones = @(
    "-y", "-v", "error", "-stats",
    "-i", $entrada,
    "-vf", "scale=min($anchoMax\,iw):-2",
    "-c:v", "libx264", "-crf", "$crf", "-preset", "medium",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart"
  )
  if ($conAudio) { $opciones += @("-c:a", "aac", "-b:a", "96k") } else { $opciones += "-an" }
  $opciones += $salida

  & ffmpeg @opciones
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# VIDEO PENSADO PARA LOOPEAR
# Igual que ConvertirVideo pero mudo y con los keyframes forzados cada segundo
# ($fps cuadros). Un loop de <video> vuelve al cuadro 0 de golpe; si el keyframe
# mas cercano quedo lejos, el decodificador tiene que reconstruir desde ahi y se
# ve un enganche en CADA vuelta. Con un keyframe por segundo el salto es
# instantaneo. Cuesta un poco de peso y lo vale.
# ------------------------------------------------------------------------------
function ConvertirVideoLoop($entrada, $salida, $anchoMax, $crf, $fps) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  & ffmpeg -y -v error -stats -i $entrada `
    -vf "scale='min($anchoMax,iw)':-2,fps=$fps" `
    -c:v libx264 -crf $crf -preset medium -pix_fmt yuv420p `
    -g $fps -keyint_min $fps -sc_threshold 0 `
    -movflags +faststart -an $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# VIDEO CON CUADROS INTERMEDIOS INVENTADOS
# ------------------------------------------------------------------------------
# ESTA ES LA FUNCION RARA DEL ARCHIVO Y CONVIENE ENTENDER POR QUE EXISTE.
#
# El plano de la cascada se veia a los tirones en la pagina y NO era un problema
# de peso ni de decodificacion: medido con getVideoPlaybackQuality() del propio
# navegador, se perdian CERO cuadros. El problema esta en el material.
#
# MEDIDO SOBRE EL ORIGINAL: 212 cuadros, de los cuales solo 147 son distintos
# del anterior. O sea que 65 cuadros (el 31%) son copias del de al lado: el clip
# es material de ~17 fps reales metido en un contenedor de 25. Es lo que sale de
# generar video con IA y despues subirlo de frame rate duplicando cuadros. Se ve
# como un tironeo irregular, y ninguna opcion de compresion lo arregla, porque
# los cuadros que faltan no existen en ningun lado.
#
# QUE HACE ESTA FUNCION, en dos pasos:
#   mpdecimate      tira los cuadros repetidos y deja los 147 que son distintos.
#   minterpolate    INVENTA los cuadros del medio, calculando hacia donde se
#                   movio cada parte de la imagen entre un cuadro y el
#                   siguiente. Sale a 30 fps parejos.
#
# EL RESULTADO, medido igual que la entrada: 243 cuadros, de los cuales 202 son
# distintos. Se paso de 31% de repetidos a 17%, y sobre todo el reparto quedo
# PAREJO, que es lo que el ojo lee como movimiento continuo.
#
# CUANDO NO USARLA: minterpolate deforma la imagen si el movimiento es muy
# rapido o si hay cosas que aparecen y desaparecen (un corte de plano, humo,
# agua salpicando). En este clip se revisaron cuadros inventados en tres
# momentos distintos y estan limpios, pero es material de plastilina con bordes
# duros y movimiento simple. Para otro video hay que MIRARLO antes de dar por
# bueno el resultado.
#
# La duracion baja de 8,48 s a 8,10 s porque mpdecimate se come los repetidos
# del final. En un loop decorativo no se nota; si alguna vez importa, hay que
# agregar un -t con la duracion exacta.
#
# Es LENTO: unos minutos para 8 segundos. Por eso el script es idempotente.
# ------------------------------------------------------------------------------
function ConvertirVideoInterpolado($entrada, $salida, $anchoMax, $crf, $fps) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
    # OJO: NADA DE RAYAS LARGAS NI COMILLAS TIPOGRAFICAS ADENTRO DE UN STRING
  # DE POWERSHELL. Este archivo es UTF-8 SIN BOM y PowerShell 5.1 lo lee como
  # cp1252: los tres bytes de una raya larga se decodifican como 'a', 'EUR' y
  # una COMILLA TIPOGRAFICA de cierre, y PowerShell acepta esa comilla como
  # delimitador de string. Resultado: el string queda abierto, se come la llave
  # de cierre de la funcion y el script no parsea. En los comentarios (#) no
  # pasa nada; adentro de comillas, si.
  Write-Host "  interpolando $(Split-Path -Leaf $entrada) - esto tarda unos minutos..." -ForegroundColor DarkGray
  & ffmpeg -y -v error -stats -i $entrada `
    -vf "scale='min($anchoMax,iw)':-2,mpdecimate,minterpolate=fps=$($fps):mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" `
    -c:v libx264 -crf $crf -preset medium -pix_fmt yuv420p `
    -g $fps -keyint_min $fps -sc_threshold 0 `
    -movflags +faststart -an $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# LA SEÑAL: un recorte corto, saturado, mudo y en loop.
# $segundos = cuanto dura el recorte, contado desde el principio.
# ------------------------------------------------------------------------------
function ConvertirSenal($entrada, $salida, $anchoMax, $crf, $segundos) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  & ffmpeg -y -v error -stats -i $entrada -t $segundos `
    -vf "scale='min($anchoMax,iw)':-2,eq=saturation=1.30" `
    -c:v libx264 -crf $crf -preset medium -pix_fmt yuv420p `
    -g 24 -keyint_min 24 -sc_threshold 0 `
    -movflags +faststart -an $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# POSTER DEL VIDEO
# El cuadro que se ve mientras el video no se cargo (atributo poster). Con
# preload="none" el navegador no baja un solo byte del video hasta que hace
# falta, pero el lugar no queda en blanco.
# $segundo: de que momento sacarlo. Si el video abre en negro, un rectangulo
# negro como vista previa no dice nada — ahi conviene 2 o 3.
# ------------------------------------------------------------------------------
function PosterDeVideo($entrada, $salida, $anchoMax, $segundo = 0) {
  if (-not (Test-Path $entrada)) { return }
  if (-not (HayQueHacerlo $entrada $salida)) { return }
  # -ss ANTES de -i busca el cuadro sin decodificar todo lo anterior.
  & ffmpeg -y -v error -ss $segundo -i $entrada -vf "scale=min($anchoMax\,iw):-2" -frames:v 1 -q:v 4 $salida
  Write-Host "  $(Split-Path -Leaf $salida)  ($(Peso $salida))" -ForegroundColor DarkGreen
}

# ------------------------------------------------------------------------------
# IMAGEN A JPEG. q:v va de 2 (mejor) a 31 (peor).
# Las paginas del libro van en 3: son ilustraciones densisimas, llenas de
# objetos chicos, y son EL material de un "busca personajes". Con q mas alto
# aparecen halos alrededor de cada objeto y se pierde justamente lo que hay
# que buscar.
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
  & ffmpeg -y -v error -i $entrada -vf "scale=min($anchoMax\,iw):-1" -q:v $q $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# IMAGEN QUE CONSERVA EL ALFA. Sale en PNG, no en JPEG.
# El agujero de la pantalla de la tele y el fondo de los sprites son
# transparentes; en JPEG se rellenan de blanco y la pieza deja de funcionar.
# ------------------------------------------------------------------------------
function ConvertirImagenAlfa($entrada, $salida, $anchoMax) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  & ffmpeg -y -v error -i $entrada -vf "scale=min($anchoMax\,iw):-1" -c:v png -pred mixed -compression_level 100 $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}


# ------------------------------------------------------------------------------
# IMAGEN CON ALFA, RECORTADA AL CONTENIDO
# ------------------------------------------------------------------------------
# Igual que ConvertirImagenAlfa pero le saca el margen transparente que rodea al
# dibujo, ANTES de escalar.
#
# POR QUE HACE FALTA. Las dos fotos de los juguetes vienen recortadas contra
# transparencia, pero con MUCHO aire alrededor: en JUGUETES.png las figuras
# ocupan 961x706 de un archivo de 1599x899 — el 40% del ancho es nada. En la
# pagina las dos se turnan adentro de una caja de alto fijo, asi que ese aire se
# come el tamano y las figuras se ven chiquitas en el medio de un rectangulo
# vacio.
#
# Y HAY UN SEGUNDO MOTIVO, que es el que de verdad importa: las dos imagenes se
# ALTERNAN en el mismo lugar. Si cada una trae distinta cantidad de aire, las
# figuras cambian de tamano y de posicion al pasar de una a la otra, y el cambio
# se lee como un salto en vez de como la misma pieza pintandose. Recortadas al
# contenido, las seis figuras quedan a la misma escala.
#
# LOS NUMEROS DEL CROP NO SON A OJO. Se saco el canal alfa de cada archivo y se
# buscó, pixel por pixel, la primera y la ultima fila y columna con algo opaco
# (alfa > 24, para no contar el borde suave del recorte):
#   JUGUETES.png  contenido 961x706 arrancando en (332,138)  de 1599x899
#   STL.png       contenido 527x302 arrancando en  (84,32)   de 673x348
# SI CAMBIAN LOS ARCHIVOS HAY QUE VOLVER A MEDIR: un crop viejo sobre una imagen
# nueva corta figuras por la mitad.
# ------------------------------------------------------------------------------
function ConvertirImagenAlfaRecortada($entrada, $salida, $crop, $anchoMax) {
  if (-not (Test-Path $entrada)) {
    Write-Host "  falta: $(Split-Path -Leaf $entrada)" -ForegroundColor Yellow
    return
  }
  if (-not (HayQueHacerlo $entrada $salida)) {
    Write-Host "  ya esta: $(Split-Path -Leaf $salida) ($(Peso $salida))" -ForegroundColor DarkGray
    return
  }
  & ffmpeg -y -v error -i $entrada -vf "crop=$crop,scale='min($anchoMax,iw)':-1" -c:v png -pred mixed -compression_level 100 $salida
  Write-Host "  $(Split-Path -Leaf $salida)  $(Peso $entrada) -> $(Peso $salida)" -ForegroundColor Green
}


$img = Join-Path $origen "imagenes"
$pag = Join-Path $origen "paginas"

Write-Host ""
Write-Host "VIDEOS" -ForegroundColor Cyan

# EL PLANO DE LA CASCADA. Va en el paneo del hero: mudo, en loop y chico.
#
# SE ACHICO A 960 Y SE LE BAJO A 24 FPS PORQUE SE TRABABA. El primer corte era
# 1280 a 25 fps (926 KB para 8 segundos, casi 900 kbps) y en el hero daba
# tirones. Son dos cosas sumadas: el video arranca a reproducirse apenas entra
# en pantalla, mientras todavia se esta bajando, y ademas comparte cuadro con
# el scroll suave de Lenis, que ya esta pidiendo repintados. En el paneo se ve
# a menos de media pantalla, asi que 960 no le saca nada.
# El -g de ConvertirVideoLoop mete un keyframe cada segundo: sin eso, el salto
# del final al principio del loop tiene que decodificar hasta el keyframe
# anterior y se nota un enganche en cada vuelta.
ConvertirVideoInterpolado (Join-Path $img "HERO3.mov") (Join-Path $destino "hero-3.mp4") 960 30 30
PosterDeVideo             (Join-Path $img "HERO3.mov") (Join-Path $destino "hero-3.jpg") 960 1

# LA SEÑAL DE TIPINESTV — la carta de ajuste de plastilina.
# Mati la pidio "a forma de GIF": autoplay, en loop, muda y sin controles. Sale
# en MP4 y no en .gif de verdad, y la diferencia es enorme: los mismos 4
# segundos en GIF pesan varios MB (paleta de 256 colores, sin compresion entre
# cuadros) y se ven con bandas. Un MP4 mudo en loop hace exactamente lo mismo a
# una fraccion del peso. El comportamiento de gif lo dan los atributos del
# <video>: autoplay + loop + muted + playsinline.
#
#   -t 4                 solo los primeros 4 segundos. El resto no se usa.
#   eq=saturation=1.30   un punto mas de color, pedido.
ConvertirSenal (Join-Path $origen "GIF\PIIIIIIIIIIIP.mp4") (Join-Path $destino "senal.mp4") 1280 28 4
PosterDeVideo  (Join-Path $origen "GIF\PIIIIIIIIIIIP.mp4") (Join-Path $destino "senal.jpg") 1280 1

# LA MINISERIE. Es el archivo mas pesado de la pagina y no hay forma de que no
# lo sea: 2:40 de animacion con movimiento en todo el cuadro. Lo que si se
# puede es que NO SE BAJE HASTA QUE ALGUIEN LE DE PLAY — de eso se ocupan el
# preload="none" del <video> en el HTML y el poster de aca abajo.
# Es el unico video de la pagina que conserva el audio: tiene voces y musica.
ConvertirVideo (Join-Path $origen "VIDEO_FINAL_TIPINES.mp4") (Join-Path $destino "serie.mp4") 1280 31 $true
PosterDeVideo  (Join-Path $origen "VIDEO_FINAL_TIPINES.mp4") (Join-Path $destino "serie.jpg") 1280 3

Write-Host ""
Write-Host "IMAGENES" -ForegroundColor Cyan

ConvertirImagen (Join-Path $img "HERO.png")  (Join-Path $destino "hero-1.jpg") 1400 3
ConvertirImagen (Join-Path $img "HERO2.png") (Join-Path $destino "hero-2.jpg") 1400 3

# LA CAPTURA DEL JUEGO VA EN PNG, Y ESO SE APRENDIO MIRANDO LA PAGINA.
# El archivo es un televisor retro RECORTADO: todo lo que rodea al mueble es
# transparente. Salio primero en JPEG y en la pagina se veia un rectangulo
# negro perfectamente recortado alrededor de la tele, porque JPEG no tiene
# alfa y ffmpeg rellena el hueco con negro PLANO (#000) — y la seccion es
# .zona--negro, que es un DEGRADE (#161614 → #0B0B0B → #020202). Dos negros
# distintos, uno con borde recto: se leia como una imagen mal recortada.
ConvertirImagenAlfa (Join-Path $img "JUEGO.png")                   (Join-Path $destino "juego.png")            1400

# Las cuatro con alfa. Los sprites van a tamano original: ya son chicos y
# cualquier reescalado les come el borde de plastilina, que es todo lo que
# tienen.
ConvertirImagenAlfa (Join-Path $img "TELE.png")                    (Join-Path $destino "tele.png")             1400
ConvertirImagenAlfa (Join-Path $img "JUEGO_SPRITE_PERSONAJES.png") (Join-Path $destino "sprite-personajes.png") 874
ConvertirImagenAlfa (Join-Path $img "JUEGO_SPRITE_JEFE.png")       (Join-Path $destino "sprite-jefe.png")       467
ConvertirImagenAlfa (Join-Path $img "JUEGO_SPRITE_SODAS.png")      (Join-Path $destino "sprite-sodas.png")      339

# LOS JUGUETES. Las dos vienen RECORTADAS (77% y 75% del archivo es
# transparente), asi que van en PNG y se apoyan solas sobre el fondo de la
# seccion. En JPEG una saldria con un rectangulo blanco y la otra con uno
# negro, que es peor todavia que un solo fondo equivocado.
$jug = Join-Path $origen "JUGUETES"
ConvertirImagenAlfaRecortada (Join-Path $jug "JUGUETES.png") (Join-Path $destino "juguetes.png") "961:706:332:138" 1000
ConvertirImagenAlfaRecortada (Join-Path $jug "STL.png")      (Join-Path $destino "stl.png")      "527:302:84:32"    600

Write-Host ""
Write-Host "EL LIBRO" -ForegroundColor Cyan

# TAMANO ORIGINAL (el 9999 no recorta nada: min(9999,iw) devuelve iw).
# Los pliegos son 1190x842 y las tapas 595x842. Es A4 a 72 dpi: no hay
# resolucion de sobra para tirar, y el librito los muestra a menos de la mitad
# de ese ancho.
ConvertirImagen (Join-Path $pag "1_TAPA.png")        (Join-Path $libro "tapa.jpg")        9999 3
ConvertirImagen (Join-Path $pag "17_CONTRATAPA.png") (Join-Path $libro "contratapa.jpg") 9999 3

# Los 15 pliegos: 2.png..16.png en el original, 01.jpg..15.jpg en la salida.
# Se renumeran para que el nombre del archivo sea el NUMERO DE PLIEGO y no el
# del archivo suelto; el JS del librito arma las rutas con ese numero.
for ($i = 2; $i -le 16; $i++) {
  $salida = "{0:D2}.jpg" -f ($i - 1)
  ConvertirImagen (Join-Path $pag "$i.png") (Join-Path $libro $salida) 9999 3
}

Write-Host ""
Write-Host "Listo. Todo en: $destino" -ForegroundColor Cyan
Write-Host ""
