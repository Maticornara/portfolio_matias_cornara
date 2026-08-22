/* ==========================================================================
   SMOOTH-SCROLL.JS
   Lenis (scroll suave) + GSAP/ScrollTrigger, sincronizados.

   Va en TODAS las páginas y tiene que cargar ANTES que cualquier otro
   script que use ScrollTrigger, porque acá se registra el plugin y se
   arma el puente entre los dos sistemas.

   POR QUÉ HAY QUE SINCRONIZARLOS
   Lenis no scrollea la página de golpe: interpola la posición cuadro a
   cuadro. ScrollTrigger, por su lado, tiene su propio reloj para saber
   cuánto se scrolleó. Si cada uno corre por su cuenta, van medio cuadro
   desfasados y el scrubbing tiembla.
   La solución es el patrón oficial: Lenis avisa a ScrollTrigger cada vez
   que mueve la página, y GSAP pasa a ser el único reloj de los dos.
   ========================================================================== */

(function () {
  "use strict";

  // Si por lo que sea las librerías no cargaron (sin internet, CDN caído),
  // no rompemos nada: la página queda con scroll normal del navegador.
  if (typeof window.Lenis === "undefined" || typeof window.gsap === "undefined") {
    console.warn("[scroll] Lenis o GSAP no cargaron. Scroll nativo.");
    return;
  }

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Si el usuario pidió menos movimiento, el scroll suave es justamente lo
  // que molesta: lo dejamos nativo.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    console.info("[scroll] Movimiento reducido: scroll nativo.");
    return;
  }

  const lenis = new Lenis({
    // Cuánto tarda en alcanzar el destino. Más alto = más deslizado.
    // 1.1 es suave sin sentirse pesado ni "resbaloso".
    duration: 1.1,
    smoothWheel: true,
    // El touch NO se suaviza: en mobile el scroll del sistema ya tiene su
    // propia inercia y superponerle otra se siente raro y con retraso.
    smoothTouch: false,
  });

  // Lo dejamos accesible por si otro módulo necesita frenar o reanudar el
  // scroll (por ejemplo, al abrir una transición a pantalla completa).
  window.lenis = lenis;

  /* --- EL PUENTE CON GSAP (patrón oficial de Lenis) --- */

  if (window.ScrollTrigger) {
    // 1. Cada vez que Lenis mueve la página, ScrollTrigger se entera.
    lenis.on("scroll", ScrollTrigger.update);
  }

  // 2. GSAP pasa a manejar el reloj de Lenis. Antes cada uno tenía su
  //    propio requestAnimationFrame; ahora hay uno solo y van en fase.
  //    El *1000 es porque el ticker de GSAP da segundos y Lenis pide ms.
  gsap.ticker.add((time) => lenis.raf(time * 1000));

  // 3. Sin suavizado de lag: si un cuadro tarda de más, GSAP normalmente
  //    "amortigua" el salto. Para un scrubbing atado al scroll eso se ve
  //    como que la animación se atrasa respecto del dedo.
  gsap.ticker.lagSmoothing(0);

  /* --- LOS LINKS A UNA SECCIÓN DE ESTA MISMA PÁGINA ---
     Los botones de la nav (#sobre, #trabajos, #contacto) los resolvía el
     navegador con su propio salto suave (scroll-behavior: smooth, base.css).
     Pero acá el que manda el scroll es Lenis: los dos empujan la página al
     mismo tiempo y el salto se traba a mitad de camino, o llega y rebota.
     Se veía como que el botón "no linkea bien".

     La solución es que el ancla pase por Lenis, que es el que lleva la
     cuenta. El listener va en document —no en cada <a>— para que sobreviva a
     Swup, que reemplaza la nav entera en cada navegación.

     El aire de arriba tiene que coincidir con el scroll-margin-top de
     archivo.css (--s-7 = 3rem = 48px): Lenis no lee scroll-margin. Si cambia
     uno, cambiá el otro. El mismo número está en transiciones.js. */
  const AIRE_NAV = 48;

  /* A Lenis se le pasa un NÚMERO, no el elemento. Pasándole el elemento, el
     resultado no era el mismo para todas las secciones: tres caían clavadas a
     48px del tope y #sobre a 96, porque Lenis resuelve la posición a su manera
     y ahí se cruzan el scroll-margin del CSS y el offset que le damos acá.
     La cuenta a mano —dónde está la sección respecto del documento, menos el
     aire de la nav— no tiene esa ambigüedad y da igual para todas. */
  function posicionDe(el) {
    return el.getBoundingClientRect().top + window.scrollY - AIRE_NAV;
  }

  /* --- ENTRAR DIRECTO A UNA SECCIÓN (index.html#sobre) ---
     Cuando la página se abre CON un ancla en la URL —un refresh, un link
     pegado, o venir desde una página de proyecto sin que Swup se meta— el
     salto lo hace el navegador apenas parsea el HTML. Pero Lenis arranca
     leyendo la posición del scroll y escribiéndola cada cuadro, así que ese
     salto lo pisaba y la página quedaba arriba de todo. Medido: entrar a
     index.html#sobre te dejaba en el hero.
     Lo hacemos al "load" Y ADEMÁS esperando a las tipografías, no antes: la
     sección solo está en su altura de verdad cuando las imágenes tienen su
     tamaño definitivo y Archivo ya reemplazó a la de reserva. Medido: sin
     esperar a la fuente, #sobre caía 46px más abajo de la cuenta, porque el
     texto de arriba se reacomoda cuando la familia entra (display=swap). */
  window.addEventListener("load", () => {
    const ancla = window.location.hash.slice(1);
    if (!ancla) return;
    const irAlAncla = () => {
      const destino = document.getElementById(ancla);
      if (destino) lenis.scrollTo(posicionDe(destino), { immediate: true });
    };
    if (document.fonts) document.fonts.ready.then(irAlAncla);
    else irAlAncla();
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || link.target === "_blank") return;

    // Solo las anclas de ESTA página. Las que van a otra (por ejemplo
    // "../index.html#sobre") son navegación: las maneja Swup, y de
    // posicionarlas al llegar se encarga transiciones.js.
    if (link.pathname !== window.location.pathname) return;

    const destino = link.hash.length > 1
      ? document.getElementById(link.hash.slice(1))
      : null;
    if (!destino) return;

    e.preventDefault();
    lenis.scrollTo(posicionDe(destino));
    history.pushState(null, "", link.hash);
  });
})();
