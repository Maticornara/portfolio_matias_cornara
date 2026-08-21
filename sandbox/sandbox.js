/* ============================================================================
   SANDBOX.JS
   Comportamientos del sandbox. Cinco módulos independientes, cada uno con su
   propia función init, todos enchufados al final del archivo.

   SONIDO: todavía no hay audio. En cada punto donde en el futuro se
   dispararía un sonido dejé un comentario // SOUND HOOK: <nombre>. Los
   hooks están puestos en lugares donde ya existe la llamada a una función,
   así agregar el audio después es cambiar el comentario por una línea, sin
   tocar la estructura.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   Utilidades compartidas
   ---------------------------------------------------------------------------- */

// Marca que el JS está vivo. El CSS usa .js para saber si puede esconder
// los bloques del scroll-reveal. Si el JS no carga, nada queda invisible.
document.documentElement.classList.add("js");

// ¿El usuario pidió menos movimiento en su sistema operativo?
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ¿Hay un mouse de verdad? (no un dedo, no un lápiz)
const hayMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;


/* ----------------------------------------------------------------------------
   1. HOVER-REVEAL + PERMANENCIA (dwell)
   ----------------------------------------------------------------------------
   La idea: un solo gesto. Al empezar el hover (o al apretar en touch):
     - el CSS hace el cross-fade boceto → real
     - arranca un temporizador; mientras corre, la barra de abajo se llena
     - si el gesto se mantiene hasta el final, se entra al proyecto
     - si se corta antes, se cancela todo y vuelve al boceto

   Es la misma mecánica en desktop y en touch: cambia el evento que la
   arranca, no la lógica.
   ---------------------------------------------------------------------------- */

// Cuánto hay que sostener el gesto para que dispare la entrada.
// Ojo: este número también se le pasa al CSS (--dwell-ms) para que la barra
// tarde exactamente lo mismo. Un solo valor, dos usos.
const DWELL_MS = 850;

function initHoverReveal() {
  const tarjetas = document.querySelectorAll("[data-dwell]");
  const veil = document.querySelector(".enter-veil");

  tarjetas.forEach((card) => {
    // El CSS lee esta variable para la duración del llenado de la barra
    card.style.setProperty("--dwell-ms", DWELL_MS + "ms");

    let timer = null;

    function empezar() {
      if (timer) return; // ya está corriendo, no lo reiniciamos

      card.classList.add("is-dwelling", "is-revealed");

      // SOUND HOOK: reveal-start
      // Sonido corto y seco al empezar a revelar (tipo hoja que se desliza).

      timer = window.setTimeout(entrar, DWELL_MS);
    }

    function cancelar() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
      card.classList.remove("is-dwelling", "is-revealed");
    }

    function entrar() {
      timer = null;
      card.classList.remove("is-dwelling");

      // SOUND HOOK: enter-project
      // Sonido de confirmación, un poco más lleno que el de reveal-start.

      // ── EN EL SITIO REAL, ACÁ VA LA NAVEGACIÓN ──
      // Con View Transitions sería algo como:
      //   document.startViewTransition(() => location.assign(card.href));
      // En el sandbox solo mostramos la cortina para poder verlo funcionar.
      demoEntrada(card.dataset.titulo || "proyecto");
    }

    /* --- Desktop: el hover ES el gesto --- */
    if (hayMouse) {
      card.addEventListener("mouseenter", empezar);
      card.addEventListener("mouseleave", cancelar);
    }

    /* --- Touch: mantener apretado --- */
    // pointerdown/up en vez de touchstart: funciona igual con dedo y lápiz.
    card.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return; // el mouse ya está cubierto arriba
      empezar();
    });
    card.addEventListener("pointerup", cancelar);
    card.addEventListener("pointercancel", cancelar);

    /* --- Teclado: el equivalente accesible es Enter, sin permanencia --- */
    card.addEventListener("focus", () => card.classList.add("is-revealed"));
    card.addEventListener("blur", cancelar);

    // En el sandbox los links no navegan (van a #), así que frenamos el
    // click para que el único disparador sea la permanencia.
    card.addEventListener("click", (e) => e.preventDefault());
  });

  // Demo de la entrada: muestra la cortina y la saca. Reemplazable por la
  // navegación real sin tocar nada más.
  function demoEntrada(titulo) {
    if (!veil) return;
    veil.querySelector("span").textContent = "→ entrando a " + titulo;
    veil.classList.add("is-on");
    window.setTimeout(() => veil.classList.remove("is-on"), 900);
  }
}


/* ----------------------------------------------------------------------------
   2. CARPETA CON PESTAÑAS
   Patrón de tabs accesible: una sola pestaña en el orden de tabulación,
   y las flechas mueven el foco entre las demás.
   ---------------------------------------------------------------------------- */

function initFolder() {
  const listas = document.querySelectorAll(".folder__tabs");

  listas.forEach((lista) => {
    const tabs = Array.from(lista.querySelectorAll(".folder__tab"));
    const paneles = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

    function activar(indice, moverFoco = true) {
      tabs.forEach((tab, i) => {
        const activo = i === indice;

        tab.classList.toggle("is-active", activo);
        tab.setAttribute("aria-selected", String(activo));
        // Solo la pestaña activa es tabulable: así el Tab salta al panel
        // en vez de recorrer las tres pestañas.
        tab.tabIndex = activo ? 0 : -1;

        if (paneles[i]) {
          paneles[i].hidden = !activo;
          paneles[i].classList.toggle("is-active", activo);
        }
      });

      if (moverFoco) tabs[indice].focus();

      // SOUND HOOK: tab-switch
      // Click seco y muy bajo, tipo pestaña de cartón. Cuidado: se dispara
      // seguido si el usuario recorre con las flechas, conviene limitarlo.
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activar(i, false));

      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        // El módulo hace que la lista sea circular: de la última a la primera
        const paso = e.key === "ArrowRight" ? 1 : -1;
        activar((i + paso + tabs.length) % tabs.length);
      });
    });
  });
}


/* ----------------------------------------------------------------------------
   3. LIBRITO HOJEABLE
   ----------------------------------------------------------------------------
   Cómo funciona el apilado: las páginas están todas superpuestas. La que se
   está viendo tiene el z-index más alto de las NO pasadas. Al pasar una, se
   le pone .is-flipped (gira sobre el lomo) y se le baja el z-index para que
   quede debajo de las que ya se pasaron antes.
   ---------------------------------------------------------------------------- */

function initBooklet() {
  document.querySelectorAll("[data-booklet]").forEach((booklet) => {
    const paginas = Array.from(booklet.querySelectorAll(".bpage"));
    const btnPrev = booklet.querySelector("[data-booklet-prev]");
    const btnNext = booklet.querySelector("[data-booklet-next]");
    const salidaActual = booklet.querySelector("[data-booklet-current]");
    const salidaTotal = booklet.querySelector("[data-booklet-total]");

    const total = paginas.length;
    let actual = 0; // índice de la página visible

    if (salidaTotal) salidaTotal.textContent = String(total).padStart(2, "0");

    function pintar() {
      paginas.forEach((pagina, i) => {
        const pasada = i < actual;

        pagina.classList.toggle("is-flipped", pasada);
        // Pasadas: se apilan a la izquierda en orden inverso (z bajo).
        // Sin pasar: la de arriba es la actual (z alto).
        pagina.style.zIndex = pasada ? String(i) : String(total - i + total);
        // Las páginas que no se ven no deben recibir clicks
        pagina.setAttribute("aria-hidden", String(i !== actual));
      });

      if (salidaActual) salidaActual.textContent = String(actual + 1).padStart(2, "0");
      if (btnPrev) btnPrev.disabled = actual === 0;
      if (btnNext) btnNext.disabled = actual === total - 1;
    }

    function ir(destino) {
      // clamp: nunca fuera del rango de páginas
      const nuevo = Math.max(0, Math.min(total - 1, destino));
      if (nuevo === actual) return;

      actual = nuevo;
      pintar();

      // SOUND HOOK: page-turn
      // El sonido más importante de los tres. Debería durar más o menos lo
      // mismo que --dur-flip (620ms) y variar un poco de tono en cada pasada
      // para que no suene idéntico. Distinguir adelante / atrás.
    }

    if (btnNext) btnNext.addEventListener("click", () => ir(actual + 1));
    if (btnPrev) btnPrev.addEventListener("click", () => ir(actual - 1));

    // Click sobre la hoja: avanza. Sobre la última, vuelve al principio.
    paginas.forEach((pagina, i) => {
      pagina.addEventListener("click", () => {
        if (i !== actual) return; // solo la hoja de arriba responde
        ir(actual === total - 1 ? 0 : actual + 1);
      });
    });

    // Teclado: flechas, pero solo cuando el librito está en pantalla.
    // Si no, robaría las flechas al scroll de la página.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;

      const caja = booklet.getBoundingClientRect();
      const visible = caja.top < window.innerHeight * 0.8 && caja.bottom > 0;
      if (!visible) return;

      ir(actual + (e.key === "ArrowRight" ? 1 : -1));
    });

    pintar();
  });
}


/* ----------------------------------------------------------------------------
   4. CURSOR CUSTOM + PULSO DE CLICK
   Solo con mouse real. Si es touch, no se activa nada y queda el
   comportamiento nativo del sistema.
   ---------------------------------------------------------------------------- */

function initCursor() {
  if (!hayMouse) return;

  const punto = document.createElement("div");
  punto.className = "cursor-dot";
  document.body.appendChild(punto);
  document.documentElement.classList.add("has-cursor");

  // Dos pares de coordenadas: dónde está el mouse (destino) y dónde está
  // dibujado el punto (actual). La diferencia entre ambos es el retraso.
  let destinoX = window.innerWidth / 2, destinoY = window.innerHeight / 2;
  let actualX = destinoX, actualY = destinoY;

  window.addEventListener("mousemove", (e) => {
    destinoX = e.clientX;
    destinoY = e.clientY;

    // Sin interpolación cuando el usuario pidió menos movimiento:
    // el punto va pegado al mouse.
    if (sinMovimiento) {
      actualX = destinoX;
      actualY = destinoY;
      dibujar();
    }
  }, { passive: true });

  function dibujar() {
    // -50% centra el punto en la coordenada del mouse
    punto.style.transform =
      `translate(${actualX}px, ${actualY}px) translate(-50%, -50%)`;
  }

  // Bucle de suavizado: cada frame el punto recorre el 18% de lo que le
  // falta. Da un retraso corto sin que se sienta pesado.
  function loop() {
    actualX += (destinoX - actualX) * 0.18;
    actualY += (destinoY - actualY) * 0.18;
    dibujar();
    requestAnimationFrame(loop);
  }
  if (!sinMovimiento) requestAnimationFrame(loop);

  // Estado sobre elementos interactivos. Usamos delegación con closest()
  // en vez de poner un listener en cada elemento.
  const SELECTOR_INTERACTIVO = 'a, button, [role="tab"], [data-dwell], .bpage';

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(SELECTOR_INTERACTIVO)) punto.classList.add("is-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(SELECTOR_INTERACTIVO)) punto.classList.remove("is-active");
  });

  /* --- Pulso de click --- */
  if (sinMovimiento) return; // sin pulso si pidieron menos movimiento

  document.addEventListener("click", (e) => {
    const pulso = document.createElement("div");
    pulso.className = "click-pulse";
    pulso.style.left = e.clientX + "px";
    pulso.style.top = e.clientY + "px";
    document.body.appendChild(pulso);

    // SOUND HOOK: click-tick
    // Muy corto (<60ms) y muy bajo. Si molesta, este es el primero que sale.

    // Se limpia solo cuando termina la animación: no queda basura en el DOM
    pulso.addEventListener("animationend", () => pulso.remove());
  });
}


/* ----------------------------------------------------------------------------
   5. SCROLL REVEAL
   IntersectionObserver: el navegador nos avisa cuando un elemento entra al
   viewport. Mucho más barato que escuchar el evento scroll.
   ---------------------------------------------------------------------------- */

function initReveal() {
  const bloques = document.querySelectorAll(".reveal");

  // Sin soporte o sin movimiento: mostramos todo y listo.
  if (sinMovimiento || !("IntersectionObserver" in window)) {
    bloques.forEach((b) => b.classList.add("is-in"));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;

      entrada.target.classList.add("is-in");
      // Una sola vez: lo dejamos de observar. Nada de fade al volver a subir.
      observador.unobserve(entrada.target);
    });
  }, {
    // Dispara cuando el bloque asomó un poco, no en el borde exacto:
    // así la animación no arranca justo sobre el filo de la pantalla.
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.06,
  });

  bloques.forEach((bloque) => {
    // Escalonado: los .reveal anidados dentro de una sección entran uno
    // detrás del otro. El retraso lo lee el CSS de --reveal-delay.
    const hermanos = Array.from(bloque.parentElement.children).filter((h) =>
      h.classList.contains("reveal")
    );
    const posicion = hermanos.indexOf(bloque);
    if (posicion > 0) {
      bloque.style.setProperty("--reveal-delay", Math.min(posicion, 4) * 70 + "ms");
    }

    observador.observe(bloque);
  });
}


/* ----------------------------------------------------------------------------
   ARRANQUE
   ---------------------------------------------------------------------------- */

function init() {
  initHoverReveal();
  initFolder();
  initBooklet();
  initCursor();
  initReveal();
}

// El script tiene defer, así que el DOM ya está listo. El if es por si
// alguna vez se mueve el <script> al <head> sin defer.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
