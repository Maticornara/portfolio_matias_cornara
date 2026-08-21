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
})();
