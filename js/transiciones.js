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

  /* --- LA NAV TAMBIÉN SE REEMPLAZA ---
     La nav vive FUERA de #swup, así que Swup no la tocaba: al navegar quedaba
     colgada la de la página anterior. Y como sus links son relativos, desde la
     portada entrabas a un proyecto y el botón Home seguía diciendo
     "index.html", que parado en /proyectos/ apunta a /proyectos/index.html
     — un 404. El botón verde de "estás acá" también quedaba en el lugar
     equivocado.
     Poniéndola como segundo contenedor, cada página trae su propia nav con sus
     links y su marca de activa. No se le pega el fade porque el selector de
     animación es [class*="transicion-"] y la nav no lleva esa clase. */
  const swup = new window.Swup({
    containers: ["#swup", ".site-nav"],
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
    if (typeof window.initTipines === "function") window.initTipines();

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();

    /* --- DÓNDE QUEDA PARADA LA PÁGINA NUEVA ---
       Antes esto era siempre scrollTo(0). El problema: los botones de la nav
       de un proyecto apuntan a "../index.html#sobre", y Swup navega sin
       recargar, así que el navegador nunca hace el salto al ancla — lo hacía
       este archivo, y lo mandaba al tope. Entrabas a la portada arriba de
       todo y el botón parecía roto, cuando el link estaba bien.
       Ahora: si la URL trae un ancla que existe, se va ahí; si no, al tope. */
    const ancla = window.location.hash.slice(1);
    const destino = ancla ? document.getElementById(ancla) : null;
    irA(destino);
  });

  /* El aire que se deja por encima de la sección para que la nav fija no le
     tape la primera línea. Es el mismo valor que el scroll-margin-top de
     archivo.css (--s-7 = 3rem = 48px); Lenis no lee scroll-margin, hay que
     dárselo a mano. Si cambia uno, cambiá el otro. */
  const AIRE_NAV = 48;

  function irA(destino) {
    if (window.lenis) {
      // Un número, no el elemento: ver la nota en smooth-scroll.js.
      const y = destino
        ? destino.getBoundingClientRect().top + window.scrollY - AIRE_NAV
        : 0;
      window.lenis.scrollTo(y, { immediate: true });
    } else if (destino) {
      destino.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

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
