/* ==========================================================================
   SIMBIO-SCROLL.JS
   Animación 3D controlada por scroll (scroll-scrubbing).

   Aislado a propósito: esto es lógica de UNA página. No toca main.js ni el
   sistema de diseño. Si mañana borramos SIMBIO, se borra este archivo y
   nada más se entera.

   PASO ACTUAL: solo el mecanismo básico — precargar los frames y que el
   scroll los recorra. Los textos por fase y las pausas entre capítulos
   vienen después (la estructura de fases ya está planteada abajo).
   ========================================================================== */

// Con nombre y no como función anónima: Swup necesita poder volver a
// llamarla cuando cambia de página sin recargar.
window.initSimbioScroll = function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. CONFIGURACIÓN
     Los tres números que se van a querer tocar están todos acá arriba.
     ------------------------------------------------------------------------ */

  // Rango de frames a usar, inclusive los dos extremos: la secuencia
  // completa, los 375 archivos (0000 a 0374).
  //
  // Nota: los frames 0000 a 0041 son crema vacío, antes de que caiga el
  // primer tubo. Se usan igual porque están dentro de la fase 1 y el
  // typewriter ya está anunciando "Crecimiento vertical" mientras tanto.
  // Si ese arranque en blanco molesta, subir FRAME_PRIMERO a 42.
  const FRAME_PRIMERO = 0;
  const FRAME_ULTIMO = 374;

  // Dónde están y cómo se llaman. Ruta relativa desde /proyectos/.
  //
  // OJO: no apuntamos a /frames/ (los PNG originales de Blender) sino a
  // /frames-web/. Los originales son 375 PNG de 1920x1080: 549 MB de
  // descarga y ~2,9 GB de RAM descomprimidos, o sea imposible en un
  // navegador. /frames-web/ tiene los mismos frames a 1280x720, en JPG,
  // con el fondo transparente ya aplastado contra el crema del panel.
  // Los genera tools/optimizar-frames.ps1 y pesan ~45 MB en total.
  const CARPETA = "../assets/simbio/frames-web/";
  const rutaDeFrame = (n) => CARPETA + String(n).padStart(4, "0") + ".jpg";

  // Salto entre frames. 1 = se usan los 375. 2 = uno de cada dos (188).
  // Es la perilla para bajar el consumo de memoria si en algún equipo se
  // pone pesado: el movimiento sigue siendo fluido porque el scroll ya
  // interpola visualmente.
  const SALTO = 1;

  // Cuántas imágenes se piden a la vez durante la precarga.
  // Ni de a una (lentísimo) ni las 375 juntas (el navegador se satura y
  // encima las va resolviendo en cualquier orden). 8 es un punto sano.
  const CARGAS_EN_PARALELO = 8;

  // Cuánto se espera una imagen antes de darla por perdida.
  const TIMEOUT_IMAGEN = 12000;

  // Red de seguridad: pasado este tiempo, el scrubbing arranca con los
  // frames que haya y el resto sigue cargando de fondo. Es preferible una
  // animación incompleta a un loader clavado.
  const ESPERA_MAXIMA = 20000;

  /* ------------------------------------------------------------------------
     2. ESTRUCTURA NARRATIVA — 4 FASES
     Todavía NO se usa. Queda planteada acá porque en el paso siguiente
     sobre esto van los textos por capítulo y las pausas.
     Los rangos son inclusivos en los dos extremos.
     ------------------------------------------------------------------------ */

  const FASES = [
    { nombre: "\u00c1rbol + Hongo", detalle: "crecimiento vertical",   frameInicio: 0,   frameFin: 136 },
    { nombre: "Hongo + \u00c1rbol", detalle: "crecimiento horizontal", frameInicio: 137, frameFin: 211 },
    { nombre: "Hongo + Alga",  detalle: "crecimiento a\u00e9reo",      frameInicio: 212, frameFin: 278 },
    { nombre: "Hongo + Alga",  detalle: "crecimiento colgante",   frameInicio: 279, frameFin: 374 },
  ];

  // Helper para el paso siguiente: dado un frame, devuelve en qué fase está.
  // Lo dejo escrito ahora para que la estructura ya tenga su forma de uso.
  function faseDeFrame(n) {
    return FASES.find((f) => n >= f.frameInicio && n <= f.frameFin) || null;
  }

  /* ------------------------------------------------------------------------
     3. ELEMENTOS DEL DOM
     Si falta alguno, no estamos en la página de SIMBIO: salimos sin hacer
     nada en vez de tirar errores en la consola.
     ------------------------------------------------------------------------ */

  const seccion = document.querySelector("[data-simbio-scroll]");
  const canvas = document.querySelector("[data-simbio-canvas]");
  const escenario = document.querySelector(".simbio-stage");
  const loader = document.querySelector("[data-simbio-loader]");
  const barra = document.querySelector("[data-simbio-barra]");
  const porcentaje = document.querySelector("[data-simbio-porcentaje]");
  const mensaje = document.querySelector("[data-simbio-mensaje]");
  const pista = document.querySelector("[data-simbio-pista]");

  // Los tres pedazos del rótulo de fase
  const salidaFase = document.querySelector("[data-simbio-fase]");
  const salidaFaseNum = document.querySelector("[data-simbio-fase-num]");
  const salidaFaseDetalle = document.querySelector("[data-simbio-fase-detalle]");

  if (!seccion || !canvas) return;

  // ¿El usuario pidió menos movimiento? Si es así, los textos aparecen
  // enteros en vez de tipearse.
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");

  /* ------------------------------------------------------------------------
     3-bis. PANEL DE DIAGNÓSTICO
     Se enciende agregando ?debug=1 al final de la URL. Muestra en pantalla
     lo que normalmente habría que ir a buscar a la consola: si la página se
     abrió bien, cuántos frames entraron, en cuál está parado y cuánto
     scrolleaste. Sirve para calibrar la velocidad, no solo para arreglar.
     ------------------------------------------------------------------------ */

  const DEBUG = new URLSearchParams(location.search).has("debug");
  let panelDebug = null;

  if (DEBUG) {
    panelDebug = document.createElement("div");
    panelDebug.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:9999;" +
      "background:#0B0B0B;color:#A6C13A;border:1px solid #5A6E32;" +
      "padding:10px 14px;font:12px/1.6 ui-monospace,monospace;" +
      "white-space:pre;pointer-events:none;border-radius:6px";
    document.body.appendChild(panelDebug);
  }

  // Contadores: sirven para saber QUIÉN está moviendo la animación. Si al
  // scrollear ninguno de los dos sube, el problema no es el dibujo: es que no
  // están llegando los eventos de scroll.
  let vecesNativo = 0;
  let vecesTrigger = 0;

  function pintarDebug(extra) {
    if (!panelDebug) return;
    const cajaEsc = escenario ? escenario.getBoundingClientRect() : null;
    panelDebug.textContent =
      "protocolo : " + location.protocol + (location.protocol === "file:" ? "  << MAL" : "  << ok") + "\n" +
      "librerías  : gsap " + (window.gsap ? "ok" : "NO") +
        " · ScrollTrigger " + (window.ScrollTrigger ? "ok" : "NO") +
        " · lenis " + (window.lenis ? "ok" : "no") + "\n" +
      "quién mueve: nativo " + vecesNativo + "  ·  ScrollTrigger " + vecesTrigger + "\n" +
      "sticky     : escenario.top = " + (cajaEsc ? Math.round(cajaEsc.top) : "?") +
        "px  (0 = pegado)\n" +
      "scrollY    : " + Math.round(window.scrollY) + "\n" +
      "frames     : " + exitosas + " de " + TOTAL + " cargados\n" +
      "frame      : " + (frameActual < 0 ? "-" : numeroDeFrame(frameActual)) +
        "  (índice " + frameActual + ")\n" +
      "avance     : " + Math.round(progresoDeScroll() * 100) + "%\n" +
      "altura sec.: " + seccion.offsetHeight + "px  ·  viewport " + window.innerHeight + "px" +
      (extra ? "\n" + extra : "");
  }

  /* ------------------------------------------------------------------------
     4. ESTADO
     ------------------------------------------------------------------------ */

  // Cuántas imágenes vamos a manejar realmente, ya contando el SALTO
  const TOTAL = Math.floor((FRAME_ULTIMO - FRAME_PRIMERO) / SALTO) + 1;

  // Índice interno (0…TOTAL-1) → número de frame real del archivo
  const numeroDeFrame = (indice) => FRAME_PRIMERO + indice * SALTO;

  const imagenes = new Array(TOTAL).fill(null); // las Image() ya cargadas
  let cargadas = 0;   // intentos terminados (con o sin éxito) → mueve la barra
  let exitosas = 0;   // las que realmente existían → sirve para detectar líos
  let frameActual = -1;   // -1 = todavía no se dibujó nada
  let pendiente = false;  // hay un redibujo agendado para el próximo frame?

  /* ------------------------------------------------------------------------
     4-bis. RÓTULO DE FASE CON TYPEWRITER
     ----------------------------------------------------------------------------
     El texto de la fase se escribe y se borra letra por letra, en sincro con
     el scroll: al cruzar de un capítulo al siguiente, borra el anterior y
     tipea el nuevo.

     Detalle que hace que se vea bien: no borra todo y vuelve a escribir de
     cero. Busca hasta dónde coinciden el texto viejo y el nuevo, y borra
     solo desde ahí. Como las cuatro fases empiezan con "Crecimiento ", esa
     palabra queda quieta y solo cambia lo que sigue. Es más prolijo y más
     rápido que rehacer la línea entera.
     ------------------------------------------------------------------------ */

  const VEL_BORRAR = 22;     // ms por letra al borrar (más rápido que escribir)
  const VEL_ESCRIBIR = 45;   // ms por letra al escribir

  let textoMostrado = "";    // lo que hay en pantalla ahora
  let textoObjetivo = "";    // a dónde queremos llegar
  let relojTexto = null;     // el timer de la animación, si está corriendo
  let faseActual = null;     // para no reprocesar la misma fase

  // Hasta qué posición coinciden las dos cadenas
  function prefijoComun(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  }

  function pasoTexto() {
    relojTexto = null;

    const corte = prefijoComun(textoMostrado, textoObjetivo);
    let espera;

    if (textoMostrado.length > corte) {
      // Todavía sobra cola vieja: borramos una letra
      textoMostrado = textoMostrado.slice(0, -1);
      espera = VEL_BORRAR;
    } else if (textoMostrado.length < textoObjetivo.length) {
      // Ya limpiamos: escribimos una letra
      textoMostrado = textoObjetivo.slice(0, textoMostrado.length + 1);
      espera = VEL_ESCRIBIR;
    } else {
      return; // llegamos
    }

    if (salidaFase) salidaFase.textContent = textoMostrado;

    // SOUND HOOK: type-key
    // Tecla muy corta y muy baja. Ojo: se dispara una vez por letra.

    relojTexto = window.setTimeout(pasoTexto, espera);
  }

  function escribirFase(texto) {
    if (texto === textoObjetivo) return;   // ya vamos hacia ahí
    textoObjetivo = texto;

    if (sinMovimiento) {
      textoMostrado = texto;
      if (salidaFase) salidaFase.textContent = texto;
      return;
    }

    // Si el timer ya está corriendo, no arrancamos otro: el que corre va a
    // leer el objetivo nuevo en su próximo paso. Sin esta guarda, dos
    // cambios seguidos dejan dos animaciones peleando por la misma línea.
    if (!relojTexto) pasoTexto();
  }

  // Se llama en cada cambio de frame; actúa solo cuando cambia la fase.
  function actualizarFase(numeroFrame) {
    const fase = faseDeFrame(numeroFrame);
    if (!fase || fase === faseActual) return;

    faseActual = fase;
    const indice = FASES.indexOf(fase);

    escribirFase(fase.nombre);

    if (salidaFaseNum) {
      salidaFaseNum.textContent =
        String(indice + 1).padStart(2, "0") + " / " + String(FASES.length).padStart(2, "0");
    }

    if (salidaFaseDetalle) {
      salidaFaseDetalle.textContent = fase.detalle || "";
      salidaFaseDetalle.classList.toggle("is-visible", Boolean(fase.detalle));
    }

    // SOUND HOOK: phase-change
    // Un solo golpe, suave, al entrar a cada capítulo. Son 4 en todo el
    // recorrido, así que puede permitirse ser más presente que type-key.
  }

  /* ------------------------------------------------------------------------
     5. CARGA DE IMÁGENES
     ------------------------------------------------------------------------ */

  // Carga una sola imagen.
  //
  // Nunca rechaza y SIEMPRE termina: si el archivo no está, resuelve con
  // null; si el pedido se queda colgado, lo abandona a los 12 segundos y
  // también resuelve con null.
  // El timeout no es paranoia: sin él, una sola request que nunca contesta
  // deja el Promise.all esperando para siempre y el loader se queda clavado
  // en pantalla. Pasó.
  function cargarUna(indice) {
    return new Promise((resolve) => {
      const img = new Image();
      let terminado = false;

      function terminar(valor) {
        if (terminado) return;   // onload y timeout pueden pisarse
        terminado = true;
        clearTimeout(reloj);
        resolve(valor);
      }

      const reloj = setTimeout(() => {
        img.src = "";            // corta la descarga colgada
        terminar(null);
      }, TIMEOUT_IMAGEN);

      img.onload = () => terminar(img);
      img.onerror = () => terminar(null);
      img.src = rutaDeFrame(numeroDeFrame(indice));
    });
  }

  // Sonda: intenta el primer frame antes de pedir los 375.
  // Si la carpeta está vacía, nos enteramos con UNA request fallida en vez
  // de con 375 errores rojos en la consola.
  async function hayFrames() {
    const primera = await cargarUna(0);
    if (!primera) return false;
    imagenes[0] = primera;
    cargadas = 1;
    exitosas = 1;
    return true;
  }

  // Precarga con límite de conexiones simultáneas.
  // Cómo funciona: se lanzan N "obreros" en paralelo y cada uno va tomando
  // el siguiente índice de la fila hasta que no queda ninguno. Nunca hay
  // más de N pedidos abiertos, y no importa el orden en que terminen.
  async function precargar() {
    let siguiente = 1; // el 0 ya lo trajo la sonda

    async function obrero() {
      while (siguiente < TOTAL) {
        const indice = siguiente++;
        imagenes[indice] = await cargarUna(indice);
        cargadas++;
        if (imagenes[indice]) exitosas++;
        actualizarProgreso();
      }
    }

    const obreros = [];
    for (let i = 0; i < CARGAS_EN_PARALELO; i++) obreros.push(obrero());
    await Promise.all(obreros);
  }

  function actualizarProgreso() {
    // floor y no round: con round, 332 de 333 ya muestra "100%" y parece
    // que terminó cuando todavía falta una. Que diga 99% hasta que sea 100
    // de verdad.
    const pct = Math.floor((cargadas / TOTAL) * 100);
    if (barra) barra.style.transform = `scaleX(${cargadas / TOTAL})`;
    if (porcentaje) porcentaje.textContent = pct + "%";
  }

  /* ------------------------------------------------------------------------
     6. DIBUJO
     ------------------------------------------------------------------------ */

  // El canvas tiene dos tamaños: el que ocupa en pantalla (CSS) y el de su
  // grilla de píxeles (width/height). En pantallas retina hay que hacer la
  // grilla más grande, si no el render se ve borroso.
  function medirCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // tope en 2: más no se nota y cuesta
    const caja = canvas.getBoundingClientRect();
    canvas.width = Math.round(caja.width * dpr);
    canvas.height = Math.round(caja.height * dpr);

    // El canvas reescala en calidad baja por defecto, y acá siempre estamos
    // reescalando (el frame viene a 1600 y la caja mide otra cosa). En alta,
    // el filtrado es mejor y los bordes del render dejan de verse dentados.
    // Va DESPUÉS de tocar width/height a propósito: cambiar el tamaño del
    // canvas resetea todo el estado del contexto, incluido esto.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  // Dibuja un frame ajustándolo al canvas tipo "contain": entra entero,
  // centrado, sin deformarse y sin recortarse.
  function dibujar(indice) {
    const img = imagenes[indice];
    if (!img) return; // ese frame no cargó: dejamos el anterior en pantalla

    // Los JPG traen el crema del panel ya incorporado, pero limpiamos igual:
    // si el frame es más angosto que el canvas, no queremos ver restos del
    // frame anterior en los bordes.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const escala = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * escala;
    const h = img.height * escala;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(img, x, y, w, h);
  }

  /* ------------------------------------------------------------------------
     7. MAPEO SCROLL → FRAME
     ------------------------------------------------------------------------ */

  // Solo la usa el panel de diagnóstico: el recorrido real ahora lo
  // calcula ScrollTrigger.
  function progresoDeScroll() {
    const caja = seccion.getBoundingClientRect();

    // Recorrido útil = alto total de la sección menos una pantalla.
    // Ese "menos una pantalla" es porque el panel sticky se queda pegado
    // hasta que el final de la sección toca el final del viewport.
    const recorrido = seccion.offsetHeight - window.innerHeight;
    if (recorrido <= 0) return 0;

    // -caja.top es cuánto se scrolleó desde que la sección tocó el borde
    // superior de la pantalla.
    const avance = -caja.top / recorrido;

    return Math.min(1, Math.max(0, avance)); // lo dejamos entre 0 y 1
  }

  function alScrollear() {
    vecesNativo++;
    // Antirrebote por frame de video: si llegan 40 eventos de scroll entre
    // un repintado y el siguiente, agendamos UN solo redibujo.
    if (pendiente) return;
    pendiente = true;

    requestAnimationFrame(() => {
      pendiente = false;

      const indice = Math.round(progresoDeScroll() * (TOTAL - 1));

      // Si el frame no cambió, no redibujamos: es la optimización que hace
      // que esto no queme CPU al scrollear despacio.
      if (indice === frameActual) return;

      frameActual = indice;
      dibujar(indice);

      // El rótulo va atado al frame, no al scroll: así el texto y la
      // imagen no se pueden desincronizar nunca.
      actualizarFase(numeroDeFrame(indice));

      pintarDebug();
    });
  }

  /* ------------------------------------------------------------------------
     8. ARRANQUE
     ------------------------------------------------------------------------ */

  function mostrarMensaje(texto) {
    if (loader) loader.hidden = true;
    if (!mensaje) return;
    mensaje.textContent = texto;
    mensaje.hidden = false;
  }

  function activarScrubbing() {
    if (loader) loader.hidden = true;
    seccion.classList.add("is-listo");

    medirCanvas();
    dibujar(0);
    frameActual = 0;
    actualizarFase(numeroDeFrame(0));   // arranca con la fase 1 en pantalla

    // ?frame=250 dibuja ese frame directamente, sin scrollear. Para mirar
    // un momento puntual sin tener que cazarlo con el mouse.
    const pedido = new URLSearchParams(location.search).get("frame");
    if (pedido !== null) {
      const indice = Math.min(TOTAL - 1, Math.max(0,
        Math.round((Number(pedido) - FRAME_PRIMERO) / SALTO)));
      frameActual = indice;
      dibujar(indice);
      actualizarFase(numeroDeFrame(indice));
      pintarDebug("modo ?frame= : mostrando " + numeroDeFrame(indice));
      return;   // en modo inspección no se engancha el scroll
    }

    /* ------------------------------------------------------------------
       EL RECORRIDO, AHORA CON SCROLLTRIGGER
       Antes esto era cuenta a mano: leer getBoundingClientRect en cada
       evento de scroll, calcular el porcentaje recorrido y agendar el
       dibujo con requestAnimationFrame. Funcionaba, pero éramos nosotros
       los que manteníamos esa cuenta.

       ScrollTrigger hace lo mismo mejor y en menos líneas:
         · pin      → clava el escenario en pantalla mientras dura la
                      sección. Reemplaza al position:sticky que había en
                      el CSS (por eso .simbio-stage ya no es sticky).
         · scrub    → ata el progreso al scroll en vez de reproducir una
                      animación. Es exactamente este caso de uso.
         · onUpdate → nos da el progreso de 0 a 1 ya calculado.

       El comportamiento es el mismo de antes: arriba de la sección, el
       primer frame; abajo, el último; en el medio, interpolado.
       ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------
       EL MOTOR PRINCIPAL ES EL SCROLL NATIVO (13/08/2026)
       Antes el recorrido lo manejaba SOLO ScrollTrigger, y si por cualquier
       motivo su onUpdate no corría, la animación quedaba clavada en el primer
       cuadro con la página scrolleando normal — exactamente el síntoma que no
       lográbamos cerrar.

       Ahora escuchamos el evento `scroll` del navegador, que siempre llega:
       Lenis mueve el scroll real de la página, así que dispara igual.
       `alScrollear()` calcula el avance con progresoDeScroll() —la cuenta a
       mano, que nunca dejó de estar en este archivo— y dibuja.

       ScrollTrigger queda abajo como SEGUNDO motor: los dos llaman al mismo
       dibujo, y el dibujo se saltea solo si el cuadro no cambió, así que
       tenerlos a los dos no dibuja dos veces ni se pelean. Si uno falla, el
       otro sigue andando. Con ?debug=1 se ve cuál de los dos está moviendo.
       ------------------------------------------------------------------ */
    window.addEventListener("scroll", alScrollear, { passive: true });
    alScrollear();   // por si la página abrió ya scrolleada (F5 a media página)

    // Con ?debug=1 el panel se repinta en cada scroll aunque el cuadro no
    // cambie: es la única forma de ver si los contadores suben.
    if (DEBUG) window.addEventListener("scroll", () => pintarDebug(), { passive: true });

    if (!window.ScrollTrigger) {
      console.warn("[simbio] ScrollTrigger no cargó. Sigue el scroll nativo.");
      return;
    }

    /* SIN `pin` (12/08/2026).
       Al escenario lo clava `position: sticky` desde el CSS. ScrollTrigger
       queda solo para lo que hace bien: decirnos el progreso de 0 a 1.
       Motivo del cambio: con pin, el ensamble dejó de andar. El pin envuelve
       el escenario en un pin-spacer con position:fixed, y eso choca con el
       overflow-x: clip del <html> y con el remontaje de página de Swup.
       Lo de arriba (start/end) igual es exacto: el recorrido útil es el alto
       de la sección menos una pantalla, que es justo lo que dura el sticky. */
    ScrollTrigger.create({
      trigger: seccion,
      start: "top top",
      end: "bottom bottom",
      // true = el progreso sigue al scroll sin retraso. Con un número
      // (por ejemplo 0.5) quedaría un arrastre elástico, pero acá el
      // suavizado ya lo pone Lenis y sumar otro se siente pastoso.
      scrub: true,
      onUpdate: (self) => {
        vecesTrigger++;
        const indice = Math.round(self.progress * (TOTAL - 1));
        if (indice === frameActual) return;   // nada que redibujar

        frameActual = indice;
        dibujar(indice);
        actualizarFase(numeroDeFrame(indice));
        pintarDebug();

        // La pista de scroll cumplió: se va apenas arranca el recorrido.
        if (pista) pista.classList.toggle("is-ida", indice > 2);
      },
    });

    // Al cambiar el tamaño de la ventana: rehacer la grilla de píxeles del
    // canvas y avisarle a ScrollTrigger que recalcule las medidas.
    window.addEventListener("resize", () => {
      medirCanvas();
      dibujar(frameActual < 0 ? 0 : frameActual);
      ScrollTrigger.refresh();
    });

    console.log(
      `[simbio] Listo. ${exitosas} de ${TOTAL} frames cargados. ` +
      `Sección de ${seccion.offsetHeight}px, recorrida con ScrollTrigger.`
    );
    pintarDebug();
  }


  async function iniciar() {
    medirCanvas();

    // Chequeo previo: ¿la página se abrió con doble click (file://) en vez
    // de por un servidor? Chrome trata cada archivo local como un origen
    // distinto y bloquea la carga de las imágenes, así que no se vería
    // NADA y el loader se quedaría girando sin motivo aparente.
    // Mejor decirlo con todas las letras.
    if (location.protocol === "file:") {
      mostrarMensaje(
        "Esta página está abierta como archivo (file://) y el navegador " +
        "bloquea la carga de los frames. Abrila desde un servidor local: " +
        "doble click en tools/servidor.bat, o Live Server desde VS Code."
      );
      console.warn(
        "[simbio] Abierta con file://. Los frames no se pueden cargar así. " +
        "Servila por HTTP (tools/servidor.bat o Live Server)."
      );
      return;
    }

    if (!(await hayFrames())) {
      mostrarMensaje(
        "No encuentro los frames en /assets/simbio/frames-web/. " +
        "Corré tools/optimizar-frames.ps1 para generarlos a partir de los " +
        "PNG originales, y recargá la página."
      );
      return;
    }

    actualizarProgreso();

    // Arrancamos cuando termina la precarga O cuando se acaba la paciencia,
    // lo que pase primero. La precarga sigue corriendo de fondo en el
    // segundo caso: los frames que falten se van completando solos y
    // mientras tanto se ve el último frame bueno.
    const precarga = precargar();
    const salvavidas = new Promise((r) => setTimeout(r, ESPERA_MAXIMA));
    await Promise.race([precarga, salvavidas]);

    activarScrubbing();

    // Cuando la precarga termine de verdad, avisamos si faltaron frames.
    precarga.then(() => {
      if (exitosas < TOTAL) {
        console.warn(
          `[simbio] Cargaron ${exitosas} de ${TOTAL} frames. ` +
          `Los que falten se saltean al dibujar. Revisá que estén todos los ` +
          `archivos ${String(FRAME_PRIMERO).padStart(4, "0")}.jpg … ` +
          `${String(FRAME_ULTIMO).padStart(4, "0")}.jpg en ${CARPETA}`
        );
      }
    });
  }

  iniciar();
};

window.initSimbioScroll();
