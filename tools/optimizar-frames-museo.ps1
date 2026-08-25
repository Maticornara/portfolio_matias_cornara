# =============================================================================
# OPTIMIZAR-FRAMES-MUSEO.PS1
# Convierte los PNG de Blender de Mobiliario de Museo a frames web.
#
# HERMANO DE optimizar-frames.ps1, separado a proposito: aquel es de Simbio
# y filtra por nombre numerico puro (0000.png). Los de Museo vienen con
# prefijo (ASIENTO_00000.png), en tres carpetas distintas, con dos
# proporciones distintas y con dos tipos de fondo distintos.
#
# POR QUE HACE FALTA
#   Los originales son 1007 PNG a 1920: 654 MB en disco y casi 9 GB de RAM
#   al descomprimir. Es el mismo muro que Simbio. Convertidos quedan en
#   ~90 MB repartidos en tres secuencias que cargan por separado.
#
# ---------------------------------------------------------------------------
# EL FONDO: BLANCO, Y POR QUE HAY QUE RECORTAR (23/08/2026)
#
#   Primero se hicieron sobre negro, porque ES el fondo que traen los renders.
#   Se ve mal: sobre negro, las partes oscuras del propio mueble (el respaldo
#   marron, la silueta gris de la persona) se pierden contra el fondo y
#   parecen agujeros. Mati pidio blanco.
#
#   El problema es que Descanso y Comunicacion NO tienen canal alfa: se
#   midieron los tres y dan Format24bppRgb con cero pixeles transparentes.
#   El negro esta HORNEADO en los pixeles. Poner el lienzo en blanco no
#   alcanza: el rectangulo negro sigue ahi.
#
#   Mati eligio fondo CREMA del sitio, no blanco puro.
#
#   Para las dos secuencias SIN alfa hay que recortar el negro, y la clave
#   es un dato medido: el fondo y los
#   huecos de las piezas son NEGRO PURO (luminancia <= 30) y las siluetas de
#   las personas son GRIS OSCURO (~60). Un corte limpio en 30 se lleva el
#   fondo y no toca las siluetas. Ver el comentario largo de RecorteMuseo.
#
#   Para EXPOSICION, que SI tiene alfa, no se recorta nada: se compone
#   reforzando el alfa, porque sus siluetas estan al ~70% de opacidad y
#   sobre un fondo claro se lavan hasta casi desaparecer.
#
#   Exposicion SI tiene alfa, asi que a esa NO se le recorta nada: se aplasta
#   contra blanco y listo. Recortarla ademas le comeria los vidrios oscuros.
#
#   SI ALGUN DIA SE RE-EXPORTAN LOS FRAMES: si salen con alfa, poner
#   Recortar=$false en las tres y este script se vuelve trivial.
# ---------------------------------------------------------------------------
#
# EL BACHE DE EXPOSICION: YA NO ESTA (23/08/2026, segunda entrega)
#   La primera entrega de Exposicion no traia los archivos 00264 y 00265 y
#   habia que taparlos duplicando el 0263. La segunda entrega llego completa,
#   con los 338. El parche sigue en el codigo porque solo actua si el archivo
#   falta de verdad, asi que hoy no hace nada. No lo saco por si alguna vez
#   vuelve a faltar un cuadro.

# QUIEN TIENE ALFA Y QUIEN NO (23/08/2026, segunda entrega)
#   Se dio vuelta respecto de la primera vuelta. Mati re-renderizo las tres:
#     DESCANSO      RGBA, fondo transparente   -> no hay nada que recortar
#     COMUNICACION  RGBA, fondo transparente   -> no hay nada que recortar
#     EXPOSICION    24bpp, fondo NEGRO PURO    -> hay que recortar y levantar
#   Justo al reves que antes. Por eso conviene MEDIR el formato de cada
#   secuencia antes de tocar esta tabla, y no confiar en la memoria:
#     [System.Drawing.Image]::FromFile(ruta).PixelFormat
#
# NO TOCA LOS ORIGINALES. Se puede cortar y volver a correr: saltea lo hecho.
# Para forzar la reconversion, borrar la carpeta de destino.
#
# COMO CORRERLO
#   powershell -ExecutionPolicy Bypass -File tools\optimizar-frames-museo.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# LA CALIDAD VA POR SECUENCIA, en la tabla de abajo. Comunicacion es una
# escena a sangre y pesa el triple que las otras dos con la misma calidad,
# asi que va mas comprimida. Simbio usa 91 y se ve bien.

# EL FONDO: el crema del sitio (23/08/2026). Antes fue negro y despues
# blanco puro; el crema es el que respeta la paleta y el que Mati eligio.
# TIENE QUE COINCIDIR con --museo-fondo-render de css/museo.css: si no, se
# ve el rectangulo de la imagen recortado contra la pagina.
$FondoR = 243; $FondoG = 237; $FondoB = 225   # #F3EDE1 = --crema

# Umbrales del recorte, sobre la luminancia max(R,G,B) de 0 a 255.
#   $UmbralFondo  por debajo de esto el pixel es fondo y se pinta de blanco.
#                 30 esta elegido por medicion: el fondo y los huecos estan
#                 casi todos en 0, y la silueta mas oscura que aparece en los
#                 renders esta en ~60. Subirlo empieza a comerse siluetas.
#   $UmbralBorde  suavizado del contorno. Solo afecta pixeles oscuros que
#                 TOCAN el fondo, para que el antialias no quede dentado.
$UmbralFondo = 30
$UmbralBorde = 64

# Cuantos cuadros promedia el suavizado de los centros.
#
# 1 = SIN SUAVIZAR, seguimiento exacto. Es lo que corresponde, y llegar ahi
# costo tres vueltas. El razonamiento, medido sobre Exposicion:
#
#   - El 59% de las transiciones son MESETA: el contenido no se mueve nada.
#     La mediana del salto del centro entre cuadro y cuadro es 0.0 px.
#   - Suavizar reparte los saltos sobre la ventana entera, asi que la ventana
#     se mueve TAMBIEN durante las mesetas. Eso es un temblor lento que no
#     corresponde a nada de lo que pasa en la imagen, y se siente raro.
#   - Con seguimiento exacto, si el contenido esta quieto la ventana esta
#     quieta: temblor cero. Y el desvio es cero por definicion.
#   - Los unicos saltos grandes son 5 cuadros (55, 107, 262, 292, 299) y los
#     cinco coinciden con un cambio de tamano del contenido de 300 a 515 px,
#     o sea el momento en que entra o sale la silueta de la persona. Ahi la
#     imagen cambia entera, asi que el salto de la ventana queda tapado.
#
# Subirlo solo tiene sentido si alguna secuencia futura tiene ruido real en
# la medicion del recuadro, no movimiento real de la pieza.
$VentanaSuavizado = 1

$Raiz    = Split-Path -Parent $PSScriptRoot
$Origen  = Join-Path $Raiz "assets\mobiliario museo"
$Destino = Join-Path $Raiz "assets\mobiliario-museo"

# --- LAS SECUENCIAS -----------------------------------------------------
# RESOLUCION NATIVA, NO MENOS (23/08/2026). Primero se convirtieron a 1600 de
# ancho y se vio pixelado: en una ventana de 1900 con devicePixelRatio 1.5 el
# lienzo real mide ~2850x1335, asi que un frame de 1600x900 se AMPLIA 1.48
# veces solo para llenar la pantalla. Ampliar un JPEG casi al doble se nota.
# Los originales son 1920 de ancho: ese es el techo y hay que usarlo entero.
# Ancho/Alto respetan la proporcion de cada render: Descanso y Comunicacion
# son 1920x1080 (16:9), Exposicion es 1920x1282 (mas alto, casi 3:2).
# Recortar: solo las dos que vienen SIN alfa, con el negro horneado.
#
# Gamma: LEVANTE DE SOMBRAS. 1 = no toca nada. Menos de 1 sube los tonos
#   oscuros y deja los claros donde estan.
#
#   POR QUE HACE FALTA (23/08/2026). Estos renders se hicieron sobre un mundo
#   negro y sin luz de relleno, asi que toda superficie que no mira a la luz
#   principal cae a casi cero. Medido en el respaldo de Descanso: los pixeles
#   oscuros son #391300, #3F1601, #2F1C0C. Eso ES madera, con su marron
#   intacto; lo unico que le falta es NIVEL. Sobre fondo negro se leia como
#   "esta en sombra"; sobre el crema de la pagina se lee como un agujero.
#
#   El levante les devuelve nivel sin cambiarles el tono. Exposicion va en 1:
#   tiene alfa de verdad y nunca tuvo este problema.
#
# Centrar: CENTRA LA PIEZA CUADRO POR CUADRO.
#   Un recorte fijo no alcanzaba. Medido sobre Exposicion: el centro del
#   contenido se corre 264px en horizontal y 308px en vertical a lo largo de
#   la secuencia, y casi siempre queda por debajo del centro del cuadro. Con
#   una ventana fija, la pieza se ve descentrada en casi todos los tramos.
#
#   Con Centrar, el script hace DOS pasadas: primero mide el recuadro del
#   contenido de cada cuadro, y despues dibuja cada uno corrido para que su
#   centro caiga en el centro de la salida.
#
#   NO SE SUAVIZAN. Ver la nota larga de $VentanaSuavizado: suavizar mueve la
#   ventana durante las mesetas, cuando la pieza esta quieta, y eso se siente
#   como un temblor que no corresponde a nada.
#
#   El Ancho/Alto de la fila tiene que ser mas grande que el contenido mas
#   grande de toda la secuencia, o se recorta la pieza. El script avisa si no
#   entra.
#
# Caja: RECORTE DEL VACIO, en pixeles del original: @(x, y, ancho, alto).
#   Recorta el CUADRO, no la pieza. Se midio el recuadro que ocupa el
#   contenido a lo largo de TODA la secuencia (no de un cuadro: la pieza se
#   mueve) y se le dejo 48px de margen de seguridad.
#
#   Exposicion, segunda entrega (la que tiene alfa): la pieza vive en
#   x 91-1419, y 1-1281 de un cuadro de 1920x1282. Se midio con cuatro
#   umbrales de alfa distintos (12, 40, 90, 160) y los cuatro dan lo mismo,
#   asi que no es ruido: la pieza YA ocupa todo el alto. Lo unico que sobra
#   son ~500px de aire a la derecha.
#
#   OJO: sobre la PRIMERA entrega de Exposicion, la que vino sobre negro,
#   esta misma medicion daba y 302-1258. Era un espejismo: ahi el contenido
#   se detectaba por luminancia > 30, y la sombra del piso quedaba por
#   debajo de ese umbral. Con alfa aparece. Moraleja: medir el recuadro con
#   el ALFA cuando lo hay, no por brillo.
#
#   Como en pantalla ancha el ajuste lo manda el ALTO, recortar el aire de
#   la derecha no agranda la pieza: la centra y aprieta la composicion. Para
#   agrandarla mas habria que recortar la pieza, y eso no se hace.
#
#   Ancho/Alto de la fila tienen que coincidir con el ancho/alto de la Caja,
#   asi el pixel sale 1 a 1 y no se reescala al pedo.
#
# Refuerzo: cuanto se multiplica el ALFA antes de componer. 1 = tal cual.
#   Solo tiene sentido en la secuencia que TIENE alfa (Exposicion). Sus
#   siluetas de gente estan al ~70% de opacidad: sobre negro se leian
#   solidas, sobre claro se lavaban y casi desaparecian. Con 1.9 vuelven a
#   ser una silueta llena. El costo aceptado es que el vidrio de las
#   vitrinas queda mas ahumado; se comparo y se eligio asi el 23/08.
$Secuencias = @(
  @{ Nombre="descanso";     Carpeta="DESCANSO\FRAMES_DESCANSO_WEB";         Prefijo="ASIENTO_";      Ancho=1920; Alto=1080; Calidad=91; Recortar=$false; Refuerzo=1.0; Gamma=1.0  }
  @{ Nombre="exposicion";   Carpeta="EXPOSICION\FRAMES_EXPO_WEB";           Prefijo="EXPO_";         Ancho=870;  Alto=1290; Calidad=91; Recortar=$false; Refuerzo=1.0; Gamma=1.0;  Centrar=$true }
  @{ Nombre="comunicacion"; Carpeta="COMUNICACION\FRAMES_COMUNICACION_WEB"; Prefijo="COMUNICACION_"; Ancho=1920; Alto=1080; Calidad=86; Recortar=$false; Refuerzo=1.0; Gamma=1.0  }
)

Add-Type -AssemblyName System.Drawing

# El bucle de pixeles va COMPILADO. En PowerShell puro, 671 frames de
# 1600x900 son casi mil millones de GetPixel/SetPixel: son horas. Compilado
# es cuestion de minutos.
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class RecorteMuseo {

    // Recuadro que ocupa el contenido de un cuadro con alfa: x0,y0,x1,y1.
    // Pide un minimo de pixeles por fila y por columna para que un pixel
    // suelto de ruido no infle la caja.
    public static int[] Caja(Bitmap bmp, int alfaMin, int minPx) {
        int an = bmp.Width, al = bmp.Height;
        BitmapData d = bmp.LockBits(new Rectangle(0,0,an,al), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        byte[] px = new byte[d.Stride*al];
        Marshal.Copy(d.Scan0, px, 0, px.Length);
        bmp.UnlockBits(d);
        int[] cols = new int[an];
        int[] filas = new int[al];
        for (int y = 0; y < al; y++) {
            int f = y * d.Stride;
            for (int x = 0; x < an; x++) {
                if (px[f + x*4 + 3] >= alfaMin) { cols[x]++; filas[y]++; }
            }
        }
        int x0=-1, x1=-1, y0=-1, y1=-1;
        for (int x = 0; x < an; x++) if (cols[x] >= minPx) { if (x0 < 0) x0 = x; x1 = x; }
        for (int y = 0; y < al; y++) if (filas[y] >= minPx) { if (y0 < 0) y0 = y; y1 = y; }
        return new int[]{ x0, y0, x1, y1 };
    }

    // OJO AL EDITAR ESTE BLOQUE: esta adentro de un here-string @"..."@ de
    // PowerShell, donde el BACKTICK es el caracter de escape. Un backtick
    // seguido de r, en un comentario, se convierte en un retorno de carro y
    // parte la linea; el error que da el compilador apunta a la linea
    // SIGUIENTE, asi que se busca en el lugar equivocado. Paso el 23/08.
    // Nada de backticks aca adentro, ni siquiera en los comentarios.

    // Quita el fondo negro de un render que viene SIN canal alfa.
    //
    // POR QUE UN UMBRAL DURO Y NO UNA RAMPA (23/08/2026)
    //   El primer intento mezclaba hacia blanco toda la franja de luminancia
    //   entre 8 y 42. Estaba mal: lavaba lo oscuro del objeto y dejaba las
    //   siluetas de las personas moteadas, medio blancas y medio negras.
    //
    //   Despues se probo un relleno por conectividad desde el borde, para
    //   distinguir "fondo" de "silueta". Tambien de mas, y encima peor: los
    //   huecos de las patas de madera son fondo pero estan ENCERRADOS por el
    //   objeto, asi que el relleno no llegaba y quedaban manchones negros.
    //
    //   Lo que resuelve el problema es un dato medido, no un algoritmo mas
    //   complicado: EL FONDO Y LOS HUECOS SON NEGRO PURO (luminancia <= 30,
    //   casi todo en 0), Y LAS SILUETAS SON GRIS OSCURO (~60). O sea que un
    //   corte limpio en 30 las separa solo. Verificado en los cuadros donde
    //   hay gente: 296 de Descanso y 225 de Comunicacion.
    //
    //   SI ALGUN DIA UN RENDER TRAE UNA SILUETA EN NEGRO PURO, esto se la
    //   va a comer y no hay umbral que lo arregle: habria que re-exportar
    //   ese render con alfa.
    //
    // Al final suaviza el contorno: los pixeles oscuros que TOCAN el fondo
    // se mezclan un poco, para que el antialias contra negro no deje un
    // reborde sucio. Es un borde de un pixel, no toca el interior.
    public static void QuitarFondo(Bitmap bmp, int umbral, int umbralBorde, byte fr, byte fg, byte fb, double gamma) {
        int an = bmp.Width, al = bmp.Height;
        Rectangle r = new Rectangle(0, 0, an, al);
        BitmapData d = bmp.LockBits(r, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
        int paso = d.Stride;
        int largo = paso * al;
        byte[] px = new byte[largo];
        Marshal.Copy(d.Scan0, px, 0, largo);

        int[] luz = new int[an * al];
        for (int y = 0; y < al; y++) {
            int fila = y * paso;
            for (int x = 0; x < an; x++) {
                int i = fila + x * 3;
                byte b = px[i], g = px[i+1], rr = px[i+2];
                luz[y*an + x] = rr > g ? (rr > b ? rr : b) : (g > b ? g : b);
            }
        }

        bool[] fondo = new bool[an * al];
        for (int p = 0; p < an * al; p++) if (luz[p] <= umbral) fondo[p] = true;

        // Tabla del levante de sombras, calculada una vez y no por pixel.
        // gamma < 1 sube los tonos bajos y casi no toca los altos.
        byte[] curva = new byte[256];
        for (int v = 0; v < 256; v++) {
            curva[v] = (gamma >= 0.999)
                ? (byte)v
                : (byte)Math.Round(255.0 * Math.Pow(v / 255.0, gamma));
        }

        for (int y = 0; y < al; y++) {
            int fila = y * paso;
            for (int x = 0; x < an; x++) {
                int p = y*an + x;
                int i = fila + x * 3;

                if (fondo[p]) {
                    px[i] = fb; px[i+1] = fg; px[i+2] = fr;
                    continue;
                }

                // LEVANTE DE SOMBRAS. Va SOLO sobre lo que no es fondo, para
                // no correrle el color al crema. Se aplica igual a los tres
                // canales, asi el tono no cambia: un marron casi negro se
                // vuelve un marron visible, no un gris.
                px[i]   = curva[px[i]];
                px[i+1] = curva[px[i+1]];
                px[i+2] = curva[px[i+2]];

                // Suavizado del contorno: solo pixeles oscuros que TOCAN el
                // fondo. Es un reborde de un pixel, no toca el interior.
                if (luz[p] < umbralBorde) {
                    bool pegado =
                        (x > 0    && fondo[p-1])  || (x < an-1 && fondo[p+1]) ||
                        (y > 0    && fondo[p-an]) || (y < al-1 && fondo[p+an]);
                    if (pegado) {
                        double t = (double)luz[p] / umbralBorde;
                        px[i]   = (byte)(fb + (px[i]   - fb) * t);
                        px[i+1] = (byte)(fg + (px[i+1] - fg) * t);
                        px[i+2] = (byte)(fr + (px[i+2] - fr) * t);
                    }
                }
            }
        }

        Marshal.Copy(px, 0, d.Scan0, largo);
        bmp.UnlockBits(d);
    }

    // --- CASO 2: el render SI tiene alfa (Exposicion) --------------------
    //
    // Se compone a mano sobre el color de fondo, multiplicando el alfa por
    // el parametro refuerzo antes de mezclar. Con refuerzo 1 es una
    // composicion normal,
    // igual a la que hacia el Graphics.Clear + DrawImage de antes.
    //
    // Con refuerzo > 1, lo semitransparente se vuelve mas solido. Eso es lo
    // que hace que las siluetas de la gente no se laven contra el crema: sin
    // esto quedan gris medio y, como dijo Mati, "parece que no existen".
    //
    // El corte en 0.02 deja en paz lo que es transparente del todo. Sin el,
    // el ruido de alfa que queda en el borde del recorte se convertiria en
    // un halo visible alrededor de la pieza.
    //
    // OJO CON EL RECORTE (bug del 23/08). Esta funcion dibujaba SIEMPRE el
    // cuadro entero escalado a an x al, ignorando la caja. Cuando Exposicion
    // paso a tener alfa se fue por aca, y sus 1920px de ancho entraban a la
    // fuerza en los 1425 de la caja: la pieza salia achatada un 26%. El
    // recorte solo lo respetaba la otra rama. Ahora los dos parametros
    // cajaX/cajaW dicen que pedazo del original hay que tomar.
    public static Bitmap Componer(Bitmap origen, int an, int al, byte fr, byte fg, byte fb, double refuerzo,
                                  int cajaX, int cajaY, int cajaW, int cajaH) {
        Bitmap chico = new Bitmap(an, al, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(chico)) {
            g.Clear(Color.Transparent);
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
            Rectangle destino = new Rectangle(0, 0, an, al);
            Rectangle recorte = new Rectangle(cajaX, cajaY, cajaW, cajaH);
            g.DrawImage(origen, destino, recorte, GraphicsUnit.Pixel);
        }

        Bitmap salida = new Bitmap(an, al, PixelFormat.Format24bppRgb);
        BitmapData ds = chico.LockBits(new Rectangle(0,0,an,al), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        BitmapData dd = salida.LockBits(new Rectangle(0,0,an,al), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
        byte[] s = new byte[ds.Stride * al];
        byte[] o = new byte[dd.Stride * al];
        Marshal.Copy(ds.Scan0, s, 0, s.Length);

        for (int y = 0; y < al; y++) {
            for (int x = 0; x < an; x++) {
                int i = y*ds.Stride + x*4;
                int j = y*dd.Stride + x*3;
                double a = s[i+3] / 255.0;
                if (refuerzo > 1.0 && a > 0.02) a = Math.Min(1.0, a * refuerzo);
                o[j]   = (byte)(s[i]   * a + fb * (1-a));
                o[j+1] = (byte)(s[i+1] * a + fg * (1-a));
                o[j+2] = (byte)(s[i+2] * a + fr * (1-a));
            }
        }
        Marshal.Copy(o, 0, dd.Scan0, o.Length);
        chico.UnlockBits(ds); salida.UnlockBits(dd); chico.Dispose();
        return salida;
    }
}
"@ -ReferencedAssemblies System.Drawing

# Dibuja el original sobre el lienzo. Si la secuencia tiene Caja, toma solo
# ese recorte del original; si no, el cuadro entero.
function Dibujar($g, $img, $sec) {
  $destino = New-Object System.Drawing.Rectangle(0, 0, $sec.Ancho, $sec.Alto)
  if ($sec.ContainsKey("Caja") -and $sec.Caja) {
    $c = $sec.Caja
    $origen = New-Object System.Drawing.Rectangle($c[0], $c[1], $c[2], $c[3])
    $g.DrawImage($img, $destino, $origen, [System.Drawing.GraphicsUnit]::Pixel)
  } else {
    $g.DrawImage($img, $destino)
  }
}

$fondo = [System.Drawing.Color]::FromArgb($FondoR, $FondoG, $FondoB)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
         Where-Object { $_.MimeType -eq "image/jpeg" }
# El encoder se arma adentro del bucle, porque la calidad cambia por secuencia.
function Nuevos-Params([int]$q) {
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                  [System.Drawing.Imaging.Encoder]::Quality, [long]$q)
  return $p
}

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

  $params = Nuevos-Params $sec.Calidad
  $archivos = Get-ChildItem $carpetaOrigen -Filter *.png | Sort-Object Name

  # ------------------------------------------------------------------------
  # PRIMERA PASADA: donde esta la pieza en cada cuadro
  # Solo para las secuencias con Centrar. Mide el recuadro del contenido,
  # suaviza los centros y despues la segunda pasada dibuja cada cuadro
  # corrido para que ese centro caiga en el medio de la salida.
  # ------------------------------------------------------------------------
  $centros = $null
  if ($sec.ContainsKey("Centrar") -and $sec.Centrar) {
    Write-Output ("[" + $sec.Nombre + "] midiendo donde esta la pieza en cada cuadro...")
    $cx = New-Object 'System.Collections.Generic.List[double]'
    $cy = New-Object 'System.Collections.Generic.List[double]'
    $maxAn = 0; $maxAl = 0
    foreach ($archivo in $archivos) {
      $num = $archivo.BaseName -replace [regex]::Escape($sec.Prefijo), ""
      if ($num -notmatch '^\d+$') { continue }
      $im = [System.Drawing.Image]::FromFile($archivo.FullName)
      $bm = New-Object System.Drawing.Bitmap($im)
      $c = [RecorteMuseo]::Caja($bm, 40, 4)
      if ($c[0] -ge 0) {
        $cx.Add((($c[0] + $c[2]) / 2.0))
        $cy.Add((($c[1] + $c[3]) / 2.0))
        $an = $c[2] - $c[0] + 1; $al = $c[3] - $c[1] + 1
        if ($an -gt $maxAn) { $maxAn = $an }
        if ($al -gt $maxAl) { $maxAl = $al }
      } else {
        # Cuadro vacio: hereda el centro del anterior, o el del medio.
        if ($cx.Count -gt 0) { $cx.Add($cx[$cx.Count-1]); $cy.Add($cy[$cy.Count-1]) }
        else { $cx.Add(($bm.Width/2.0)); $cy.Add(($bm.Height/2.0)) }
      }
      $bm.Dispose(); $im.Dispose()
    }

    # Suavizado: promedio movil. Sin esto, el cuadro donde entra o sale la
    # silueta de la persona cambia el recuadro de golpe y la pieza salta.
    $mitad = [int](($VentanaSuavizado - 1) / 2)
    $sx = New-Object 'System.Collections.Generic.List[double]'
    $sy = New-Object 'System.Collections.Generic.List[double]'
    for ($i = 0; $i -lt $cx.Count; $i++) {
      $a = [math]::Max(0, $i - $mitad); $b = [math]::Min($cx.Count - 1, $i + $mitad)
      $tx = 0.0; $ty = 0.0
      for ($j = $a; $j -le $b; $j++) { $tx += $cx[$j]; $ty += $cy[$j] }
      $n = $b - $a + 1
      $sx.Add(($tx / $n)); $sy.Add(($ty / $n))
    }
    $centros = @{ x = $sx; y = $sy }

    Write-Output ("           el contenido mas grande mide " + $maxAn + "x" + $maxAl + "  ·  la salida es " + $sec.Ancho + "x" + $sec.Alto)
    if ($maxAn -gt $sec.Ancho -or $maxAl -gt $sec.Alto) {
      Write-Output ("           OJO: la salida es MAS CHICA que el contenido, se va a recortar la pieza.")
    }
  }
  $modo = if ($sec.Recortar) { "recortando el negro" } else { "componiendo el alfa x" + $sec.Refuerzo }
  Write-Output ("[" + $sec.Nombre + "] " + $archivos.Count + " frames -> " + $sec.Ancho + "x" + $sec.Alto + " q" + $sec.Calidad + ", " + $modo)

  $hechos = 0
  $indiceCentro = 0
  foreach ($archivo in $archivos) {
    # ASIENTO_00042 -> 0042. Si el nombre no termina en numero, lo salteo.
    $num = $archivo.BaseName -replace [regex]::Escape($sec.Prefijo), ""
    if ($num -notmatch '^\d+$') { continue }
    $salida = Join-Path $carpetaDestino ((([int]$num).ToString("0000")) + ".jpg")
    if (Test-Path $salida) { continue }

    $img = [System.Drawing.Image]::FromFile($archivo.FullName)

    if ($sec.Recortar) {
      # SIN ALFA (Descanso y Comunicacion): se dibuja sobre el fondo y
      # despues se recorta por umbral el negro horneado.
      $bmp = New-Object System.Drawing.Bitmap($sec.Ancho, $sec.Alto)
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.Clear($fondo)
      $g.InterpolationMode = "HighQualityBicubic"
      # PixelOffsetMode NO es cosmetico: sin el, el reescalado deja un
      # reborde claro de un pixel alrededor de toda la imagen. Medido el
      # 23/08 persiguiendo un bug que parecia del recorte. No sacarla.
      $g.PixelOffsetMode = "HighQuality"
      Dibujar $g $img $sec
      $g.Dispose()
      [RecorteMuseo]::QuitarFondo($bmp, $UmbralFondo, $UmbralBorde, $FondoR, $FondoG, $FondoB, $sec.Gamma)
    } else {
      # CON ALFA (Exposicion): se compone a mano para poder reforzar el alfa
      # de las siluetas semitransparentes. Aca NO se recorta nada: el umbral
      # le comeria los vidrios de las vitrinas.
      # De donde sale el pedazo del original que se dibuja.
      if ($centros) {
        # Centrado por cuadro: la ventana es del tamano de la salida y se
        # planta sobre el centro suavizado de ESTE cuadro. Sin clamp a
        # proposito: si la ventana se sale del original, lo que entra de
        # afuera es transparente y se compone contra el crema, que es
        # exactamente lo que queremos. Recortar la ventana para que entre
        # volveria a descentrar la pieza.
        $ccx = $centros.x[$indiceCentro]
        $ccy = $centros.y[$indiceCentro]
        $c = @([int]([math]::Round($ccx - $sec.Ancho / 2.0)),
               [int]([math]::Round($ccy - $sec.Alto  / 2.0)),
               $sec.Ancho, $sec.Alto)
        $indiceCentro++
      } elseif ($sec.ContainsKey("Caja") -and $sec.Caja) {
        $c = $sec.Caja
      } else {
        $c = @(0, 0, $img.Width, $img.Height)
      }
      $bmp = [RecorteMuseo]::Componer($img, $sec.Ancho, $sec.Alto, $FondoR, $FondoG, $FondoB, $sec.Refuerzo, $c[0], $c[1], $c[2], $c[3])
    }

    $bmp.Save($salida, $codec, $params)
    $bmp.Dispose(); $img.Dispose()
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
Write-Output "Listo. Acordate de subir VERSION_FRAMES en js/museo-scroll.js."
