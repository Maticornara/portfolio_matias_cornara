/* ==========================================================================
   MAS-54.JS
   Los comportamientos de la página de +54.

     initAlterna()     piezas que se turnan en el mismo lugar (logo / paleta)
     initCarrusel()    el carrusel de posters del hero
     initTira()        scroll vertical → recorrido horizontal, de a un poster
     initHistorias()   las tres historias: arrancan solas, sonido opcional
     initFotosCasa()   las 4 habitaciones apareciendo en diagonal
     initVideos54()    los videos corren solo mientras se ven
     initTeaser()      la tapa del teaser
     initPostales()    el giro de las postales

   Todos salen sin hacer nada si no encuentran su HTML, así que el archivo se
   puede cargar en cualquier página del sitio sin romper nada. Hace falta que
   así sea: Swup mantiene el <head> entre páginas, o sea que este script queda
   vivo cuando se navega a otro proyecto.
   ========================================================================== */

(function () {
  "use strict";

  // La misma pregunta que hace main.js. Va repetida y no importada porque el
  // sitio no tiene build step: no hay módulos, son scripts sueltos.
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // play() devuelve una promesa que se rechaza si el navegador bloquea la
  // reproducción. Sin el catch queda un error rojo en consola que no significa
  // nada. Como pasa en cinco lugares distintos, va en una función.
  function reproducir(video) {
    const intento = video.play();
    if (intento) intento.catch(() => {});
  }


  /* ------------------------------------------------------------------------
     "¿SE ESTÁ VIENDO DE VERDAD?" — el ayudante que usan todos los videos
     --------------------------------------------------------------------------
     ACÁ ESTUVO EL BUG DEL SONIDO QUE SEGUÍA SONANDO (22/08/2026), y es una
     trampa clásica de IntersectionObserver que conviene tener anotada:

         `entry.isIntersecting` NO significa "se cumplió el threshold".
         Significa "el elemento toca el viewport aunque sea por un pixel".

     El `threshold` solo decide CUÁNDO se dispara el callback, no qué valor
     tiene isIntersecting cuando se dispara. Con `threshold: 0.25` el callback
     salta al cruzar el 25%, pero en ese momento isIntersecting sigue siendo
     true — así que un `visible = e.isIntersecting` se mantiene en true hasta
     que el elemento se va ENTERO de la pantalla.

     En la sección de historias eso se notaba: la sección tiene 112 px de aire
     arriba y abajo, más el rótulo y el control de sonido. Con los tres videos
     ya bien afuera de la pantalla, la sección seguía tocando el viewport por
     su padding de abajo, isIntersecting seguía true, y el audio seguía
     sonando mientras mirabas otra parte de la página.

     La forma correcta es mirar `intersectionRatio` contra un umbral. Y hay que
     pedir varios thresholds, porque si no el callback no se dispara en los
     valores intermedios y el ratio llega tarde.

     El segundo término del OR es para los elementos MÁS ALTOS que la ventana:
     ahí el ratio nunca puede llegar a 0,6, así que se pregunta al revés —
     cuánto de la PANTALLA está ocupando el elemento.
     ------------------------------------------------------------------------ */

  // Los cinco valores que se le piden al observador. Sin esto el callback solo
  // se dispara al entrar y al salir del todo, y el ratio queda desactualizado.
  const ESCALONES = [0, 0.15, 0.35, 0.6, 0.85, 1];

  // Cuánto tiene que verse para considerar que se está mirando.
  const UMBRAL_VISIBLE = 0.6;

  /* CUÁNTO HAY QUE QUEDARSE PARA QUE ARRANQUE EL SONIDO.
     --------------------------------------------------------------------------
     ACÁ ESTABA EL RUIDO FANTASMA DE VERDAD (22/08/2026), y no era ni Swup ni el
     cambio de pestaña: era ATRAVESAR la sección.

     Con la regla de "se ve → suena", pasar de largo scrolleando alcanzaba para
     dispararlo. Medido cruzando la sección en 1,5 s: `PLAY h1 mudo=false` en
     y=9248 y `pause` en y=8423 — o sea 825 px de scroll con audio saliendo de
     una sección que ya te habías pasado. Y como depende solo de la altura del
     scroll, se disparaba cada vez que la barra pasaba por ahí, aunque fueras
     de camino a otra parte.

     La regla correcta no es "se ve", es "TE QUEDASTE MIRÁNDOLO". Entrar en
     pantalla arranca un reloj; si te fuiste antes de que suene, no suena. Es
     el mismo criterio del `dwell` de las fichas del índice: sostener un gesto
     es una intención, cruzarlo no.

     Frenar, en cambio, es INMEDIATO: nadie quiere esperar medio segundo a que
     se calle algo que ya no está mirando. */
  const ESPERA_SONIDO = 450;

  function seVeDeVerdad(e) {
    return e.intersectionRatio >= UMBRAL_VISIBLE ||
           e.intersectionRect.height >= window.innerHeight * UMBRAL_VISIBLE;
  }




  /* ------------------------------------------------------------------------
     1. PIEZAS QUE SE TURNAN
     --------------------------------------------------------------------------
     Un contenedor con [data-alterna] y adentro varios [data-alterna-item].
     Se enciende uno por vez, en orden, cada N milisegundos.

     El intervalo se declara en el HTML con data-alterna="6000", así el ritmo
     se toca desde el HTML y no hay que abrir el JS.

     El fundido está escrito en el CSS (.is-visible), así que la duración y la
     curva se editan ahí, junto al resto del diseño, y no acá adentro.
     ------------------------------------------------------------------------ */

  function initAlterna() {
    document.querySelectorAll("[data-alterna]").forEach((grupo) => {
      const piezas = [...grupo.querySelectorAll("[data-alterna-item]")];
      if (!piezas.length) return;

      if (piezas.length < 2) {
        piezas.forEach((p) => p.classList.add("is-visible"));
        return;
      }

      let actual = 0;

      function mostrar(i) {
        piezas.forEach((p, n) => p.classList.toggle("is-visible", n === i));

        // Si la pieza es un video, se rebobina al entrar. Sin esto, la segunda
        // vuelta lo muestra desde donde había quedado.
        if (piezas[i].tagName === "VIDEO") {
          piezas[i].currentTime = 0;
          reproducir(piezas[i]);
        }
      }

      mostrar(0);

      // Con movimiento reducido se queda en la primera y no rota nunca.
      if (sinMovimiento) return;

      const intervalo = parseInt(grupo.dataset.alterna, 10) || 4000;
      let reloj = null;

      const arrancar = () => {
        if (reloj) return;
        reloj = setInterval(() => {
          actual = (actual + 1) % piezas.length;
          mostrar(actual);
        }, intervalo);
      };
      const parar = () => { clearInterval(reloj); reloj = null; };

      /* SOLO ROTA MIENTRAS SE VE.
         Un setInterval corriendo con la sección fuera de pantalla gasta
         batería y, si la pieza es un video, lo deja decodificando de gusto. */
      new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (seVeDeVerdad(e) ? arrancar() : parar()));
      }, { threshold: ESCALONES }).observe(grupo);
    });
  }


  /* ------------------------------------------------------------------------
     2. EL CARRUSEL DE POSTERS
     --------------------------------------------------------------------------
     Los cuatro posters van en una fila (el riel) que mide 400% de la ventana,
     y lo que se mueve es el riel: cada paso lo corre un 100%, o sea el ancho
     de un poster.

     POR QUÉ ASÍ Y NO CON UN FUNDIDO. Antes las cuatro imágenes estaban
     apiladas en el mismo lugar y se fundían una sobre otra. Eso no se lee como
     un carrusel: se lee como un parpadeo, o como una imagen que falla. Con el
     riel se ve que la siguiente ENTRA desde el costado, y ahí sí el gesto es
     legible sin necesidad de flechas ni de puntitos que expliquen.

     El desplazamiento va a una variable CSS (--carrusel-x) y no al style del
     elemento: la transición y la curva quedan en el CSS, con el resto del
     diseño.
     ------------------------------------------------------------------------ */

  function initCarrusel() {
    document.querySelectorAll("[data-carrusel]").forEach((carrusel) => {
      const riel = carrusel.querySelector("[data-carrusel-riel]");
      if (!riel) return;

      const total = riel.children.length;
      if (total < 2) return;

      let actual = 0;

      // El paso es el ancho de la VENTANA del carrusel, no el del riel: el
      // riel mide N veces eso. Se lee en cada paso y no una sola vez, para que
      // siga andando si cambia el tamaño de la ventana.
      function mostrar(i) {
        const paso = carrusel.clientWidth;
        riel.style.setProperty("--carrusel-x", (-i * paso) + "px");
      }

      mostrar(0);
      window.addEventListener("resize", () => mostrar(actual), { passive: true });

      if (sinMovimiento) return;

      const intervalo = parseInt(carrusel.dataset.carrusel, 10) || 4200;
      let reloj = null;

      const arrancar = () => {
        if (reloj) return;
        reloj = setInterval(() => {
          actual = (actual + 1) % total;
          mostrar(actual);
        }, intervalo);
      };
      const parar = () => { clearInterval(reloj); reloj = null; };

      new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (seVeDeVerdad(e) ? arrancar() : parar()));
      }, { threshold: ESCALONES }).observe(carrusel);
    });
  }


  /* ------------------------------------------------------------------------
     3. LA TIRA HORIZONTAL
     --------------------------------------------------------------------------
     El scroll vertical de la sección se traduce en el desplazamiento X de una
     imagen de 8566x1080.

     LA CUENTA, en tres pasos:
       1. Cuánto avanzó el scroll DENTRO de la sección → un número de 0 a 1.
          La sección mide (100svh + recorrido) y el escenario está pegado
          arriba durante todo ese tramo, así que el avance es:
          (cuánto se scrolleó desde que la sección tocó el techo) / (alto de
          la sección - una pantalla).
       2. Cuánto tiene que viajar la imagen: su ancho real en pantalla menos
          el ancho de la ventana. Se MIDE con offsetWidth y no se calcula a
          mano, porque el alto de la imagen sale de un svh y cambia con la
          ventana.
       3. x = -avance * viaje.

     EL MÓDULO DE 1093,48 px
     Es el ancho de un poster DENTRO de la imagen original (8566 px). Está
     medido sobre el archivo: las costuras entre paneles caen cada 1093,5 px.

     CADA SCROLLEADA, UNA PUBLICACIÓN — cómo está hecho el freno.
     Mientras el dedo o la rueda se mueven, la tira sigue al scroll sin
     resistencia: frenarla en el momento se siente como que la página se
     traba. El acomodo pasa DESPUÉS, cuando el scroll se queda quieto 140 ms:
     ahí se busca el borde de poster más cercano y se lleva la página al scroll
     que le corresponde, con la animación de Lenis.

     `acomodando` es la guardia que evita el bucle: mover la página dispara más
     eventos de scroll, y sin la bandera cada acomodo pediría otro acomodo.

     Escucha el evento `scroll` del navegador y no ScrollTrigger. Motivo: es el
     motor que en Simbio terminó siendo el principal, funciona con Lenis sin
     configurar nada, y no depende de que una librería de CDN haya cargado.
     rAF de por medio para no dibujar dos veces en el mismo cuadro.
     ------------------------------------------------------------------------ */

  // Ancho de un poster dentro de la imagen original, en píxeles de la imagen.
  // MEDIDO sobre assets/+54/web/tira.jpg (8566x1080): las costuras de los
  // paneles caen en 1089, 2183, 3276, 4369 y 5463.
  const MODULO_TIRA = 1093.48;
  const ANCHO_TIRA = 8566;

  // Cuánto silencio hace falta para dar el scroll por terminado y acomodar.
  const ESPERA_ACOMODO = 140;

  function initTira() {
    const seccion = document.querySelector("[data-tira]");
    if (!seccion) return;

    const pista = seccion.querySelector(".tira54__pista");
    const imagen = pista && pista.querySelector("img");
    const contador = seccion.querySelector("[data-tira-contador]");
    const barra = seccion.querySelector("[data-tira-barra]");
    if (!pista || !imagen) return;

    // Cuántos posters entran en la tira. Se redondea para arriba porque el
    // último es parcial (7,83 → 8 posters, el octavo cortado).
    const totalModulos = Math.ceil(ANCHO_TIRA / MODULO_TIRA);

    const rotulo = (n) =>
      String(n).padStart(2, "0") + " / " + String(totalModulos).padStart(2, "0");

    if (sinMovimiento) {
      // Sin movimiento la sección es una tira que se scrollea a mano (el CSS
      // le pone overflow-x: auto). No hay nada que calcular.
      if (contador) contador.textContent = rotulo(1);
      return;
    }

    let pendiente = false;
    let ultimoModulo = -1;
    let relojAcomodo = null;
    let acomodando = false;

    // Las tres medidas que definen el recorrido. Se recalculan al scrollear
    // porque el alto de la sección depende de svh y cambia al rotar el
    // teléfono o al aparecer/desaparecer la barra del navegador.
    function medidas() {
      const recorrido = seccion.offsetHeight - window.innerHeight;
      const viaje = imagen.offsetWidth - window.innerWidth;
      const arriba = seccion.offsetTop;
      return { recorrido, viaje, arriba };
    }

    function actualizar() {
      pendiente = false;

      const { recorrido, viaje } = medidas();
      if (recorrido <= 0) return;

      // caja.top es negativo mientras la sección está pegada arriba: cuánto se
      // scrolleó desde que tocó el techo es -caja.top.
      const caja = seccion.getBoundingClientRect();
      const avance = Math.min(1, Math.max(0, -caja.top / recorrido));

      if (viaje <= 0) {
        // La ventana es más ancha que la imagen: no hay nada que recorrer.
        pista.style.setProperty("--tira-x", "0px");
        return;
      }

      pista.style.setProperty("--tira-x", (-avance * viaje).toFixed(1) + "px");
      if (barra) barra.style.setProperty("--tira-avance", (avance * 100).toFixed(1) + "%");

      // EL CONTADOR. Dice EN QUÉ PARTE DE LA TIRA estás sobre el total del
      // recorrido, y NO cuál poster cae exactamente en el borde izquierdo.
      //
      // La diferencia importa: en una pantalla de 1440 se ven casi TRES
      // posters a la vez, así que "el poster del borde izquierdo" nunca llega
      // al último. El contador decía "05 / 08" con el final de la tira en
      // pantalla, que se lee como que algo quedó a medias.
      if (contador) {
        const modulo = Math.min(totalModulos, Math.floor(avance * totalModulos) + 1);
        if (modulo !== ultimoModulo) {
          ultimoModulo = modulo;
          contador.textContent = rotulo(modulo);
        }
      }
    }

    /* --- EL ACOMODO ---
       Lleva la página al scroll en el que la tira queda justo en el borde de
       un poster. La cuenta va al revés que la de arriba: del módulo se saca la
       x que le toca, de la x el avance, y del avance el scroll. */
    function acomodar() {
      const { recorrido, viaje, arriba } = medidas();
      if (recorrido <= 0 || viaje <= 0) return;

      // La escala entre la imagen original y lo que se ve en pantalla.
      const escala = imagen.offsetWidth / ANCHO_TIRA;
      const moduloEnPantalla = MODULO_TIRA * escala;

      const caja = seccion.getBoundingClientRect();
      const avance = Math.min(1, Math.max(0, -caja.top / recorrido));

      // Solo se acomoda DENTRO del recorrido. En las puntas no: si no, al
      // entrar o al salir de la sección la página se empuja sola y se siente
      // como que no te deja irte.
      if (avance <= 0.001 || avance >= 0.999) return;

      const x = avance * viaje;
      const modulo = Math.round(x / moduloEnPantalla);
      // El último borde útil: más allá, la imagen ya no tiene de dónde correrse.
      const destinoX = Math.min(modulo * moduloEnPantalla, viaje);
      const destinoY = arriba + (destinoX / viaje) * recorrido;

      // Si ya está prácticamente ahí, no vale la pena mover nada.
      if (Math.abs(destinoY - window.scrollY) < 2) return;

      acomodando = true;
      if (window.lenis) {
        window.lenis.scrollTo(destinoY, {
          duration: 0.45,
          onComplete: () => { acomodando = false; },
        });
        // Red de seguridad: si Lenis no llama a onComplete (pasa si el usuario
        // interrumpe el movimiento), la bandera se destraba igual.
        setTimeout(() => { acomodando = false; }, 700);
      } else {
        window.scrollTo({ top: destinoY, behavior: "smooth" });
        setTimeout(() => { acomodando = false; }, 700);
      }
    }

    function alScrollear() {
      // rAF: el evento scroll puede dispararse varias veces por cuadro. Sin
      // esto se recalcula de gusto y se nota en el movimiento.
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }

      // El acomodo se reprograma en cada evento: mientras se siga scrolleando,
      // nunca llega a dispararse. Salta recién cuando hay silencio.
      if (acomodando) return;
      clearTimeout(relojAcomodo);
      relojAcomodo = setTimeout(acomodar, ESPERA_ACOMODO);
    }

    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
    }, { passive: true });

    // La imagen pesa 1,4 MB: hasta que no cargó, offsetWidth es 0 y la cuenta
    // del viaje da negativo. Por eso se recalcula cuando termina de cargar.
    if (imagen.complete) actualizar();
    else imagen.addEventListener("load", actualizar);

    actualizar();
  }


  /* ------------------------------------------------------------------------
     4. LAS TRES HISTORIAS — UNA POR VEZ
     --------------------------------------------------------------------------
     Se turnan: corre UNA y las otras dos quedan congeladas en su primer cuadro.
     Cuando la que está corriendo termina, arranca la siguiente. Al llegar a la
     tercera vuelve a la primera. Tocar cualquiera la hace la activa.

     "Congelada en el primer cuadro" es literal: `pause()` + `currentTime = 0`.
     No hace falta ningún poster ni ninguna imagen aparte — el propio video
     pintado en su segundo cero ES el primer cuadro.

     CÓMO SE DISTINGUE LA QUE CORRE: por el MOVIMIENTO y por la barrita verde
     que avanza abajo. NO por el color. Estuvo un rato bajándoles la opacidad y
     la saturación a las que esperan, y eso les reescribía el color a unas
     piezas que son diseño gráfico terminado. La página no toca el material.

     POR QUÉ ARRANCA MUDA AUNQUE TENGA SONIDO.
     Ningún navegador deja que un video con audio empiece solo: si no está
     `muted`, `play()` se rechaza y no arranca NADA. Así que la rotación empieza
     muda y el control de sonido la desmutea. Ese click es el permiso que el
     navegador estaba esperando, y a partir de ahí todas suenan, también las que
     siguen. No es una limitación de este código: es política del navegador y no
     se puede saltear.

     SE AVANZA CON EL EVENTO `ended`, NO CON UN TEMPORIZADOR. Las tres duran
     distinto (7,4 · 11,2 · 11,1 s) y un setInterval las cortaría al medio o
     dejaría huecos. `ended` avisa exactamente cuando terminó. Por eso los
     <video> NO llevan `loop`: con loop no terminan nunca y el evento no llega.
     ------------------------------------------------------------------------ */

  function initHistorias() {
    const seccion = document.querySelector("[data-historias]");
    if (!seccion) return;

    const videos = [...seccion.querySelectorAll("[data-historia]")];
    if (!videos.length) return;

    const fila = seccion.querySelector(".historias54__fila");
    const marcos = videos.map((v) => v.closest(".historias54__marco") || v);
    const boton = seccion.querySelector("[data-historias-sonido]");
    const texto = seccion.querySelector("[data-historias-texto]");

    // Con movimiento reducido no rota nada: las tres quedan quietas y con sus
    // controles, para el que quiera verlas a mano.
    if (sinMovimiento) {
      videos.forEach((v) => { v.controls = true; });
      if (boton) boton.hidden = true;
      return;
    }

    let actual = 0;
    let conSonido = false;
    let visible = false;

    function congelar(v) {
      v.pause();
      // Muda también: una historia congelada no tiene por qué poder sonar. Si
      // quedara desmuteada, cualquier reproducción accidental metería una
      // segunda voz encima de la que está corriendo.
      v.muted = true;
      // Ponerlo en 0 SIN estar reproduciendo deja pintado el primer cuadro.
      try { v.currentTime = 0; } catch (e) { /* todavía sin metadatos */ }
    }

    /* EN EL TELÉFONO la fila es un carrusel horizontal, así que al cambiar de
       historia hay que arrastrarlo hasta la que se activó — si no, la rueda
       sigue girando fuera de la vista.
       `scrollWidth > clientWidth` es la forma de preguntar "¿esto scrollea?"
       sin consultar el ancho de la ventana ni duplicar el breakpoint del CSS:
       si el CSS algún día cambia el punto de quiebre, esto lo sigue solo. */
    function traerALaVista(marco) {
      if (!fila || fila.scrollWidth <= fila.clientWidth) return;
      const centro = marco.offsetLeft - (fila.clientWidth - marco.offsetWidth) / 2;
      fila.scrollTo({ left: centro, behavior: "smooth" });
    }

    /* Enciende la historia i y congela las otras dos. La clase .is-activa va en
       el MARCO y no en el video: es la que muestra la barrita de avance. */
    function activar(i) {
      actual = i;
      videos.forEach((v, n) => {
        marcos[n].classList.toggle("is-activa", n === i);
        if (n !== i) {
          congelar(v);
          marcos[n].style.setProperty("--historia-avance", "0%");
        }
      });

      const v = videos[i];
      v.muted = !conSonido;
      v.currentTime = 0;
      if (visible) reproducir(v);
      traerALaVista(marcos[i]);
    }

    videos.forEach((v, n) => {
      // Al terminar una, sigue la próxima.
      v.addEventListener("ended", () => {
        // Solo manda la que está activa: si otra dispara `ended` por lo que
        // sea, no tiene que mover la rueda.
        if (n !== actual) return;
        activar((n + 1) % videos.length);
      });

      // LA BARRITA DE AVANCE. Se escribe en una variable CSS y no en el ancho
      // del elemento: así el color y la forma quedan en el CSS, con el resto
      // del diseño.
      v.addEventListener("timeupdate", () => {
        if (n !== actual || !v.duration) return;
        const pct = (v.currentTime / v.duration) * 100;
        marcos[n].style.setProperty("--historia-avance", pct.toFixed(1) + "%");
      });

      // Tocar una historia la hace la activa. Es lo que uno intenta apenas ve
      // tres cosas de las que solo una se mueve.
      v.addEventListener("click", () => {
        if (n === actual && !v.paused) return;
        activar(n);
      });
    });

    activar(0);

    /* LA ROTACIÓN SOLO CORRE MIENTRAS LAS HISTORIAS SE VEN DE VERDAD.
       Dos cosas importan acá, y las dos estaban mal antes:

       1. SE OBSERVA LA FILA DE VIDEOS, no la sección. La sección incluye 112 px
          de aire arriba y abajo, más el rótulo y el control de sonido: seguía
          tocando la pantalla con los tres videos ya bien afuera.
       2. SE MIRA EL RATIO, no isIntersecting — ver la nota grande de
          seVeDeVerdad() más arriba. Ese era el motivo de que el audio siguiera
          sonando mientras mirabas otra parte de la página. */
    // El reloj de permanencia. Mientras está pendiente, todavía no suena nada.
    let relojEntrada = null;

    function mirar(seVe) {
      visible = seVe;
      clearTimeout(relojEntrada);

      if (!seVe) {
        // Irse corta el sonido en el acto, sin esperar nada.
        videos.forEach((v) => v.pause());
        return;
      }

      // Entrar NO arranca el video: arranca el reloj. Si el scroll sigue de
      // largo, mirar(false) lo cancela y no suena nunca.
      relojEntrada = setTimeout(() => {
        if (visible) reproducir(videos[actual]);
      }, ESPERA_SONIDO);
    }

    new IntersectionObserver((entradas) => {
      entradas.forEach((e) => mirar(seVeDeVerdad(e)));
    }, { threshold: ESCALONES }).observe(fila || seccion);

    /* Y SI TE VAS A OTRA PESTAÑA, TAMBIÉN SE FRENAN.
       El navegador deja seguir sonando el audio de una pestaña en segundo
       plano: es el otro caso de "suena algo que no estoy mirando", y el
       observador no lo cubre, porque para él la fila sigue estando en pantalla. */
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) videos.forEach((v) => v.pause());
      else if (visible) reproducir(videos[actual]);
    });

    /* Al irse de la página. Con Swup el <main> se reemplaza y estos videos
       quedan sueltos fuera del documento — y un elemento desprendido puede
       seguir reproduciendo audio. `pagehide` cubre además la navegación
       normal y el botón de atrás. */
    window.addEventListener("pagehide", () => videos.forEach((v) => v.pause()));
    if (window.swup && window.swup.hooks) {
      window.swup.hooks.on("visit:start", () => videos.forEach((v) => v.pause()));
    }

    if (!boton) return;

    /* EL CONTROL DE SONIDO.
       aria-pressed es el ÚNICO estado: lo lee el lector de pantalla y lo lee el
       CSS para dibujar el parlante y mover las barritas. El texto que cambia es
       el nombre accesible (va en un .visually-hidden), no una etiqueta a la
       vista — el estado se ve, no se lee. */
    function aplicarSonido(nuevo) {
      conSonido = nuevo;
      boton.setAttribute("aria-pressed", String(nuevo));
      // Solo la activa suena. Las congeladas van mudas siempre.
      videos.forEach((v, n) => { v.muted = !(nuevo && n === actual); });
      if (texto) texto.textContent = nuevo ? "Silenciar" : "Activar sonido";
    }

    boton.addEventListener("click", () => {
      const nuevo = boton.getAttribute("aria-pressed") !== "true";
      aplicarSonido(nuevo);

      if (!nuevo) return;

      /* Sacarle el `muted` a un video que está corriendo hace que el navegador
         vuelva a evaluar su política de reproducción, y si decide que no
         corresponde LO PAUSA. Si eso pasara y no hiciéramos nada, quedaría la
         historia congelada con el control mostrando las barras en movimiento:
         estaría mintiendo. Así que si se niega, se vuelve a mudo y se la deja
         corriendo. Preferimos sin sonido antes que trabada. */
      const intento = videos[actual].play();
      if (intento) {
        intento.catch(() => {
          aplicarSonido(false);
          reproducir(videos[actual]);
        });
      }
    });
  }


  /* ------------------------------------------------------------------------
     5. LAS 4 FOTOS DE LA CASA
     --------------------------------------------------------------------------
     Aparecen de a una cuando la grilla entra en pantalla. El escalonado NO
     está acá: cada foto lleva su --orden en el HTML y el CSS lo convierte en
     un transition-delay. Este init solo enciende la grilla una vez.

     Una vez y no cada vez: si se apagara al salir de pantalla, volver a subir
     repetiría la animación y la página se sentiría inquieta.
     ------------------------------------------------------------------------ */

  function initFotosCasa() {
    const grilla = document.querySelector("[data-fotos-casa]");
    if (!grilla) return;

    if (sinMovimiento || !("IntersectionObserver" in window)) {
      grilla.classList.add("is-in");
      return;
    }

    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        // Acá SÍ va isIntersecting y no seVeDeVerdad(): esto dispara UNA sola
        // vez y no vuelve atrás, así que lo que se quiere es que arranque
        // apenas asoma. No hay nada que frenar después.
        if (!e.isIntersecting) return;
        grilla.classList.add("is-in");
        ojo.disconnect();
      });
    }, { threshold: 0.25 });

    ojo.observe(grilla);
  }


  /* ------------------------------------------------------------------------
     6. LOS VIDEOS CORREN SOLO MIENTRAS SE VEN
     --------------------------------------------------------------------------
     La página tiene siete videos. Si arrancan todos al cargar, el navegador
     decodifica siete streams a la vez y se arrastra, sobre todo en una
     notebook.

     Con [data-video-visible] el video arranca cuando entra en pantalla y se
     pausa cuando sale. Los que están dentro de un grupo [data-alterna] NO
     llevan este atributo: de esos se ocupa initAlterna, que además decide cuál
     de las piezas del grupo tiene que estar corriendo. Las historias tampoco:
     tienen su propio init porque arrancan las tres juntas.
     ------------------------------------------------------------------------ */

  function initVideos54() {
    const videos = document.querySelectorAll("video[data-video-visible]");
    if (!videos.length) return;

    if (sinMovimiento) {
      videos.forEach((v) => { v.controls = true; });
      return;
    }

    // Mismo criterio que las historias: el ratio y no isIntersecting. Estos van
    // mudos, asi que no se escuchan de mas, pero un video fuera de pantalla se
    // sigue decodificando igual, y en esta pagina son varios.
    const ojo = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (seVeDeVerdad(e)) reproducir(e.target);
        else e.target.pause();
      });
    }, { threshold: ESCALONES });

    videos.forEach((v) => ojo.observe(v));
  }


  /* ------------------------------------------------------------------------
     7. EL TEASER
     --------------------------------------------------------------------------
     La tapa se va al primer click y NO vuelve. Los controles nativos ya están
     puestos desde el HTML, así que la barra de tiempo existe desde el primer
     cuadro: se puede adelantar el video sin tener que reproducirlo antes.

     Antes los controles los agregaba este init al hacer play, y hasta ese
     momento no había con qué navegar el video. Y volver a tapar el video cada
     vez que se pausaba era pelearse con el que está mirando.

     SE PAUSA SOLO AL SALIR DE PANTALLA. ACÁ ESTABA EL "RUIDO FANTASMA".
     El teaser dura 1:45 y tiene voz. Si lo arrancabas y seguías scrolleando,
     se quedaba sonando con el video fuera de pantalla: te acompañaba el resto
     de la página sin que se viera de dónde salía. Medido: a 1800, 4000 y hasta
     3000 px de distancia seguía reproduciendo con `visible=0px`.

     Era el único video con audio sin control de visibilidad — las historias ya
     lo tenían, así que la sospecha caía siempre sobre ellas y no era ahí.

     LA REGLA NO ES LA MISMA QUE LA DE LAS HISTORIAS, y la diferencia importa.
     Las historias son un loop de ambiente: se prenden y se apagan según lo que
     estés mirando. El teaser lo arrancaste VOS. Así que:

       · se pausa cuando se va de pantalla, pero se anota que lo pausamos
         nosotros;
       · al volver a verse, sigue SOLO si fuimos nosotros los que lo frenamos;
       · si lo pausaste vos con los controles, al volver sigue pausado. Que la
         página te reanude un video que frenaste a mano es de las cosas más
         molestas que puede hacer.

     LOS DOS UMBRALES SON DISTINTOS A PROPÓSITO (histéresis). Con un solo valor,
     dejar el video justo en el límite lo hace prender y apagar en cada píxel de
     scroll. Se frena recién cuando está prácticamente afuera (5%) y se reanuda
     cuando ya volvió de verdad (60%).
     ------------------------------------------------------------------------ */

  // Cuánto tiene que quedar a la vista para frenarlo, y cuánto para reanudarlo.
  const TEASER_PAUSA = 0.05;
  const TEASER_SIGUE = 0.6;

  function initTeaser() {
    const tapa = document.querySelector("[data-teaser-play]");
    const video = document.querySelector("[data-teaser-video]");
    if (!tapa || !video) return;

    // true = lo frenamos nosotros porque se fue de pantalla, no el visitante.
    let pausadoPorNosotros = false;

    /* Distingue el pause que disparamos NOSOTROS del que hace el visitante.

       OJO CON EL ORDEN, QUE ACÁ YA FALLÓ UNA VEZ: el evento `pause` es
       ASÍNCRONO. No se dispara adentro de la llamada a video.pause(), sino
       después, en otra vuelta del bucle de eventos. El primer intento bajaba
       la bandera enseguida:

           estaSaliendo = true;
           video.pause();
           estaSaliendo = false;   // ← acá todavía no llegó el evento

       y cuando el evento por fin llegaba, la bandera ya estaba en false, así
       que el listener creía que había pausado el visitante y borraba la marca.
       Resultado medido: al volver a la sección el teaser se quedaba pausado en
       vez de seguir.

       La bandera la baja EL PROPIO LISTENER, que es el único que sabe cuándo
       llegó el evento. */
    let estaSaliendo = false;

    // El reloj de permanencia para volver a arrancarlo.
    let relojVuelta = null;

    // Frena el video dejando anotado que fuimos nosotros.
    function frenar() {
      // Cancelar el reloj SIEMPRE, aunque el video ya esté pausado: si no, un
      // scroll que entra y sale rápido deja el timer corriendo y el teaser
      // arranca solo medio segundo después, ya fuera de pantalla.
      clearTimeout(relojVuelta);
      if (video.paused) return;
      estaSaliendo = true;
      pausadoPorNosotros = true;
      video.pause();
    }

    tapa.addEventListener("click", () => {
      reproducir(video);
      tapa.classList.add("is-fuera");
    });

    // Si el visitante toca pausa con los controles nativos, deja de ser
    // "nuestro": al volver a la sección no se reanuda solo.
    video.addEventListener("pause", () => {
      if (estaSaliendo) { estaSaliendo = false; return; }  // lo frenamos nosotros
      pausadoPorNosotros = false;                          // lo frenó el visitante
    });

    new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.intersectionRatio <= TEASER_PAUSA) {
          frenar();
        } else if (e.intersectionRatio >= TEASER_SIGUE && pausadoPorNosotros) {
          // Misma espera que las historias: volver a cruzar el teaser no lo
          // reanuda, hay que quedarse. Si te vas antes, el reloj se cancela
          // arriba, en la rama de frenar().
          clearTimeout(relojVuelta);
          relojVuelta = setTimeout(() => {
            pausadoPorNosotros = false;
            reproducir(video);
          }, ESPERA_SONIDO);
        }
      });
    }, { threshold: ESCALONES }).observe(video);

    // Cambiar de pestaña es irse de la página igual que scrollear: si suena, se
    // frena. Misma regla — vuelve solo si lo habíamos frenado nosotros.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) frenar();
    });

    // Irse de la página con Swup: el <main> se reemplaza y este <video> queda
    // suelto. Un elemento fuera del DOM puede seguir sonando.
    if (window.swup && window.swup.hooks) {
      window.swup.hooks.on("visit:start", () => video.pause());
    }
    window.addEventListener("pagehide", () => video.pause());
  }


  /* ------------------------------------------------------------------------
     8. LAS POSTALES
     --------------------------------------------------------------------------
     El giro está resuelto en CSS con :hover y :focus-visible. Acá van dos
     cosas que el CSS no puede hacer solo:

     1. CUATRO ARRANCAN DADAS VUELTA. No es un adorno: es lo que reemplaza al
        cartelito de "pasá el cursor". Ocho frentes iguales no invitan a nada;
        cuatro frentes y cuatro dorsos mezclados hacen la pregunta solos.
        Los números están elegidos a mano y no al azar — al azar, dos veces de
        cada tres quedan tres juntas de un lado y se lee como un error.

     2. EL TOQUE EN PANTALLA TÁCTIL, donde no hay hover. Ahí el toque alterna
        la clase .is-dada-vuelta.
     ------------------------------------------------------------------------ */

  // Cuáles arrancan mostrando el dorso, contando desde 1.
  const POSTALES_AL_DORSO = [2, 4, 5, 7];

  function initPostales() {
    const postales = [...document.querySelectorAll(".postal54")];
    if (!postales.length) return;

    postales.forEach((postal, i) => {
      if (POSTALES_AL_DORSO.includes(i + 1)) postal.classList.add("is-al-dorso");
      postal.addEventListener("click", () => {
        postal.classList.toggle("is-dada-vuelta");
      });
    });
  }


  /* ------------------------------------------------------------------------
     ARRANQUE
     Igual que main.js: se expone para que transiciones.js lo vuelva a llamar
     cuando Swup cambia de página sin recargar.
     ------------------------------------------------------------------------ */

  function init54() {
    initAlterna();
    initCarrusel();
    initTira();
    initHistorias();
    initFotosCasa();
    initVideos54();
    initTeaser();
    initPostales();
  }

  window.init54 = init54;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init54);
  } else {
    init54();
  }
})();
