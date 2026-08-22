/* ==========================================================================
   MUSEO-SCROLL.JS
   Las tres animaciones de Mobiliario de Museo controladas por scroll.

   HERMANO DE simbio-scroll.js, no una copia. Dos diferencias de fondo:

   1) ACÁ HAY TRES ANIMACIONES EN UNA MISMA PÁGINA. simbio-scroll.js está
      escrito para una sola: agarra el canvas con querySelector y guarda el
      estado en variables sueltas del módulo. Con tres, ese estado se
      pisaría. Por eso todo lo de una animación vive adentro de crearAnim(),
      y la página crea tres.

   2) LA VELOCIDAD PUEDE CAMBIAR POR TRAMO. En Simbio el scroll avanza los
      frames parejo de punta a punta. Acá la rotación de Descanso (frames 46
      a 112) tiene que verse más rápida que el resto, así que el mapeo de
      scroll a frame es por tramos y no lineal. Está explicado abajo, en
      frameSegunAvance().

   LO QUE SÍ ES IGUAL QUE SIMBIO, a propósito:
   - El escenario se clava con position:sticky desde el CSS, NO con el pin
     de ScrollTrigger (el pin choca con Swup y con el overflow del html).
   - El rótulo de fase: número "01 / 03" y el título tipeado letra por letra,
     borrando solo hasta donde dejan de coincidir las dos frases.
   - El dibujo se saltea si el cuadro no cambió.
   - Se expone como window.initMuseoScroll para que Swup lo pueda volver a
     llamar después de cada navegación.
   ========================================================================== */

window.initMuseoScroll = function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. LAS TRES SECUENCIAS
     Los rangos de fase son los que verificamos cuadro por cuadro contra los
     renders. Los dos extremos entran (inclusive).

     nombre: null  -> es un INTERLUDIO. No lleva número ni título, y el
                      rótulo se esconde mientras dura. Se usa para el tramo
                      de rotación de Descanso, que no tiene texto.

     veloc:  1 = ritmo normal. 2 = se ve al doble de velocidad, porque
             consume la mitad de scroll. Es la perilla del pedido "esta
             parte tiene que ir más rápido que el resto".
     ------------------------------------------------------------------------ */

  const SECUENCIAS = {
    descanso: {
      carpeta: "../assets/mobiliario-museo/frames-descanso/",
      primero: 0,
      ultimo: 296,
      salto: 1,
      fases: [
        { nombre: "Doble Asiento con Respaldo",     inicio: 0,   fin: 45,  veloc: 1 },
        { nombre: null,                             inicio: 46,  fin: 112, veloc: 2 },
        { nombre: "Respaldo Movible para Rotación", inicio: 113, fin: 172, veloc: 1 },
        { nombre: "Cambio de Respaldo a Apoyo",     inicio: 173, fin: 296, veloc: 1 },
      ],
    },

    exposicion: {
      carpeta: "../assets/mobiliario-museo/frames-exposicion/",
      primero: 0,
      ultimo: 337,
      salto: 1,
      fases: [
        { nombre: "Módulo Superior Versátil para la altura del Visitante", inicio: 0,   fin: 60,  veloc: 1 },
        { nombre: "Cajones con Apertura por Pivoteo",                      inicio: 61,  fin: 210, veloc: 1 },
        { nombre: "Vidrieras Individuales para exposición de insectos",    inicio: 211, fin: 337, veloc: 1 },
      ],
    },

    comunicacion: {
      carpeta: "../assets/mobiliario-museo/frames-comunicacion/",
      primero: 0,
      ultimo: 373,
      // SALTO 2: esta secuencia es la más pesada de las tres (374 cuadros,
      // 53 MB, contra 20 y 23 de las otras). Con salto 2 se usan 187 y baja
      // a la mitad la memoria, que con tres animaciones en una sola página
      // es lo que más aprieta. El movimiento no sufre: el scroll ya
      // interpola visualmente. Poner 1 si algún día sobra presupuesto.
      salto: 2,
      fases: [
        { nombre: "Disposición de la Información",                         inicio: 0,   fin: 86,  veloc: 1 },
        { nombre: "Módulo de Pancarta Giratoria",                          inicio: 87,  fin: 225, veloc: 1 },
        { nombre: "Módulo Superior Versátil para la altura del Visitante", inicio: 226, fin: 373, veloc: 1 },
      ],
    },
  };

  // Cuántas imágenes se piden a la vez. Ni de a una (lentísimo) ni todas
  // juntas (el navegador se satura y las resuelve en cualquier orden).
  const CARGAS_EN_PARALELO = 8;
  const TIMEOUT_IMAGEN = 12000;

  // Cuánto antes de llegar empieza a bajar los frames. 60% de pantalla de
  // anticipo alcanza para que estén listos cuando la sección entra.
  const ANTICIPO = "60% 0px";

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DEBUG = new URLSearchParams(location.search).has("debug");

  const VEL_BORRAR = 22;    // ms por letra al borrar
  const VEL_ESCRIBIR = 45;  // ms por letra al escribir


  /* ------------------------------------------------------------------------
     2. UNA ANIMACIÓN
     Todo el estado de UNA secuencia vive acá adentro. La página llama a
     esto tres veces y las tres no se conocen entre sí.
     ------------------------------------------------------------------------ */

  function crearAnim(seccion, config) {
    const canvas = seccion.querySelector("[data-museo-canvas]");
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    const loader = seccion.querySelector("[data-museo-loader]");
    const barra = seccion.querySelector("[data-museo-barra]");
    const porcentaje = seccion.querySelector("[data-museo-porcentaje]");
    const cajaFase = seccion.querySelector("[data-museo-fase-caja]");
    const salidaNum = seccion.querySelector("[data-museo-fase-num]");
    const salidaNombre = seccion.querySelector("[data-museo-fase-nombre]");

    const { carpeta, primero, ultimo, salto, fases } = config;

    // Cuántas imágenes manejamos de verdad, ya contando el salto.
    const TOTAL = Math.floor((ultimo - primero) / salto) + 1;
    const numeroDeFrame = (i) => primero + i * salto;
    const rutaDeFrame = (n) => carpeta + String(n).padStart(4, "0") + ".jpg";

    const imagenes = new Array(TOTAL).fill(null);
    let cargadas = 0;
    let exitosas = 0;
    let frameActual = -1;
    let pendiente = false;
    let arrancado = false;

    /* --- El reparto del scroll entre las fases --------------------------
       Cada fase pesa lo que ocupa en scroll. Por defecto ese peso es su
       cantidad de cuadros, que da el movimiento parejo de siempre. Al
       dividir por `veloc`, la fase se lleva MENOS scroll para los mismos
       cuadros: los mismos frames pasan en menos recorrido, o sea más
       rápido. Con veloc 2 se ve al doble de velocidad.

       Ejemplo real (Descanso): la rotación son 67 cuadros con veloc 2, así
       que pesa 33,5 en vez de 67. Sobre un total de 264,5, se lleva el 13%
       del scroll en vez del 23%.                                          */
    const pesos = fases.map((f) => (f.fin - f.inicio + 1) / (f.veloc || 1));
    const pesoTotal = pesos.reduce((a, b) => a + b, 0);

    // Dado el avance 0..1 del scroll, qué número de frame toca.
    function frameSegunAvance(avance) {
      let objetivo = avance * pesoTotal;
      for (let i = 0; i < fases.length; i++) {
        if (objetivo <= pesos[i] || i === fases.length - 1) {
          const dentro = Math.min(1, Math.max(0, objetivo / pesos[i]));
          const f = fases[i];
          return Math.round(f.inicio + dentro * (f.fin - f.inicio));
        }
        objetivo -= pesos[i];
      }
      return ultimo;
    }

    function faseDeFrame(n) {
      return fases.find((f) => n >= f.inicio && n <= f.fin) || null;
    }

    /* --- El rótulo, con el tipeo letra por letra ------------------------
       Igual que Simbio: no borra todo y reescribe, sino que busca hasta
       dónde coinciden el texto viejo y el nuevo y borra solo desde ahí. */

    let textoMostrado = "";
    let textoObjetivo = "";
    let relojTexto = null;
    let faseActual = null;

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
        textoMostrado = textoMostrado.slice(0, -1);
        espera = VEL_BORRAR;
      } else if (textoMostrado.length < textoObjetivo.length) {
        textoMostrado = textoObjetivo.slice(0, textoMostrado.length + 1);
        espera = VEL_ESCRIBIR;
      } else {
        return;
      }

      if (salidaNombre) salidaNombre.textContent = textoMostrado;
      relojTexto = window.setTimeout(pasoTexto, espera);
    }

    function escribirFase(texto) {
      if (texto === textoObjetivo) return;
      textoObjetivo = texto;

      if (sinMovimiento) {
        textoMostrado = texto;
        if (salidaNombre) salidaNombre.textContent = texto;
        return;
      }
      // Si ya hay un timer corriendo, no arrancamos otro: el que corre va a
      // leer el objetivo nuevo en su próximo paso. Sin esta guarda, dos
      // cambios seguidos dejan dos animaciones peleando por la misma línea.
      if (!relojTexto) pasoTexto();
    }

    function actualizarFase(n) {
      const fase = faseDeFrame(n);
      if (!fase || fase === faseActual) return;
      faseActual = fase;

      // Interludio: sin número ni título, y el rótulo entero se esconde.
      // Es el tramo de rotación de Descanso. Si mostrara "02 / 04" con el
      // título vacío se leería como un error.
      if (!fase.nombre) {
        if (cajaFase) cajaFase.classList.add("is-oculto");
        escribirFase("");
        return;
      }

      if (cajaFase) cajaFase.classList.remove("is-oculto");
      escribirFase(fase.nombre);

      // La numeración cuenta SOLO las fases con título, así que la de
      // Descanso va 01/03, 02/03 y 03/03 y no se saltea ningún número.
      const conTitulo = fases.filter((f) => f.nombre);
      const indice = conTitulo.indexOf(fase);
      if (salidaNum) {
        salidaNum.textContent =
          String(indice + 1).padStart(2, "0") + " / " + String(conTitulo.length).padStart(2, "0");
      }
    }

    /* --- Carga de imágenes --------------------------------------------- */

    // Nunca rechaza y siempre termina: si el archivo no está resuelve con
    // null, y si el pedido se cuelga lo abandona a los 12 segundos. Sin el
    // timeout, una sola request que no contesta deja el loader clavado.
    function cargarUna(indice) {
      return new Promise((resolver) => {
        const img = new Image();
        let cerrado = false;

        const terminar = (ok) => {
          if (cerrado) return;
          cerrado = true;
          cargadas++;
          if (ok) { exitosas++; imagenes[indice] = img; }
          actualizarProgreso();
          resolver();
        };

        const reloj = window.setTimeout(() => terminar(false), TIMEOUT_IMAGEN);
        img.onload = () => { window.clearTimeout(reloj); terminar(true); };
        img.onerror = () => { window.clearTimeout(reloj); terminar(false); };
        img.src = rutaDeFrame(numeroDeFrame(indice));
      });
    }

    function actualizarProgreso() {
      const pct = Math.round((cargadas / TOTAL) * 100);
      if (barra) barra.style.width = pct + "%";
      if (porcentaje) porcentaje.textContent = pct + "%";
    }

    async function precargar() {
      for (let i = 0; i < TOTAL; i += CARGAS_EN_PARALELO) {
        const tanda = [];
        for (let j = i; j < Math.min(i + CARGAS_EN_PARALELO, TOTAL); j++) {
          tanda.push(cargarUna(j));
        }
        await Promise.all(tanda);

        // Apenas hay con qué dibujar, se muestra: es preferible una
        // animación que arranca incompleta a un loader clavado.
        if (!arrancado && exitosas > 6) {
          arrancado = true;
          if (loader) loader.classList.add("is-listo");
          alScrollear();
        }
      }
      if (loader) loader.classList.add("is-listo");
    }

    /* --- Dibujo --------------------------------------------------------- */

    function medirCanvas() {
      const caja = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(caja.width * dpr);
      canvas.height = Math.round(caja.height * dpr);
    }

    function dibujar(indice) {
      const img = imagenes[indice];
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // "contain": la pieza entra entera, sin recortarse ni deformarse.
      const escala = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * escala;
      const h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function progresoDeScroll() {
      const caja = seccion.getBoundingClientRect();
      // El recorrido útil es el alto de la sección menos una pantalla:
      // es justo lo que dura el sticky del escenario.
      const recorrido = seccion.offsetHeight - window.innerHeight;
      if (recorrido <= 0) return 0;
      return Math.min(1, Math.max(0, -caja.top / recorrido));
    }

    function alScrollear() {
      if (pendiente) return;
      pendiente = true;

      requestAnimationFrame(() => {
        pendiente = false;

        const numero = frameSegunAvance(progresoDeScroll());
        // De número de frame a índice del array, respetando el salto.
        const indice = Math.min(TOTAL - 1, Math.max(0, Math.round((numero - primero) / salto)));

        if (indice === frameActual) return;   // el cuadro no cambió: no redibujamos
        frameActual = indice;

        dibujar(indice);
        // El rótulo va atado al frame y no al scroll: así el texto y la
        // imagen no se pueden desincronizar nunca.
        actualizarFase(numeroDeFrame(indice));
      });
    }

    /* --- Arranque ------------------------------------------------------- */

    medirCanvas();
    window.addEventListener("resize", () => {
      medirCanvas();
      if (frameActual >= 0) dibujar(frameActual);
    });
    window.addEventListener("scroll", alScrollear, { passive: true });

    if (DEBUG) {
      console.log("[museo] " + seccion.dataset.museoAnim +
                  ": " + TOTAL + " cuadros (salto " + salto + "), " +
                  fases.filter((f) => f.nombre).length + " fases con título");
    }

    return { precargar, alScrollear };
  }


  /* ------------------------------------------------------------------------
     3. ARMADO DE LAS TRES
     Las secuencias NO se bajan todas al abrir la página: son 96 MB entre
     las tres. Cada una empieza a cargar cuando su sección se está por
     asomar, y por eso el observer con ANTICIPO de anticipo.
     ------------------------------------------------------------------------ */

  const secciones = document.querySelectorAll("[data-museo-anim]");
  if (!secciones.length) return;   // no estamos en la página de Museo

  secciones.forEach((seccion) => {
    const clave = seccion.dataset.museoAnim;
    const config = SECUENCIAS[clave];
    if (!config) {
      console.warn("[museo] no conozco la secuencia '" + clave + "'");
      return;
    }

    const anim = crearAnim(seccion, config);
    if (!anim) return;

    // Sin IntersectionObserver (navegador viejo): se carga y listo.
    if (!("IntersectionObserver" in window)) { anim.precargar(); return; }

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        observador.disconnect();   // una sola vez: ya está cargando
        anim.precargar();
      });
    }, { rootMargin: ANTICIPO });

    observador.observe(seccion);
  });
};

// Primer arranque. Después de esto, quien lo vuelve a llamar es
// transiciones.js en cada navegación de Swup.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initMuseoScroll);
} else {
  window.initMuseoScroll();
}
