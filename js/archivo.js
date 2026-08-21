/* ==========================================================================
   ARCHIVO.JS — LA ESQUINA DEL HERO
   --------------------------------------------------------------------------
   Dos cosas, y nada más:
     · el desenfoque de la ilustración a medida que el hero sale de pantalla
       (esto es lo que corre hoy);
     · un vaivén lento del punto de fuga, que está APAGADO — ver la perilla
       `activo` acá abajo.

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

   POR QUÉ UNA COSA USA GSAP Y LA OTRA NO
   El desenfoque va con GSAP porque depende del scroll, y "scrub" —seguir al
   dedo, y volver atrás si se sube— ya está resuelto ahí, con el puente a
   Lenis hecho en smooth-scroll.js.
   El vaivén no depende del scroll: es un loop de fondo. Con un seno y
   requestAnimationFrame son diez líneas, se lee de arriba a abajo, y sigue
   funcionando aunque el CDN de GSAP no conteste.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     PERILLAS
     ------------------------------------------------------------------ */

  const ESQUINA = {
    /* ¿CORRE EL VAIVÉN? Hoy NO.
       El movimiento de subir y bajar está apagado a pedido. El código queda
       entero y probado: se vuelve a encender poniendo `true` acá y no hay
       nada más que tocar. Apagado, la esquina se ve exactamente como la deja
       el CSS, quieta. */
    activo: false,

    /* Cuánto sube y baja el rincón, EN PÍXELES.
       Antes el punto de fuga hacía un recorrido en dos ejes, con dos
       períodos distintos, y se leía como un movimiento errático: la esquina
       se iba para cualquier lado. Ahora es un solo movimiento, de arriba
       abajo y de vuelta, que es lo que hace una cámara que respira. */
    recorrido: 14,

    /* CUÁNTO CAMBIA EL PUNTO DE VISTA. Es la mitad interesante.
       No alcanza con subir y bajar: si el dibujo se mueve entero y rígido,
       parece un sticker deslizándose. Lo que hace que se lea como una cámara
       es que al subir se vea MÁS el piso (las diagonales se abren, la tapa
       de la caja se ve más grande, los laterales se acortan) y al bajar,
       menos.

       Eso se consigue con un solo número: un estirón vertical de todo el
       bloque. Como se escala TODO junto —las tres líneas y la caja—, la
       geometría se mantiene exacta durante toda la animación: la pendiente
       de las diagonales y la de las aristas de la caja se multiplican por lo
       mismo y siguen coincidiendo.

       0.055 = el ángulo del piso va de 25,2° a 27,9°. Arriba de 0.09 se
       empieza a notar que la caja se deforma. */
    perspectiva: 0.055,

    /* Segundos del ciclo completo, ida y vuelta. Largo a propósito: tiene
       que ser ambiente, no un efecto. */
    ciclo: 14,
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

    /* SE MUEVE CON `transform`, NO CON `left`/`top`. ACÁ ESTABA EL TIRÓN.
       Escribir left/top en cada cuadro obliga al navegador a rehacer el
       LAYOUT de la página entera 60 veces por segundo, y con el hero a
       pantalla completa eso se siente como un temblor.
       `transform` no toca el layout: el navegador rasteriza la esquina una
       sola vez, la guarda como una capa aparte (por eso el will-change del
       CSS) y después solo la corre de lugar. Es trabajo de la placa de video
       en vez del procesador.
       Otra ventaja: el punto de reposo queda intacto en el CSS
       (--fuga-x / --fuga-y) porque el transform es un corrimiento RELATIVO. */

    // Con movimiento reducido no se arranca nada: la esquina se queda donde
    // la dejó el CSS y listo.
    if (sinMovimiento || !ESQUINA.activo) return;

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

      const seg = (ahora - arranque) / 1000;

      // UN solo seno manda las dos cosas, y por eso se leen como una sola:
      // el rincón baja y al mismo tiempo se abre, sube y se cierra.
      const f = Math.sin((seg / ESQUINA.ciclo) * TAU);

      const y = f * ESQUINA.recorrido;
      const escala = 1 + f * ESQUINA.perspectiva;

      // translate3d y no translate: el "3d", aunque la z sea 0, es lo que le
      // pide al navegador que trate esto como una capa propia y lo mueva sin
      // volver a dibujarlo.
      esquina.style.transform =
        "translate3d(0," + y.toFixed(2) + "px,0) scaleY(" + escala.toFixed(4) + ")";
    }

    requestAnimationFrame(pintar);
  }

  /* ------------------------------------------------------------------
     LA ILUSTRACIÓN SE DESENFOCA AL BAJAR
     --------------------------------------------------------------------
     A medida que el hero sale de pantalla, el rincón pierde foco: es la
     portada pasando a segundo plano.

     ACÁ SÍ SE USA GSAP, al revés que el vaivén de arriba. La diferencia es
     que esto SÍ depende del scroll, y "scrub" es justamente lo que hace
     falta: el desenfoque sigue al dedo cuadro a cuadro y también vuelve
     atrás si se sube. Escrito a mano habría que resolver el scroll suave de
     Lenis, y ese puente ya está hecho en smooth-scroll.js.

     Va también un poco de opacidad. Es el mismo aprendizaje que la portada
     de Simbio (initBlurPortada en main.js): el desenfoque solo no alcanza
     para que algo se lea como "pasó atrás" — sigue estando igual de
     presente, solo que borroso.
     ------------------------------------------------------------------ */

  const DESENFOQUE = {
    /* Cuánto llega a desenfocarse, en píxeles de blur, cuando el hero
       terminó de salir. Abajo de 8 casi no se nota; arriba de 20 el dibujo
       se convierte en una mancha antes de irse. */
    blur: 14,

    /* Cuánto se apaga en el camino. 1 = no se apaga nada. */
    opacidad: 0.45,
  };

  function initDesenfoque() {
    const esquina = document.querySelector("[data-esquina]");
    if (!esquina) return;

    const hero = esquina.closest(".portada-hero");
    if (!hero) return;

    // Sin GSAP (o si no contestó el CDN), o con movimiento reducido: la
    // ilustración se queda nítida y no pasa nada. Es una capa de más, no
    // algo de lo que dependa que la página se entienda.
    if (!window.gsap || !window.ScrollTrigger || sinMovimiento) return;

    window.gsap.to(esquina, {
      filter: "blur(" + DESENFOQUE.blur + "px)",
      opacity: DESENFOQUE.opacidad,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",      // arranca cuando el hero toca el borde
        end: "bottom top",     // termina cuando terminó de salir
        scrub: true,
      },
    });
  }

  function init() {
    initEsquina();
    initDesenfoque();
  }

  // Swup reemplaza el contenido sin recargar y los scripts no se vuelven a
  // ejecutar: transiciones.js llama a esto de nuevo en cada navegación.
  window.initArchivoEsquina = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
