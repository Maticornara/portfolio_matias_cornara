/* ==========================================================================
   ARCHIVO.JS — LA ESQUINA DEL HERO
   --------------------------------------------------------------------------
   Lo único que hace este archivo es mover el punto de fuga de las tres
   líneas del hero. Nada más.

   CÓMO ESTÁ REPARTIDO EL TRABAJO
   La geometría NO vive acá. Las tres líneas son barras rotadas un ángulo fijo
   por CSS y la caja es un SVG anclado a un punto: todo eso cuelga de un solo
   div de 0x0 —`.esquina`— parado en el vértice del cuarto. Este script lo
   único que hace es correr ese div unos pocos píxeles, y con él se mueve el
   conjunto entero de una pieza.

   Eso quiere decir tres cosas:
     · si el JS no carga, o si el sistema pide menos movimiento, la esquina se
       ve igual: quieta, en el lugar que dice el CSS.
     · nada se puede desalinear entre sí, porque no hay dos cosas moviéndose
       en paralelo: hay una.
     · para mover la esquina de lugar se tocan --fuga-x y --fuga-y en
       archivo.css. Este archivo no hay que tocarlo.

   POR QUÉ NO USA GSAP, SI ESTÁ CARGADO
   GSAP está en el sitio para lo que se engancha al scroll (el ensamble de
   Simbio). Esto no depende del scroll: es un loop de fondo que corre solo.
   Con dos senos y requestAnimationFrame son diez líneas, se lee de arriba a
   abajo, y sigue funcionando aunque el CDN de GSAP no conteste.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     PERILLAS
     ------------------------------------------------------------------ */

  const ESQUINA = {
    /* Cuánto se corre el punto de fuga, en unidades del lienzo del SVG
       (que va de 0 a 100, o sea: 1 = 1% del hero).
       Es a propósito un recorrido cortísimo: a simple vista no se ve que
       algo se mueva, se ve que la imagen está viva. Arriba de 3 empieza a
       notarse el movimiento y pasa a ser un efecto. */
    ampX: 1.6,
    ampY: 1.1,

    /* Cuánto tarda cada eje en hacer el viaje de ida y vuelta, en segundos.
       SON DISTINTOS A PROPÓSITO Y NO SON MÚLTIPLOS: como no coinciden, el
       punto nunca repite el mismo recorrido y nunca se lee el ciclo. Si los
       dos fueran 16, el punto iría y volvería siempre por la misma diagonal
       y se notaría el loop. */
    cicloX: 17,
    cicloY: 11,
  };

  /* ------------------------------------------------------------------
     EL LOOP
     ------------------------------------------------------------------ */

  const sinMovimiento =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TAU = Math.PI * 2;

  function initEsquina() {
    const esquina = document.querySelector("[data-esquina]");
    if (!esquina) return;

    /* SE MUEVE UN SOLO ELEMENTO Y SE MUEVE TODO.
       Las tres líneas y la caja cuelgan de `.esquina`, que mide 0x0 y está
       parada en el vértice del cuarto. Mover el vértice es mover ese div:
       no hay ninguna coordenada que recalcular ni nada que pueda quedar
       desalineado entre sí. */

    // El punto de reposo se lee del CSS, que es donde vive la perilla. Así
    // el número está escrito en un solo lugar y el JS solo le suma el vaivén.
    const cs = getComputedStyle(esquina);
    const baseX = parseFloat(cs.getPropertyValue("--fuga-x"));
    const baseY = parseFloat(cs.getPropertyValue("--fuga-y"));
    if (Number.isNaN(baseX) || Number.isNaN(baseY)) return;

    // Con movimiento reducido no se arranca nada: la esquina se queda donde
    // la dejó el CSS y listo.
    if (sinMovimiento) return;

    // Swup vuelve a llamar a este init sin recargar la página. La marca va
    // en el elemento y no en una variable del módulo: si es el mismo de antes
    // no se arranca un segundo loop encima, y si es uno nuevo (porque Swup
    // reemplazó el contenido) sí se anima.
    if (esquina.dataset.esquinaViva) return;
    esquina.dataset.esquinaViva = "1";

    /* El hero es lo primero de la página, así que apenas se scrollea queda
       fuera de pantalla. Mientras no se vea, el loop no escribe nada: no
       tiene sentido gastar batería animando algo que nadie está mirando.
       Se observa al HERO y no a la esquina, porque la esquina mide 0x0 y un
       elemento sin superficie nunca dispara al observador. */
    let aLaVista = true;
    const hero = esquina.closest(".portada-hero") || esquina;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entradas) => {
        aLaVista = entradas[0].isIntersecting;
      }).observe(hero);
    }

    const arranque = performance.now();

    function pintar(ahora) {
      // Si Swup se llevó la esquina, el loop se corta acá: sin volver a pedir
      // el cuadro siguiente, la función deja de existir. Sin esto quedaría
      // corriendo para siempre sobre un nodo que ya no está en la página.
      if (!esquina.isConnected) return;

      requestAnimationFrame(pintar);
      if (!aLaVista) return;

      const s = (ahora - arranque) / 1000;

      // Dos senos con períodos distintos: el punto describe una figura
      // abierta en vez de un vaivén en línea recta.
      const x = baseX + Math.sin((s / ESQUINA.cicloX) * TAU) * ESQUINA.ampX;
      const y = baseY + Math.sin((s / ESQUINA.cicloY) * TAU) * ESQUINA.ampY;

      esquina.style.setProperty("--fuga-x", x.toFixed(3));
      esquina.style.setProperty("--fuga-y", y.toFixed(3));
    }

    requestAnimationFrame(pintar);
  }

  // Swup reemplaza el contenido sin recargar y los scripts no se vuelven a
  // ejecutar: transiciones.js llama a esto de nuevo en cada navegación.
  window.initArchivoEsquina = initEsquina;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEsquina);
  } else {
    initEsquina();
  }
})();
