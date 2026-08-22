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

        /* CUÁNDO ARRANCA. "60% top" = recién cuando el 60% del hero ya pasó
           por el borde de arriba. Y no es un porcentaje elegido a ojo: la
           caja está apoyada al 60% del alto del hero (--fuga-y en el CSS), o
           sea que ese es justo el momento en que la ilustración empieza a
           salir de pantalla.
           Antes arrancaba en "top top", con el hero todavía entero a la
           vista, y el dibujo se desenfocaba mientras se lo estaba mirando.
           Si algún día se mueve --fuga-y, este número lo acompaña. */
        start: "60% top",
        end: "bottom top",     // termina cuando el hero terminó de salir
        scrub: true,
      },
    });
  }

  /* ==================================================================
     DÓNDE VA Y CUÁNTO MIDE LA ILUSTRACIÓN
     --------------------------------------------------------------------
     ESTO ESTABA EN EL CSS Y ESTABA MAL. El tamaño salía de estimar el
     ancho del nombre (tamaño de letra x 9,09, un número sacado de medir
     una captura) y la posición de un porcentaje del alto del hero. Las dos
     cuentas fallan por el mismo motivo: dependen de cosas que el CSS no
     puede saber — cuánto ocupa un texto en una tipografía concreta, cuánto
     mide la nav, dónde arranca el nombre. Cada vez que había que corregir
     "un poco más arriba" se ajustaba un porcentaje a ciegas.

     Acá se mide todo y se resuelve de una:
       · el ancho REAL del nombre, para que el cubo mida exactamente lo
         mismo que él;
       · el borde de abajo de la nav y el borde de arriba del texto, que
         son los que definen la franja libre donde la ilustración tiene que
         entrar;
       · y con eso, el tamaño más grande que entra y la altura a la que hay
         que colgar el vértice.

     Si el JS no corre, el CSS tiene sus valores de reserva (--fuga-y y la
     estimación de --texto-ancho) y la portada se ve razonable igual.
     ================================================================== */

  const DIBUJO = {
    /* EL DIBUJO, EN UNIDADES DEL LIENZO DEL SVG (que mide 200 x 160).
       Estos cuatro números describen la ilustración y solo cambian si se
       redibuja: son de dónde a dónde llega y dónde tiene el vértice. */
    LIENZO: 200,
    TECHO: 28,      // lo más alto: la punta de la tapa
    PISO: 112.5,    // lo más bajo: el post-it de adelante
    ANCLA: 62,      // el vértice del cuarto, de donde cuelga todo
    CUBO: 68,       // cuánto del lienzo ocupa el cubo de ancho

    /* --- PERILLAS DE AIRE, EN PÍXELES ---------------------------------
       Cuánto respiro se le deja arriba y abajo. Son mínimos: si sobra
       lugar, la ilustración crece hasta donde le permita el ancho del
       nombre y el resto queda como aire repartido. */
    aireNav: 40,      // entre la nav y la punta de la caja
    aireTexto: 80,    // entre lo más bajo del dibujo y el nombre

    /* CUÁNTO SE CORRE DEL CENTRO DEL HUECO. *** LA PERILLA DE LA ALTURA ***
       0 = el mismo aire arriba que abajo. Negativo = más arriba, positivo =
       más abajo, en fracción del sobrante (0.1 = un 10%).
       Queda en 0: con la cuenta arreglada, centrado es centrado, y no hace
       falta compensar nada. Es el único número que hay que tocar si la
       querés más arriba o más abajo. */
    sesgo: 0,
  };

  function acomodarDibujo() {
    const esquina = document.querySelector("[data-esquina]");
    if (!esquina) return;

    const hero = esquina.closest(".portada-hero");
    const nombre = document.querySelector(".portada-hero__nombre");
    const bloque = document.querySelector(".portada-hero__texto");
    const nav = document.querySelector(".site-nav");
    if (!hero || !nombre || !bloque || !nombre.firstChild) return;

    const rHero = hero.getBoundingClientRect();
    const rTexto = bloque.getBoundingClientRect();

    /* El ancho del nombre se mide con un Range y no con el ancho del <h1>:
       el <h1> ocupa TODA la fila de la grilla y está centrado adentro, así
       que su ancho es el de la columna, no el de las letras. */
    const rango = document.createRange();
    rango.selectNodeContents(nombre);
    const anchoTexto = rango.getBoundingClientRect().width;
    if (anchoTexto <= 0) return;

    /* EL HUECO, DE BORDE A BORDE: del pie de la nav al techo del nombre.
       Se guarda ENTERO y sin recortar, porque el centro del dibujo tiene que
       calcularse contra este hueco y no contra uno ya mordido.
       Acá estaba el "quedó muy arriba": yo restaba primero los aires mínimos
       —40 arriba y 80 abajo— y recién después centraba. Centrar en un hueco
       al que le sacaste más de abajo que de arriba no da el medio: da 20 px
       más arriba, siempre, y encima el sesgo sumaba lo suyo. */
    const navAbajo = nav ? nav.getBoundingClientRect().bottom : 0;
    const arriba = Math.max(navAbajo - rHero.top, 0);
    const abajo = rTexto.top - rHero.top;

    /* Para el TAMAÑO sí valen los aires mínimos: es el alto máximo que puede
       tener el dibujo sin pegarse a la nav ni al nombre. */
    const franja = (abajo - DIBUJO.aireTexto) - (arriba + DIBUJO.aireNav);
    if (franja <= 0) return;

    /* DOS CANDIDATOS DE TAMAÑO Y GANA EL MÁS CHICO.
       Uno sale del ancho: es el que hace que el cubo mida lo mismo que el
       nombre, que es lo que se busca. El otro sale del alto: es el más
       grande que entra en la franja sin pisar nada. En una pantalla normal
       manda el del ancho; en una ventana baja manda el del alto y la caja
       se achica sola en vez de encimarse al texto. */
    const alto = DIBUJO.PISO - DIBUJO.TECHO;

    /* La proporción contra el nombre vive en el CSS, con las demás perillas,
       y no acá: es una decisión de diseño y Mati las toca ahí. Si por lo que
       sea no se puede leer, vale 1 — el cubo del ancho del nombre. */
    const prop = parseFloat(
      getComputedStyle(esquina).getPropertyValue("--caja-proporcion")
    ) || 1;

    const porTexto = anchoTexto * prop * DIBUJO.LIENZO / DIBUJO.CUBO;
    const porAlto = franja * DIBUJO.LIENZO / alto;
    const lienzo = Math.min(porTexto, porAlto);

    /* Y DÓNDE CAE EL VÉRTICE.
       El dibujo se centra en el hueco COMPLETO —así queda el mismo aire
       arriba que abajo, que es lo que el ojo lee como centrado— y recién
       después se lo empuja hacia adentro si quedó pegado a alguno de los dos
       bordes. Los mínimos actúan como tope, no como parte del centrado. */
    const altoDibujo = lienzo * alto / DIBUJO.LIENZO;
    const sobra = (abajo - arriba) - altoDibujo;

    let techo = arriba + sobra * (0.5 + DIBUJO.sesgo);
    techo = Math.max(techo, arriba + DIBUJO.aireNav);
    techo = Math.min(techo, abajo - DIBUJO.aireTexto - altoDibujo);

    const vertice = techo + lienzo * (DIBUJO.ANCLA - DIBUJO.TECHO) / DIBUJO.LIENZO;

    esquina.style.setProperty("--caja-ancho", lienzo.toFixed(1) + "px");
    esquina.style.setProperty("--fuga-y-px", vertice.toFixed(1) + "px");
  }

  function initMedida() {
    acomodarDibujo();

    // La tipografía llega después del primer dibujo: sin esto, el cubo se
    // queda con la medida de la tipografía de reemplazo, que es otra.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(acomodarDibujo);
    }

    // Un temporizador corto junta las decenas de eventos que dispara
    // arrastrar el borde de la ventana en una sola medición.
    let espera = null;
    window.addEventListener("resize", () => {
      clearTimeout(espera);
      espera = setTimeout(acomodarDibujo, 120);
    }, { passive: true });
  }

  /* ==================================================================
     LA ENTRADA: EL CUARTO SE ARMA SOLO
     --------------------------------------------------------------------
     Todo el movimiento esta en el CSS (buscá "LA ENTRADA DEL HERO" en
     archivo.css). Lo unico que hace este modulo es ENCENDERLO poniendo una
     clase, y esa division es a proposito:

       . el CSS no puede decidir "solo al cargar" ni reiniciarse solo;
       . el JS no tiene por que saber los tiempos ni las distancias, que son
         decisiones de diseño y viven con las demas perillas.

     Y por eso la clase la pone el JS y no viene escrita en el HTML: si el
     script no corre, no hay clase, no hay animacion, y la portada se ve
     entera y quieta. La animacion es un agregado, nunca el estado por
     defecto.
     ================================================================== */

  function initEntrada() {
    const hero = document.querySelector(".portada-hero");
    if (!hero) return;

    // Con movimiento reducido no se enciende nada. El CSS tiene su propio
    // cerrojo para lo mismo; este evita que la clase llegue a ponerse.
    if (sinMovimiento) return;

    /* SWUP LLAMA A ESTO DE NUEVO EN CADA NAVEGACION, y volver al Home es una
       entrada nueva: la animacion tiene que poder correr otra vez.
       Volver a poner una clase que YA esta no reinicia nada: para el
       navegador no cambio nada, asi que no rearranca los keyframes. Hay que
       sacarla, obligar a que recalcule, y recien ahi ponerla.

       Ese "obligar a que recalcule" es la linea del offsetWidth: leer una
       medida fuerza al navegador a resolver los estilos pendientes en el
       momento. Sin ella, sacar y poner la clase en la misma vuelta se junta
       en una sola operacion que no cambia nada y la animacion no se ve.
       Es feo, y es la forma estandar de hacerlo. */
    hero.classList.remove("is-entrando");
    void hero.offsetWidth;
    hero.classList.add("is-entrando");
  }

  function init() {
    /* EL ORDEN IMPORTA. Primero se mide y se coloca el dibujo, y la entrada
       se enciende AL FINAL. Al reves, la animacion arrancaria con la caja en
       el tamaño y el lugar equivocados, y se veria dar un salto a mitad de
       camino cuando acomodarDibujo() la corrigiera. */
    initMedida();
    initEsquina();
    initDesenfoque();
    initEntrada();
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
