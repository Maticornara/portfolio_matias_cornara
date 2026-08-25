/* ==========================================================================
   MAIN.JS — MÓDULOS COMPARTIDOS DEL SITIO
   Módulos independientes, cada uno con su init, todos enchufados al final.

   Acá vive lo que usan TODAS las páginas: cursor, scroll reveal, nav,
   carpetas, lupa, tilt. Lo propio de la portada está en js/archivo.js.
   El render automático de las 8 fichas está PARADO a propósito (ver punto 6).

   SONIDO: no hay audio todavía. Dejé comentarios // SOUND HOOK en los
   puntos exactos donde en el futuro se dispararía uno, para no tener que
   rediseñar nada cuando los sumemos.
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. UTILIDADES COMPARTIDAS
   -------------------------------------------------------------------------- */

// Marca que el JS está vivo. El CSS usa .js para saber si puede esconder
// los bloques del scroll-reveal: si el JS no carga, nada queda invisible.
document.documentElement.classList.add("js");

// ¿El usuario pidió menos movimiento en su sistema operativo?
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ¿Hay un mouse de verdad? (no un dedo, no un lápiz)
const hayMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


/* --------------------------------------------------------------------------
   1. DATOS DE LOS PROYECTOS
   Fuente única de verdad. Renombrar o reordenar proyectos se hace acá.

   OJO: son los OCHO proyectos del sitio largo. La portada express muestra
   una selección de cinco (Simbio, Mobiliario de Museo, +54, Amigos Tipines
   y Tesis) y sus fichas están escritas a mano en index.html, no salen de
   esta lista. Tesis todavía no está acá porque no tiene página propia.

   Cada ficha completa va a tener los 5 bloques fijos (concepto, rol,
   contexto, proceso, resultado), hoy en null. `extras` es el campo abierto:
   array de bloques { titulo, contenido } para secciones que un proyecto
   tiene y los demás no — previsto para el flujo de herramientas de IA de
   Amigos Tipines.
   -------------------------------------------------------------------------- */

const PROYECTOS = [
  { slug: "cero-al-infinito",   titulo: "Cero al Infinito",       categoria: "Investigación · Arquitectura",      anio: 2022, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "simbio",             titulo: "Simbio",                 categoria: "Diseño industrial · Biomímesis",    anio: 2023, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "saprobio",           titulo: "Saprobio",               categoria: "Audiovisual · Inmersivo",           anio: 2023, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "lamparas",           titulo: "Lámparas",               categoria: "Diseño industrial · Matricería",    anio: 2022, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "mas-54",             titulo: "+54",                    categoria: "Sistema gráfico · 3D",              anio: 2021, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "fanzine-zoe-gotusso",titulo: "Fanzine (Zoe Gotusso)",  categoria: "Ilustración · Editorial",           anio: 2023, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "mobiliario-museo",   titulo: "Mobiliario de Museo",    categoria: "Diseño industrial · Mobiliario",    anio: 2021, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
  { slug: "amigos-tipines",     titulo: "Amigos Tipines",         categoria: "Transmedia · IA aplicada",          anio: 2024, concepto: null, rol: null, contexto: null, proceso: null, resultado: null, extras: [] },
];


/* --------------------------------------------------------------------------
   2. (ACÁ ESTABA EL TYPEWRITER DEL HERO)
   Se borró con el remake de la portada: escribía "Mi Cajón" letra por letra
   en el titular. El nombre ahora está escrito en el HTML y quieto, y lo que
   se mueve en el hero es el punto de fuga de la esquina (js/archivo.js).
   Si algún día se quiere volver a tipear un texto, está en el historial.
   -------------------------------------------------------------------------- */


/* --------------------------------------------------------------------------
   3. HOVER-REVEAL + PERMANENCIA
   ----------------------------------------------------------------------------
   Un solo gesto. Al empezar el hover (o al apretar, en touch):
     - el CSS hace el cross-fade boceto → real
     - arranca un temporizador y la barra de abajo se llena
     - si el gesto se sostiene hasta el final, se entra al proyecto
     - si se corta antes, se cancela y vuelve al boceto
   Misma lógica en desktop y en touch: cambia el evento que la arranca.
   -------------------------------------------------------------------------- */

// Cuánto hay que sostener el gesto. Tiene que coincidir con --dwell en
// variables.css, que es lo que tarda la barra en llenarse.
const DWELL_MS = 850;

function initHoverReveal() {
  document.querySelectorAll("[data-dwell]").forEach((link) => {
    // La clase de estado va en .ficha (el contenedor), no en el link
    const ficha = link.closest(".ficha") || link;
    let timer = null;

    function empezar() {
      if (timer) return; // ya está corriendo
      ficha.classList.add("is-dwelling", "is-revealed");

      // SOUND HOOK: reveal-start
      // Corto y seco, tipo hoja que se desliza.

      timer = window.setTimeout(entrar, DWELL_MS);
    }

    function cancelar() {
      if (timer) { window.clearTimeout(timer); timer = null; }
      ficha.classList.remove("is-dwelling", "is-revealed");
    }

    function entrar() {
      timer = null;
      ficha.classList.remove("is-dwelling");

      // SOUND HOOK: enter-project
      // Confirmación, un poco más llena que reveal-start.

      // Por Swup, para que el gesto siga en la transición en vez de cortarse
      // con una recarga. Si Swup no está, se navega como siempre.
      if (window.swup) window.swup.navigate(link.href);
      else window.location.assign(link.href);
    }

    /* Desktop: el hover ES el gesto */
    if (hayMouse) {
      link.addEventListener("mouseenter", empezar);
      link.addEventListener("mouseleave", cancelar);
    }

    /* Touch: mantener apretado. pointerdown/up funciona con dedo y lápiz. */
    link.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return; // el mouse ya está cubierto
      empezar();
    });
    link.addEventListener("pointerup", cancelar);
    link.addEventListener("pointercancel", cancelar);

    /* Teclado: el equivalente accesible es Enter, sin permanencia.
       El click nativo del <a> ya lo resuelve; solo hay que revelar. */
    link.addEventListener("focus", () => ficha.classList.add("is-revealed"));
    link.addEventListener("blur", cancelar);

    /* En touch, el primer toque revela y NO debe navegar todavía: la
       navegación la dispara la permanencia. */
    link.addEventListener("click", (e) => {
      if (!hayMouse && e.detail > 0) e.preventDefault();
    });
  });
}


/* --------------------------------------------------------------------------
   4. CURSOR CUSTOM + PULSO
   Anillo en reposo, punto lleno sobre algo interactivo (al revés del
   prototipo, según tu corrección). Solo con mouse real.
   -------------------------------------------------------------------------- */

let cursorListo = false;
function initCursor() {
  if (!hayMouse || cursorListo) return;
  cursorListo = true;

  const punto = document.createElement("div");
  punto.className = "cursor-dot";
  document.body.appendChild(punto);
  document.documentElement.classList.add("has-cursor");


  // Dos pares de coordenadas: dónde está el mouse (destino) y dónde está
  // dibujado el punto (actual). La diferencia es el retraso.
  let destinoX = innerWidth / 2, destinoY = innerHeight / 2;
  let actualX = destinoX, actualY = destinoY;

  /* --- MOSTACILLAS ---
     Solo en las páginas que lo piden con data-cursor="mostacillas" (hoy,
     SIMBIO). Detrás del cursor van unas cuentas chicas que lo siguen con
     retraso encadenado, como la tanza con mostacillas de la pieza alga.
     A poco detalle: cuatro, chicas y translúcidas — que se reconozcan de
     reojo, no que se miren.

     OJO: este bloque tiene que ir DESPUÉS de declarar destinoX/destinoY.
     Lo tenía antes y rompía todo el cursor: en JS, leer una variable `let`
     antes de su declaración lanza un error, y ese error cortaba la función
     entera. Resultado: no aparecía ni el cursor ni las cuentas. */
  const cuentas = [];
  if (document.body.dataset.cursor === "mostacillas") {
    for (let i = 0; i < 4; i++) {
      const c = document.createElement("div");
      c.className = "cursor-cuenta";
      c.style.setProperty("--i", i);   // cada una más chica y más transparente
      document.body.appendChild(c);
      // Cada cuenta guarda su posición: el retraso sale de que persigue a la
      // anterior, no de un temporizador.
      cuentas.push({ el: c, x: destinoX, y: destinoY });
    }
  }

  /* --- ANILLO CON RETRASO ---
     Con data-cursor="anillo" (hoy, SIMBIO). Son DOS piezas:
       · el punto  → chico y preciso, va casi pegado al mouse
       · el anillo → grande y fino, llega un poco después
     El retraso del anillo es lo único que hace el efecto: al mover el mouse
     se estira detrás, y al parar se centra solo. No hay animación escrita:
     es la misma cuenta de suavizado del punto, con un coeficiente más chico.

     Reemplazó a las mostacillas (la estela de 4 cuentas). El código de las
     mostacillas quedó arriba por si alguna otra página lo quiere pedir. */
  let anillo = null;
  let anilloX = destinoX, anilloY = destinoY;
  if (document.body.dataset.cursor === "anillo") {
    anillo = document.createElement("div");
    anillo.className = "cursor-anillo";
    document.body.appendChild(anillo);
    document.documentElement.classList.add("has-anillo");
  }

  function dibujar() {
    punto.style.transform =
      `translate(${actualX}px, ${actualY}px) translate(-50%, -50%)`;
    if (anillo) {
      anillo.style.transform =
        `translate(${anilloX}px, ${anilloY}px) translate(-50%, -50%)`;
    }
  }

  window.addEventListener("mousemove", (e) => {
    destinoX = e.clientX;
    destinoY = e.clientY;
    if (sinMovimiento) { actualX = destinoX; actualY = destinoY; dibujar(); }
  }, { passive: true });

  // Suavizado: cada frame el punto recorre el 18% de lo que le falta.
  function loop() {
    // 0.35 = el punto va casi pegado al mouse (antes 0.18, se sentía blando).
    actualX += (destinoX - actualX) * 0.35;
    actualY += (destinoY - actualY) * 0.35;
    // 0.12 = el anillo llega bastante después. Es LA perilla del efecto:
    // más chico = más arrastre.
    anilloX += (destinoX - anilloX) * 0.12;
    anilloY += (destinoY - anilloY) * 0.12;
    dibujar();

    // La cadena: cada cuenta persigue a la de adelante con el mismo
    // coeficiente. Al encadenarse, el retraso se acumula y el conjunto se
    // curva al mover el mouse, como una tanza que arrastra.
    let px = actualX, py = actualY;
    for (const c of cuentas) {
      c.x += (px - c.x) * 0.32;
      c.y += (py - c.y) * 0.32;
      c.el.style.transform =
        `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
      px = c.x;
      py = c.y;
    }

    requestAnimationFrame(loop);
  }
  if (!sinMovimiento) requestAnimationFrame(loop);

  // Delegación con closest(): un listener para toda la página en vez de
  // uno por elemento.
  const INTERACTIVO = 'a, button, [data-dwell], input, select, textarea';

  document.addEventListener("mouseover", (e) => {
    const sobreAlgo = !!e.target.closest(INTERACTIVO);
    punto.classList.toggle("is-active", sobreAlgo);
    if (anillo) anillo.classList.toggle("is-active", sobreAlgo);
    // Sobre zona oscura el contorno negro no se vería: se aclara
    punto.classList.toggle("on-dark", !!e.target.closest(".zona--negro"));
  });
  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest(INTERACTIVO)) return;
    punto.classList.remove("is-active");
    if (anillo) anillo.classList.remove("is-active");
  });

  /* Pulso de click */
  if (sinMovimiento) return;

  document.addEventListener("click", (e) => {
    const pulso = document.createElement("div");
    pulso.className = "click-pulse";
    pulso.style.left = e.clientX + "px";
    pulso.style.top = e.clientY + "px";
    document.body.appendChild(pulso);

    // SOUND HOOK: click-tick
    // Muy corto (<60ms) y muy bajo. Si molesta, es el primero que sale.

    // Se limpia solo: no queda basura en el DOM
    pulso.addEventListener("animationend", () => pulso.remove());
  });
}


/* --------------------------------------------------------------------------
   5. SCROLL REVEAL
   IntersectionObserver: el navegador avisa cuando un elemento entra al
   viewport. Mucho más barato que escuchar el evento scroll.
   -------------------------------------------------------------------------- */

function initReveal() {
  const bloques = document.querySelectorAll(".reveal");

  if (sinMovimiento || !("IntersectionObserver" in window)) {
    bloques.forEach((b) => b.classList.add("is-in"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-in");
      // Una sola vez: nada de fade al volver a subir
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0.15 });

  bloques.forEach((bloque, i) => {
    // Escalonado suave entre hermanos
    if (i > 0) bloque.style.setProperty("--reveal-delay", Math.min(i, 4) * 80 + "ms");
    observador.observe(bloque);
  });
}


/* --------------------------------------------------------------------------
   6. RENDER DEL ÍNDICE — PARADO A PROPÓSITO
   ----------------------------------------------------------------------------
   La ficha de ejemplo está escrita a mano en index.html para que sea fácil
   de mirar y corregir. Cuando la aprobemos, esta función pasa a generar las
   8 desde PROYECTOS y la ficha del HTML se borra.

   Está escrita y lista, pero NO se llama desde init(). Cuando llegue el
   momento: descomentar la llamada y agregarle un contenedor con id.
   -------------------------------------------------------------------------- */

function renderFichas(lista, contenedor) {
  if (!contenedor) return;

  contenedor.innerHTML = lista.map((p, i) => `
    <article class="ficha reveal">
      <span class="ficha__pestana">Ficha ${String(i + 1).padStart(2, "0")}</span>
      <a class="ficha__cuerpo" href="proyectos/${p.slug}.html"
         data-dwell data-titulo="${p.titulo}">
        <div class="ficha__marco">
          <div class="ficha__capa ficha__capa--boceto">
            <!-- acá van tus SVG de boceto: /assets/${p.slug}/sketch.svg -->
          </div>
          <div class="ficha__capa ficha__capa--real"></div>
          <div class="ficha__dwell" aria-hidden="true"><i></i></div>
        </div>
        <div class="ficha__pie">
          <div>
            <h3 class="ficha__titulo">${p.titulo}</h3>
            <span class="ficha__cat">${p.categoria}</span>
          </div>
          <p class="dato">${p.anio}</p>
        </div>
      </a>
    </article>`
  ).join("");
}


/* --------------------------------------------------------------------------
   7. ARRANQUE
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   5-bis. REGLA DE GRILLA
   Con ?grid en la URL se dibujan las 4 columnas encima de la página, como
   la guía roja del mockup. Sirve para comprobar de un vistazo que todo
   esté apoyado en la estructura y no acomodado a ojo.
   -------------------------------------------------------------------------- */

function initReglaGrilla() {
  if (!new URLSearchParams(location.search).has("grid")) return;

  // La regla se cuelga del <body>, o sea FUERA de #swup, así que Swup no la
  // limpia al navegar: sin esto, con ?grid en la URL cada navegación dejaba
  // otra regla encima de la anterior. Es la misma trampa de la lupa de abajo.
  const vieja = document.querySelector(".regla-grilla");
  if (vieja) vieja.remove();

  const regla = document.createElement("div");
  regla.className = "regla-grilla";
  regla.setAttribute("aria-hidden", "true");

  // Una banda por columna. Lee --cols del CSS, así en mobile dibuja las
  // que realmente haya (4, 2 o 1) y no siempre cuatro.
  const columnas = Number(
    getComputedStyle(document.documentElement).getPropertyValue("--cols")
  ) || 4;

  for (let i = 0; i < columnas; i++) regla.appendChild(document.createElement("i"));
  document.body.appendChild(regla);
}


/* --------------------------------------------------------------------------
   5-ter. CARPETAS QUE SE ABREN
   La pestaña es un <button> de verdad, no un div con un listener: así viene
   con teclado, foco y lectura de pantalla incluidos, sin escribir nada.
   Lo único que hace el JS es alternar una clase y avisar el estado; la
   apertura la anima el CSS.
   -------------------------------------------------------------------------- */

function initCarpetas() {
  document.querySelectorAll("[data-abre]").forEach((tapa) => {
    const cuerpo = document.getElementById(tapa.dataset.abre);
    if (!cuerpo) return;

    tapa.addEventListener("click", () => {
      const abierta = !cuerpo.classList.contains("is-abierta");

      // Acordeón: al abrir una, la otra se cierra. Dos collages abiertos a la
      // vez son media pantalla de piezas y se pierde el foco.
      if (abierta) {
        document.querySelectorAll("[data-abre]").forEach((otra) => {
          if (otra === tapa) return;
          const suCuerpo = document.getElementById(otra.dataset.abre);
          if (suCuerpo) suCuerpo.classList.remove("is-abierta");
          otra.classList.remove("is-abierta");
          otra.setAttribute("aria-expanded", "false");
        });
      }

      // La clase va en los dos: la tapa se inclina, el cuerpo se despliega.
      // Están separados en el HTML para que las tapas puedan ir en fila y el
      // contenido igual ocupe todo el ancho de la grilla.
      cuerpo.classList.toggle("is-abierta", abierta);
      tapa.classList.toggle("is-abierta", abierta);
      tapa.setAttribute("aria-expanded", String(abierta));

      // SOUND HOOK: carpeta-abrir / carpeta-cerrar
      // El gesto más físico de la página: acá va el sonido de cartón.
    });
  });
}


/* --------------------------------------------------------------------------
   5-quater. COLUMNA SINCRONIZADA
   La columna fija de la izquierda no muestra todo su texto de entrada: cada
   bloque aparece cuando su sección de la derecha entra en pantalla. Así el
   texto acompaña al material en vez de adelantarse.
   El vínculo es data-sincro (en la sección) con data-bloque (en el texto).
   -------------------------------------------------------------------------- */

function initColumnaSincro() {
  const secciones = document.querySelectorAll("[data-sincro]");
  if (!secciones.length) return;

  // Sin IntersectionObserver o sin movimiento: se muestra todo y listo.
  if (sinMovimiento || !("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-bloque]").forEach((b) => b.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      const bloque = document.querySelector(
        '[data-bloque="' + entrada.target.dataset.sincro + '"]'
      );
      if (!bloque) return;
      // Se muestra al entrar y se queda: volver a subir no lo esconde.
      if (entrada.isIntersecting) bloque.classList.add("is-visible");
    });
  }, { rootMargin: "-15% 0px -35% 0px" });

  secciones.forEach((s) => observador.observe(s));
}


/* --------------------------------------------------------------------------
   5-quinquies. LA NAV QUE SE ESQUIVA
   Al bajar se va para arriba; al subir vuelve. Y si el mouse se acerca al
   borde superior, aparece sin necesidad de scrollear — así se puede llegar
   a ella en medio de una sección larga sin tener que volver arriba.
   -------------------------------------------------------------------------- */

/* Los listeners van en window y se ponen UNA sola vez, pero el nodo de la nav
   cambia: Swup la reemplaza en cada navegación. Por eso la referencia se
   guarda afuera y se vuelve a apuntar en cada init — si no, después de entrar
   a un proyecto la barra le seguía poniendo la clase a una nav que ya no
   estaba en la página, y dejaba de esconderse. */
/* --------------------------------------------------------------------------
   5-quater. EL MENÚ HAMBURGUESA (solo pantalla chica)
   Abre y cierra la barra. Todo lo visual lo hace el CSS con la clase
   .is-abierta; acá solo se pone y se saca, y se mantiene al día el
   aria-expanded, que es lo que un lector de pantalla lee para saber si el
   menú está abierto.

   OJO CON LA GUARDA: no puede ser una variable de módulo como la de
   initNavEsquiva. Swup reemplaza la nav entera en cada navegación, así que
   el <button> es OTRO nodo y hay que volver a engancharlo. La marca va en el
   nodo mismo (dataset.listo): si es nuevo, no la tiene y se engancha; si es
   el mismo de antes, no se engancha dos veces.
   -------------------------------------------------------------------------- */

function initHamburguesa() {
  const nav = document.querySelector(".site-nav");
  const boton = nav && nav.querySelector(".site-nav__hamburguesa");
  if (!boton || boton.dataset.listo) return;
  boton.dataset.listo = "1";

  function abrir(si) {
    nav.classList.toggle("is-abierta", si);
    boton.setAttribute("aria-expanded", si ? "true" : "false");
    boton.setAttribute("aria-label", si ? "Cerrar el menú" : "Abrir el menú");
    // Con el menú abierto la barra NO se esconde al scrollear: se iría con el
    // menú puesto y volvería abierta, que se ve como un error.
    if (si) nav.classList.remove("is-oculta");

    /* TRABAR LA PÁGINA DE ATRÁS.
       Hizo falta cuando el menú pasó a ser una hoja de pantalla completa:
       antes era una barra que crecía y lo de atrás casi no se veía. Ahora, si
       el dedo se va del panel, lo que se mueve es la página de abajo mientras
       el menú se queda quieto — se lee como que el menú se trabó.
       Son dos frenos porque hay dos motores: Lenis maneja la rueda y el
       gesto; overflow: hidden en el <html> frena el scroll nativo (y es el
       que vale si Lenis no cargó, o con movimiento reducido). */
    if (window.lenis) si ? window.lenis.stop() : window.lenis.start();
    document.documentElement.style.overflow = si ? "hidden" : "";
  }

  boton.addEventListener("click", () => {
    abrir(!nav.classList.contains("is-abierta"));
  });

  // Elegir una opción cierra el menú. Hace falta para los enlaces a una
  // sección de la misma página (#sobre): ahí no hay navegación, así que la
  // nav no se reemplaza y el menú quedaría abierto tapando lo que se acaba
  // de pedir. Cuando sí se cambia de página, Swup trae una nav nueva y
  // cerrada, y esto no molesta.
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => abrir(false));
  });

  // Escape cierra, como cualquier cosa que se abre encima de la página.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-abierta")) {
      abrir(false);
      boton.focus();
    }
  });
}


let navActual = null;
let navLista = false;
function initNavEsquiva() {
  navActual = document.querySelector(".site-nav");
  if (!navActual || navLista) return;
  navLista = true;

  let ultimo = window.scrollY;

  // Umbral: sin esto, un temblor de dos pixeles la hace parpadear.
  const MINIMO = 8;
  // Arriba de todo siempre visible, aunque se esté bajando.
  const ZONA_ALTA = 120;

  window.addEventListener("scroll", () => {
    if (!navActual) return;
    const ahora = window.scrollY;
    const dif = ahora - ultimo;
    if (Math.abs(dif) < MINIMO) return;

    // Con el menú de teléfono abierto la barra se queda quieta.
    const abierta = navActual.classList.contains("is-abierta");
    navActual.classList.toggle("is-oculta", !abierta && dif > 0 && ahora > ZONA_ALTA);
    ultimo = ahora;
  }, { passive: true });

  // El mouse cerca del borde la trae de vuelta
  window.addEventListener("mousemove", (e) => {
    if (navActual && e.clientY < 90) navActual.classList.remove("is-oculta");
  }, { passive: true });
}


/* --------------------------------------------------------------------------
   5-sexies. LA PORTADA SE DESENFOCA AL SCROLLEAR
   El render de entrada se va desenfocando a medida que se baja, como si
   perdiera foco al pasar a segundo plano. Lo maneja el scroll, no un
   temporizador: con "scrub" el desenfoque sigue al dedo y también vuelve si
   se sube.
   -------------------------------------------------------------------------- */

function initBlurPortada() {
  const img = document.querySelector(".portada__foto img");
  const pantalla = document.querySelector(".pantalla--portada");
  if (!img || !pantalla) return;

  // Sin GSAP o con movimiento reducido: se queda nítida y listo.
  if (!window.gsap || !window.ScrollTrigger || sinMovimiento) return;

  gsap.to(img, {
    filter: "blur(16px)",
    // Además de desenfocarse, se apaga: el desenfoque solo no alcanza para
    // que se lea como "pasó a segundo plano".
    opacity: 0.35,
    ease: "none",
    scrollTrigger: {
      trigger: pantalla,
      start: "top top",        // empieza cuando la portada toca el borde
      end: "bottom top",       // termina cuando terminó de salir
      scrub: true,
    },
  });
}


/* --------------------------------------------------------------------------
   5-septies. LAS FOTOS DEL LIQUEN SE MUEVEN AL SCROLLEAR
   Cada una a su propia velocidad, así el grupo no se lee como un bloque
   rígido. Es la misma idea del parallax: lo que se mueve distinto se
   percibe a distinta profundidad.
   Mueve una variable CSS (--p) en vez de la transform entera, para no pisar
   la micro-rotación que cada polaroid ya tiene.
   -------------------------------------------------------------------------- */

function initParallaxLiquenes() {
  const fotos = document.querySelectorAll(".liquenes__suelto");
  if (!fotos.length || !window.gsap || !window.ScrollTrigger || sinMovimiento) return;

  // Recorridos distintos y elegidos a mano: la del medio se mueve al revés
  // que las otras dos, que es lo que hace que se note el desfase.
  const RECORRIDO = [-90, 60, -50];

  fotos.forEach((foto, i) => {
    gsap.fromTo(foto,
      { "--p": (RECORRIDO[i] || 0) * -0.5 + "px" },
      {
        "--p": (RECORRIDO[i] || 0) * 0.5 + "px",
        ease: "none",
        scrollTrigger: {
          trigger: foto.closest(".pantalla"),
          start: "top bottom",   // empieza cuando la sección asoma
          end: "bottom top",     // termina cuando terminó de pasar
          scrub: true,
        },
      });
  });
}


/* --------------------------------------------------------------------------
   5-octies. LA LUPA
   Cualquier [data-lupa] abre su imagen en grande. Un solo overlay reutilizado
   para todas, creado la primera vez que hace falta.
   -------------------------------------------------------------------------- */

function initLupa() {
  // La capa de la lupa vive en el <body>, fuera de #swup. Cada llamada a
  // initLupa arma un cierre nuevo con su propia capa, así que la de la página
  // anterior quedaba colgada del documento para siempre — invisible, pero
  // ahí, tapando clics. Se barre la vieja antes de empezar.
  const capaVieja = document.querySelector(".lupa");
  if (capaVieja) capaVieja.remove();

  const botones = Array.from(document.querySelectorAll("[data-lupa]"));
  if (!botones.length) return;

  let capa = null, img = null, polaroid = null, fuente = null;
  let actual = 0;

  // Manipulación: cuánto está acercada la polaroid y cuánto corrida.
  let zoom = 1, x = 0, y = 0;
  let arrastrando = false, xIni = 0, yIni = 0;
  const ZOOM_MIN = 1, ZOOM_MAX = 4;

  const FLECHA_IZQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4 L7 12 L15 20"/></svg>';
  const FLECHA_DER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 L17 12 L9 20"/></svg>';

  // El zoom y el arrastre se aplican al OBJETO ENTERO, marco incluido: lo que
  // se manipula es la foto impresa, no una ventana con una imagen adentro.
  function pintar(conTransicion) {
    polaroid.classList.toggle("is-manipulando", !conTransicion);
    polaroid.style.transform =
      `translate(${x}px, ${y}px) scale(${zoom})`;
    polaroid.classList.toggle("is-agarrando", arrastrando);
  }

  function crear() {
    capa = document.createElement("div");
    capa.className = "lupa";
    capa.innerHTML =
      '<button class="lupa__cerrar" type="button">Cerrar ✕</button>' +
      '<button class="lupa__flecha lupa__flecha--prev" type="button" aria-label="Anterior">' + FLECHA_IZQ + '</button>' +
      '<figure class="lupa__polaroid"><img alt=""></figure>' +
      '<button class="lupa__flecha lupa__flecha--next" type="button" aria-label="Siguiente">' + FLECHA_DER + '</button>' +
      '<a class="lupa__fuente" target="_blank" rel="noopener noreferrer"></a>';
    document.body.appendChild(capa);

    polaroid = capa.querySelector(".lupa__polaroid");
    img = capa.querySelector(".lupa__polaroid img");
    fuente = capa.querySelector(".lupa__fuente");

    // dir = +1 va hacia adelante, -1 hacia atrás. Lo usa la animación para
    // saber para qué lado sale la foto que se va.
    capa.querySelector(".lupa__flecha--prev").addEventListener("click", (e) => {
      e.stopPropagation();
      pasar(-1);
    });
    capa.querySelector(".lupa__flecha--next").addEventListener("click", (e) => {
      e.stopPropagation();
      pasar(1);
    });

    // Clic en el fondo cierra; sobre la polaroid, no.
    capa.addEventListener("click", (e) => {
      if (!polaroid.contains(e.target) && !e.target.closest(".lupa__fuente")) cerrar();
    });

    document.addEventListener("keydown", (e) => {
      if (!capa.classList.contains("is-abierta")) return;
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") pasar(-1);
      if (e.key === "ArrowRight") pasar(1);
    });

    // Rueda: acercar y alejar
    polaroid.addEventListener("wheel", (e) => {
      e.preventDefault();
      const antes = zoom;
      zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom - e.deltaY * 0.0016));
      if (zoom === 1) { x = 0; y = 0; }          // al volver, se recentra sola
      else if (antes !== zoom) { x *= zoom / antes; y *= zoom / antes; }
      pintar(false);
    }, { passive: false });

    // Arrastre con pointer events: mouse, dedo y lápiz por igual
    polaroid.addEventListener("pointerdown", (e) => {
      if (zoom === 1) return;
      arrastrando = true;
      xIni = e.clientX - x;
      yIni = e.clientY - y;
      polaroid.setPointerCapture(e.pointerId);
      pintar(false);
    });
    polaroid.addEventListener("pointermove", (e) => {
      if (!arrastrando) return;
      x = e.clientX - xIni;
      y = e.clientY - yIni;
      pintar(false);
    });
    const soltar = () => { arrastrando = false; pintar(false); };
    polaroid.addEventListener("pointerup", soltar);
    polaroid.addEventListener("pointercancel", soltar);
  }

  /* PASAR DE FOTO, CON MOVIMIENTO
     La que se va sale para el lado CONTRARIO a la flecha que apretaste, y la
     nueva entra desde el lado de la flecha. Es lo que hace que se lea como
     "pasar" una foto y no como un cambio de imagen.

     Va en dos tiempos porque no se puede animar un cambio de src: primero se
     saca la actual, y recién cuando terminó de salir se cambia la imagen y se
     la trae desde el otro lado. */
  const SALIDA = 220;   // ms que tarda en irse
  let pasando = false;

  function pasar(dir) {
    if (pasando) return;   // sin esto, dos clics rápidos se pisan
    pasando = true;

    const fuera = -dir * 90;   // px hacia donde sale: contrario a la flecha

    polaroid.style.transition = `transform ${SALIDA}ms var(--ease), opacity ${SALIDA}ms var(--ease)`;
    polaroid.style.transform = `translateX(${fuera}px) scale(.94)`;
    polaroid.style.opacity = "0";

    setTimeout(() => {
      mostrar(actual + dir);

      // La nueva se coloca del lado de la flecha, sin transición, y en el
      // cuadro siguiente se suelta para que viaje hasta el centro.
      polaroid.style.transition = "none";
      polaroid.style.transform = `translateX(${-fuera}px) scale(.94)`;
      polaroid.style.opacity = "0";

      requestAnimationFrame(() => {
        polaroid.style.transition = `transform 380ms var(--ease), opacity 380ms var(--ease)`;
        polaroid.style.transform = "translateX(0) scale(1)";
        polaroid.style.opacity = "1";
        setTimeout(() => { pasando = false; }, 380);
      });
    }, SALIDA);
  }

  function mostrar(indice) {
    // Circular: de la última se pasa a la primera
    actual = (indice + botones.length) % botones.length;
    const b = botones[actual];
    const mini = b.querySelector("img");

    img.src = b.dataset.lupa;
    img.alt = mini ? mini.alt : "";
    fuente.href = b.dataset.fuente || "#";
    fuente.textContent = b.dataset.dominio || "";

    // Cada foto arranca sin zoom. El transform NO se toca acá: si estamos
    // pasando de foto, lo está manejando pasar(); y en la apertura lo pone
    // el CSS con la entrada.
    zoom = 1; x = 0; y = 0;
    polaroid.classList.remove("is-manipulando");
  }

  function abrir(indice) {
    if (!capa) crear();
    mostrar(indice);
    // Limpia lo que haya dejado un pase anterior, así la entrada del CSS
    // arranca de cero.
    polaroid.style.transition = "";
    polaroid.style.transform = "";
    polaroid.style.opacity = "";
    pasando = false;
    capa.classList.add("is-abierta");
    if (window.lenis) window.lenis.stop();
  }

  function cerrar() {
    if (!capa) return;
    capa.classList.remove("is-abierta");
    if (window.lenis) window.lenis.start();
  }

  botones.forEach((b, i) => b.addEventListener("click", () => abrir(i)));
}


/* --------------------------------------------------------------------------
   5-septies. INCLINACIÓN 3D DE LA FICHA (VanillaTilt)
   La tarjeta se inclina siguiendo al mouse. La profundidad real no la da el
   tilt: la dan las capas a distinta altura (los translateZ del CSS). Sin
   eso se ve como una lámina rígida girando.
   -------------------------------------------------------------------------- */

function initTilt() {
  const fichas = document.querySelectorAll("[data-tilt]");
  if (!fichas.length || !window.VanillaTilt) return;

  // Con movimiento reducido no se inicializa: no alcanza con desactivarlo
  // por CSS, porque la librería escribe el transform en línea y le gana.
  if (sinMovimiento || !hayMouse) return;

  window.VanillaTilt.init(fichas, { gyroscope: false });
}


/* ==========================================================================
   AVISO DE "ABIERTO COMO ARCHIVO"
   --------------------------------------------------------------------------
   Abrir el HTML con doble click lo sirve como file://, y en ese modo Chrome
   trata cada archivo local como un origen distinto: bloquea la carga de
   imágenes dentro de un canvas. Resultado: la animación del ensamble y las
   tres animaciones de pieza no pueden funcionar, aunque el código esté bien.

   Esto ya nos costó dos rondas de "no anda el scroll", así que en vez de un
   mensajito adentro del canvas, la página avisa arriba de todo y ofrece el
   link correcto YA ARMADO, apuntando a la misma página que estabas mirando.

   Por qué no redirige solo: un salto automático de file:// a http:// es justo
   el tipo de cosa que los navegadores bloquean o preguntan, y además si el
   servidor no está levantado te deja en una página de error sin explicación.
   Mejor un link a la vista y que lo toques vos.
   ========================================================================== */
function avisarSiEsArchivo() {
  if (location.protocol !== "file:") return;

  // De la ruta del archivo nos quedamos con lo que viene DESPUÉS de la carpeta
  // del proyecto: eso es exactamente la ruta que sirve el servidor local.
  const ruta = location.pathname.split("/CODIGO_CLAUDE/")[1] || "index.html";
  const url = "http://localhost:8123/" + ruta;

  const aviso = document.createElement("div");
  aviso.style.cssText =
    "position:fixed;inset:0 0 auto 0;z-index:99999;background:#0B0B0B;" +
    "color:#F3EDE1;padding:14px 20px;font:14px/1.5 system-ui,sans-serif;" +
    "display:flex;gap:16px;align-items:center;flex-wrap:wrap";
  aviso.innerHTML =
    '<b>Esta página está abierta como archivo (file://) y las animaciones no ' +
    'pueden cargar.</b> <span style="opacity:.7">Abrila por el servidor local ' +
    '— si no está levantado, doble click en tools/servidor.bat.</span>';

  const link = document.createElement("a");
  link.href = url;
  link.textContent = "Abrir en localhost:8123 →";
  link.style.cssText =
    "color:#0B0B0B;background:#A6C13A;padding:8px 16px;border-radius:999px;" +
    "text-decoration:none;font-weight:700;white-space:nowrap";
  aviso.appendChild(link);

  document.body.appendChild(aviso);
  console.warn("[archivo] Abierta con file://. Abrila desde " + url);
}

function init() {
  avisarSiEsArchivo();
  initReglaGrilla();
  initCarpetas();
  initNavEsquiva();
  initHamburguesa();
  initBlurPortada();
  initTilt();
  initParallaxLiquenes();
  initLupa();
  initColumnaSincro();
  initHoverReveal();
  initCursor();
  initReveal();

  // Todavía no: la ficha de ejemplo está escrita a mano en el HTML.
  // renderFichas(PROYECTOS, document.querySelector("#fichas"));
}

// Swup reemplaza el contenido sin recargar: los scripts no se vuelven a
// ejecutar solos. Exponemos init para que transiciones.js lo llame de nuevo.
window.initComunes = init;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
