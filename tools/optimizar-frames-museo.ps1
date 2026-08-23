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

$Calidad = 93          # Simbio usa 91. Aca un poco mas alto a pedido de Mati.

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

$Raiz    = Split-Path -Parent $PSScriptRoot
$Origen  = Join-Path $Raiz "assets\mobiliario museo"
$Destino = Join-Path $Raiz "assets\mobiliario-museo"

# --- LAS SECUENCIAS -----------------------------------------------------
# Ancho/Alto respetan la proporcion de cada render: Descanso y Comunicacion
# son 1920x1080 (16:9), Exposicion es 1920x1282 (mas alto, casi 3:2).
# Recortar: solo las dos que vienen SIN alfa, con el negro horneado.
#
# Refuerzo: cuanto se multiplica el ALFA antes de componer. 1 = tal cual.
#   Solo tiene sentido en la secuencia que TIENE alfa (Exposicion). Sus
#   siluetas de gente estan al ~70% de opacidad: sobre negro se leian
#   solidas, sobre claro se lavaban y casi desaparecian. Con 1.9 vuelven a
#   ser una silueta llena. El costo aceptado es que el vidrio de las
#   vitrinas queda mas ahumado; se comparo y se eligio asi el 23/08.
$Secuencias = @(
  @{ Nombre="descanso";     Carpeta="DESCANSO\FRAMES_DESCANSO_WEB";         Prefijo="ASIENTO_";      Ancho=1600; Alto=900;  Recortar=$true;  Refuerzo=1.0 }
  @{ Nombre="exposicion";   Carpeta="EXPOSICION\FRAMES_EXPO_WEB";           Prefijo="EXPO_";         Ancho=1600; Alto=1068; Recortar=$false; Refuerzo=1.9 }
  @{ Nombre="comunicacion"; Carpeta="COMUNICACION\FRAMES_COMUNICACION_WEB"; Prefijo="COMUNICACION_"; Ancho=1600; Alto=900;  Recortar=$true;  Refuerzo=1.0 }
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
    public static void QuitarFondo(Bitmap bmp, int umbral, int umbralBorde, byte fr, byte fg, byte fb) {
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

        for (int y = 0; y < al; y++) {
            int fila = y * paso;
            for (int x = 0; x < an; x++) {
                int p = y*an + x;
                int i = fila + x * 3;

                if (fondo[p]) {
                    px[i] = fb; px[i+1] = fg; px[i+2] = fr;
                    continue;
                }

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
    public static Bitmap Componer(Bitmap origen, int an, int al, byte fr, byte fg, byte fb, double refuerzo) {
        Bitmap chico = new Bitmap(an, al, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(chico)) {
            g.Clear(Color.Transparent);
            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
            g.DrawImage(origen, 0, 0, an, al);
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

$fondo = [System.Drawing.Color]::FromArgb($FondoR, $FondoG, $FondoB)
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
  $modo = if ($sec.Recortar) { "recortando el negro" } else { "componiendo el alfa x" + $sec.Refuerzo }
  Write-Output ("[" + $sec.Nombre + "] " + $archivos.Count + " frames -> " + $sec.Ancho + "x" + $sec.Alto + ", " + $modo)

  $hechos = 0
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
      $g.DrawImage($img, 0, 0, $sec.Ancho, $sec.Alto)
      $g.Dispose()
      [RecorteMuseo]::QuitarFondo($bmp, $UmbralFondo, $UmbralBorde, $FondoR, $FondoG, $FondoB)
    } else {
      # CON ALFA (Exposicion): se compone a mano para poder reforzar el alfa
      # de las siluetas semitransparentes. Aca NO se recorta nada: el umbral
      # le comeria los vidrios de las vitrinas.
      $bmp = [RecorteMuseo]::Componer($img, $sec.Ancho, $sec.Alto, $FondoR, $FondoG, $FondoB, $sec.Refuerzo)
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
