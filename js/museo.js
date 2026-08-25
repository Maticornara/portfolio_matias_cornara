/* ==========================================================================
   MUSEO.JS
   Lo que se mueve en Mobiliario de Museo y NO es la animación de frames.
   Hoy son DOS carruseles: el de apertura, al lado del título, y el de los
   mockups en sala. El paneo del cierre es CSS puro (animation con
   alternate), así que no necesita nada de acá.

   POR QUÉ ESTÁ HECHO PARA VARIOS Y NO PARA UNO (23/08/2026)
   Al principio manejaba un solo carrusel con querySelector y variables
   sueltas del módulo. Al aparecer el segundo, ese estado se pisaba entre
   los dos: movías uno y se movía el otro. Ahora todo lo de un carrusel
   vive adentro de armarCarrusel(), y la página arma tantos como haya.

   Se expone como window.initMuseo para que transiciones.js lo vuelva a
   llamar después de cada navegación de Swup.
   ========================================================================== */

window.initMuseo = function () {
  "use strict";

  const MIN_SWIPE = 45;        // px de arrastre para que cuente como swipe
  const PAUSA_POR_DEFECTO = 4000;

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     UN CARRUSEL
     Automático Y manual, los dos a la vez. Avanza solo cada `pausa`
     milisegundos, y además se mueve con las flechas, con los puntos, con el
     teclado y con el dedo.

     REGLA: apenas el visitante toca algo, el automático se apaga para
     siempre. Si siguiera andando, la imagen se le escaparía justo mientras
     la está mirando, que es la peor forma de perder una foto buena.
     ------------------------------------------------------------------------ */

  function armarCarrusel(carrusel) {
    const pista = carrusel.querySelector("[data-museo-pista]");
    const slides = carrusel.querySelectorAll("[data-museo-slide]");
    const puntos = carrusel.querySelectorAll("[data-museo-punto]");
    const antes = carrusel.querySelector("[data-museo-antes]");
    const despues = carrusel.querySelector("[data-museo-despues]");
    if (!pista || slides.length === 0) return;

    // Cada carrusel puede pedir su propio ritmo con data-museo-pausa.
    const pausa = Number(carrusel.dataset.museoPausa) || PAUSA_POR_DEFECTO;

    let actual = 0;
    let reloj = null;
    // Bandera aparte de `reloj`: el hover apaga el timer pero el automático
    // sigue "vivo" y tiene que volver al salir el mouse. Tocar una flecha,
    // en cambio, lo mata para siempre. Sin esta bandera las dos cosas se
    // confunden, porque en los dos casos `reloj` queda en null.
    let autoVivo = true;

    function mostrar(indice) {
      // El resto (%) hace que dé la vuelta en los dos sentidos: desde la
      // última al "siguiente" vuelve a la primera, y desde la primera al
      // "anterior" salta a la última.
      actual = (indice + slides.length) % slides.length;
      pista.style.transform = "translateX(-" + actual * 100 + "%)";

      puntos.forEach((p, i) => {
        p.classList.toggle("is-activo", i === actual);
        p.setAttribute("aria-current", i === actual ? "true" : "false");
      });

      // Para un lector de pantalla: las que no se ven, no se leen.
      slides.forEach((s, i) => {
        s.setAttribute("aria-hidden", i === actual ? "false" : "true");
      });
    }

    function arrancarSolo() {
      if (sinMovimiento) return;   // nada se mueve solo si pidieron menos movimiento
      if (!autoVivo) return;       // ya lo apagó el visitante: no vuelve
      detener();
      reloj = window.setInterval(() => mostrar(actual + 1), pausa);
    }

    function detener() {
      if (reloj) { window.clearInterval(reloj); reloj = null; }
    }

    // Todo lo que sea intervención del visitante pasa por acá: mueve y
    // apaga el automático de una vez.
    function aMano(indice) {
      autoVivo = false;
      detener();
      mostrar(indice);
    }

    if (antes) antes.addEventListener("click", () => aMano(actual - 1));
    if (despues) despues.addEventListener("click", () => aMano(actual + 1));
    puntos.forEach((p, i) => p.addEventListener("click", () => aMano(i)));

    carrusel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { aMano(actual - 1); }
      else if (e.key === "ArrowRight") { aMano(actual + 1); }
    });

    /* --- Swipe con el dedo -----------------------------------------------
       Solo cuenta si el arrastre fue más horizontal que vertical. Sin esa
       comparación, tratar de scrollear la página con el dedo apoyado sobre
       el carrusel te cambia de foto sin querer. */

    let xInicio = null;
    let yInicio = null;

    carrusel.addEventListener("touchstart", (e) => {
      xInicio = e.touches[0].clientX;
      yInicio = e.touches[0].clientY;
    }, { passive: true });

    carrusel.addEventListener("touchend", (e) => {
      if (xInicio === null) return;
      const dx = e.changedTouches[0].clientX - xInicio;
      const dy = e.changedTouches[0].clientY - yInicio;
      xInicio = null;
      if (Math.abs(dx) < MIN_SWIPE) return;
      if (Math.abs(dx) < Math.abs(dy)) return;   // fue scroll vertical, no swipe
      aMano(dx < 0 ? actual + 1 : actual - 1);
    }, { passive: true });

    // Con el mouse encima se pausa; al salir, sigue. Solo mientras el
    // automático no haya sido apagado a mano.
    carrusel.addEventListener("mouseenter", detener);
    carrusel.addEventListener("mouseleave", arrancarSolo);

    mostrar(0);
    arrancarSolo();
  }

  document.querySelectorAll("[data-museo-carrusel]").forEach(armarCarrusel);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initMuseo);
} else {
  window.initMuseo();
}
