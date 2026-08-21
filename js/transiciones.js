/* ==========================================================================
   TRANSICIONES.JS — Swup
   Al navegar entre páginas, en vez del corte del navegador hay un fade de
   salida y otro de entrada.

   POR QUÉ IMPORTA ACÁ MÁS QUE EN OTRO SITIO
   La ficha del índice se entra sosteniendo el hover: el boceto se disuelve
   en la imagen real y, cuando la barra se completa, se entra al proyecto.
   Con la recarga normal, ese gesto terminaba en un parpadeo blanco. Con el
   fade, la página se desvanece igual que se desvaneció el boceto — se lee
   como la continuación del mismo movimiento, no como un corte.

   EL PROBLEMA QUE HAY QUE RESOLVER SIEMPRE CON ESTE TIPO DE NAVEGACIÓN
   Swup reemplaza el contenido sin recargar la página, así que los scripts
   NO se vuelven a ejecutar. Todo lo que se enganchó al DOM viejo queda
   colgando. Por eso cada módulo del sitio expone su init y acá los
   volvemos a llamar después de cada navegación.
   ========================================================================== */

(function () {
  "use strict";

  if (typeof window.Swup === "undefined") {
    console.warn("[transiciones] Swup no cargó. Navegación normal.");
    return;
  }

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const swup = new window.Swup({
    containers: ["#swup"],
    // El selector de lo que se anima. Tiene que coincidir con la clase del
    // contenedor en el HTML y con el CSS de base.css.
    animationSelector: '[class*="transicion-"]',
    // Con movimiento reducido no hay animación que esperar: el cambio es
    // inmediato y Swup no retiene la navegación.
    animateHistoryBrowsing: !sinMovimiento,
  });

  window.swup = swup;

  /* --- REARMAR TODO DESPUÉS DE CADA NAVEGACIÓN ---
     El orden importa: primero los módulos generales, después los de la
     página, y al final que ScrollTrigger recalcule las medidas — si no,
     sigue creyendo que la página mide lo que medía la anterior. */
  /* --- LA CLASE DEL <body> ---
     Swup reemplaza SOLO lo que hay adentro de #swup: el <body> es el mismo
     de la página anterior, con su clase intacta. O sea que al entrar a un
     proyecto desde la portada, el body seguía diciendo "pag-archivo" y todo
     el CSS que cuelga de .pag-54 o .pag-simbio no se aplicaba. La página se
     veía bien SOLO si se entraba con un refresh, que es justo el caso que
     uno prueba y el que menos pasa de verdad.

     La solución no depende de Swup: cada página declara en su <main> qué
     clase y qué cursor le corresponden al body (data-body / data-cursor-pag),
     y acá se copian. Si una página no los declara, no se toca nada. */
  swup.hooks.on("page:view", () => {
    const cont = document.querySelector("#swup");
    if (cont && cont.dataset.body) document.body.className = cont.dataset.body;
    if (cont && cont.dataset.cursorPag) {
      document.body.dataset.cursor = cont.dataset.cursorPag;
    } else {
      delete document.body.dataset.cursor;
    }

    if (typeof window.initComunes === "function") window.initComunes();
    if (typeof window.initArchivoEsquina === "function") window.initArchivoEsquina();
    if (typeof window.initSimbioScroll === "function") window.initSimbioScroll();
    if (typeof window.initMuestras === "function") window.initMuestras();
    if (typeof window.init54 === "function") window.init54();

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();

    // Lenis mantiene su propia posición de scroll: hay que devolverla a cero
    // en la página nueva, si no se entra a mitad de camino.
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
  });

  /* --- LIMPIEZA ANTES DE IRSE ---
     Los ScrollTrigger de la página que se va apuntan a elementos que están
     por desaparecer. Si no se matan, quedan vivos midiendo nodos huérfanos.
     El cursor y sus mostacillas viven fuera del contenedor, así que esos no
     se tocan. */
  swup.hooks.on("visit:start", () => {
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((t) => t.kill());
    }
  });
})();
