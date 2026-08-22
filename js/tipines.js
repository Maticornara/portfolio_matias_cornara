/* ==========================================================================
   TIPINES.JS
   Los comportamientos de la página de Amigos Tipines.

     initPaneo()   las tres piezas del hero, corriéndose de a una
     initAlterna() piezas que se turnan en el mismo lugar (los juguetes)
     initLibro()   el libro hojeable de 16 hojas + el visor de pantalla completa
     initTele()    la tapa de play de la miniserie

   Todos salen sin hacer nada si no encuentran su HTML, así que el archivo se
   puede cargar en cualquier página del sitio sin romper nada. Hace falta que
   así sea: Swup mantiene el <head> entre páginas, o sea que este script queda
   vivo cuando se navega a otro proyecto.
   ========================================================================== */

(function () {
  "use strict";

  // La misma pregunta que hacen main.js y mas-54.js. Va repetida y no
  // importada porque el sitio no tiene build step: no hay módulos, son
  // scripts sueltos.
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // play() devuelve una promesa que se rechaza si el navegador bloquea la
  // reproducción. Sin el catch queda un error rojo en consola que no
  // significa nada.
  function reproducir(video) {
    const intento = video.play();
    if (intento) intento.catch(() => {});
  }

  const acotar = (v, min, max) => Math.max(min, Math.min(max, v));


  /* ------------------------------------------------------------------------
     1. EL PANEO DEL HERO
     --------------------------------------------------------------------------
     Tres piezas en una fila (el riel) que mide 300% de la ventana, y lo que se
     mueve es el riel: cada paso lo corre un 100%, o sea el ancho de una pieza.

     POR QUÉ ASÍ Y NO CON UN FUNDIDO. Apiladas en el mismo lugar y fundiéndose,
     no se lee como un recorrido: se lee como un parpadeo, o como una imagen
     que falla. Con el riel se ve que la siguiente ENTRA desde el costado, y
     ahí el gesto es legible sin flechas ni puntitos que lo expliquen.

     El desplazamiento va a una variable CSS (--paneo-x) y no al style del
     elemento: la transición y la curva quedan en el CSS, con el resto del
     diseño.

     LA TERCERA PIEZA ES UN VIDEO y lo maneja este mismo init, no el
     [data-video-visible] genérico de +54. Ese usa un IntersectionObserver, y
     un observer mira el VIEWPORT, no el `overflow: hidden` del padre: para el
     observer el video "se ve" incluso cuando el riel ya lo corrió afuera de la
     ventana. Acá el video arranca y para con el HERO entero, que es lo que de
     verdad se ve o no se ve.
     ------------------------------------------------------------------------ */

  function initPaneo() {
    document.querySelectorAll("[data-paneo]").forEach((paneo) => {
      const riel = paneo.querySelector("[data-paneo-riel]");
      if (!riel) return;

      const piezas = [...riel.children];
      if (piezas.length < 2) return;

      let actual = 0;
      let enPantalla = false;

      // El paso es el ancho de la VENTANA del paneo, no el del riel: el riel
      // mide N veces eso. Se lee en cada paso y no una sola vez, para que siga
      // andando si cambia el tamaño de la ventana.
      //
      // EL VIDEO CORRE MIENTRAS EL HERO ESTÉ EN PANTALLA, sea o no la pieza
      // que se está viendo. Antes se pausaba al salir de turno y se retomaba
      // al volver, y ESO era la mitad del "se traba": el clip dura 8 s y el
      // turno 4,6, así que cada vez que volvía retomaba desde otro punto y
      // encima el primer cuadro después de un play() tarda en salir. Un video
      // mudo de 960x540 no cuesta nada tenerlo corriendo — medido: cero
      // cuadros perdidos.
      function mostrar(i) {
        riel.style.setProperty("--paneo-x", (-i * paneo.clientWidth) + "px");
      }

      function videos(encender) {
        piezas.forEach((pieza) => {
          if (pieza.tagName !== "VIDEO") return;
          if (encender) reproducir(pieza);
          else pieza.pause();
        });
      }

      mostrar(0);
      window.addEventListener("resize", () => mostrar(actual), { passive: true });

      const intervalo = parseInt(paneo.dataset.paneo, 10) || 4600;
      let reloj = null;

      const arrancar = () => {
        enPantalla = true;
        videos(true);
        if (reloj || sinMovimiento) return;
        reloj = setInterval(() => {
          actual = (actual + 1) % piezas.length;
          mostrar(actual);
        }, intervalo);
      };

      const parar = () => {
        enPantalla = false;
        clearInterval(reloj);
        reloj = null;
        videos(false);
      };

      new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? arrancar() : parar()));
      }, { threshold: 0.15 }).observe(paneo);
    });
  }


  /* ------------------------------------------------------------------------
     2. EL LIBRO HOJEABLE
     --------------------------------------------------------------------------
     LEER ESTO ANTES DE TOCAR NADA. La explicación completa —con el dibujo de
     qué mitad de qué pliego va en qué cara— está en el bloque "EL LIBRO
     HOJEABLE" de css/tipines.css. Acá va el resumen y lo que hace el JS.

     EN LA CARPETA HAY 17 ARCHIVOS Y NO SON 17 PÁGINAS:
       tapa.jpg          una A4 sola
       01..15.jpg        PLIEGOS: dos A4 unidas por el lomo (una A3)
       contratapa.jpg    una A4 sola

     UNA HOJA DE PAPEL NO ES UN PLIEGO. Lleva la mitad DERECHA de un pliego de
     un lado, y la mitad IZQUIERDA del pliego siguiente del otro. Con 15
     pliegos salen 16 hojas:

       hoja 0     frente = tapa (entera)        dorso = mitad izq. pliego 1
       hoja k     frente = mitad der. pliego k  dorso = mitad izq. pliego k+1
       hoja 15    frente = mitad der. pliego 15 dorso = contratapa (entera)

     Con N hojas pasadas se ve el pliego N entero: su mitad izquierda es el
     dorso de la hoja N-1 y su derecha es el frente de la hoja N. Cierra
     exacto, y por eso el giro es de 180 grados justos.

     POR QUÉ LAS HOJAS NO ESTÁN ESCRITAS EN EL HTML. Son 16 hojas por 2 caras =
     32 imágenes, y las 32 salen de la misma cuenta. Escribirlas a mano es
     copiar 32 veces la misma cuenta y equivocarse en una. Además, armándolas
     acá se les puede poner el src SOLO a las que están cerca de la hoja
     abierta: el libro entero pesa 4,3 MB, y bajarlo completo para ver la tapa
     sería exactamente el problema que el script de assets vino a resolver.
     ------------------------------------------------------------------------ */

  // Cuántas hojas a cada lado de la abierta se cargan por adelantado. Con 2
  // alcanza para que nunca se vea entrar una imagen: la hoja tarda 760 ms en
  // girar y para entonces la siguiente ya está.
  const LIBRO_MARGEN = 2;

  function initLibro() {
    document.querySelectorAll("[data-libro]").forEach((caja) => {
      const contenedor = caja.querySelector("[data-libro-hojas]");
      if (!contenedor) return;

      const pliegos = parseInt(caja.dataset.libroPliegos, 10) || 0;
      const ruta = caja.dataset.libroRuta || "";
      if (!pliegos) return;

      const btnPrev  = caja.querySelector("[data-libro-prev]");
      const btnNext  = caja.querySelector("[data-libro-next]");
      const salida   = caja.querySelector("[data-libro-contador]");
      const btnLupa  = caja.querySelector("[data-libro-lupa]");

      const TOTAL = pliegos + 1;   // 15 pliegos → 16 hojas
      let actual = 0;              // cuántas hojas están pasadas: 0..TOTAL

      // Swup no recarga la página: si este init corre dos veces sobre el mismo
      // DOM, las hojas se duplicarían. Se vacía antes de armar.
      contenedor.innerHTML = "";

      const archivoPliego = (n) => ruta + String(n).padStart(2, "0") + ".jpg";

      // Qué archivo corresponde al estado N, para el visor y para el contador.
      const archivoDe = (n) =>
        n === 0     ? ruta + "tapa.jpg" :
        n === TOTAL ? ruta + "contratapa.jpg" :
        archivoPliego(n);

      const nombreDe = (n) =>
        n === 0     ? "Tapa" :
        n === TOTAL ? "Contratapa" :
        "Pliego " + String(n).padStart(2, "0") + " / " + pliegos;

      // Qué imagen y qué mitad le toca a cada cara. Ver el reparto de arriba.
      function cara(hoja, lado) {
        if (lado === "frente") {
          if (hoja === 0) return { src: ruta + "tapa.jpg", mitad: "entera",
                                   alt: "Tapa del libro Amigos Tipines" };
          return { src: archivoPliego(hoja), mitad: "der",
                   alt: "Pliego " + hoja + ", página derecha" };
        }
        if (hoja === TOTAL - 1) return { src: ruta + "contratapa.jpg", mitad: "entera",
                                         alt: "Contratapa del libro" };
        return { src: archivoPliego(hoja + 1), mitad: "izq",
                 alt: "Pliego " + (hoja + 1) + ", página izquierda" };
      }

      const hojas = [];

      for (let i = 0; i < TOTAL; i++) {
        const hoja = document.createElement("div");
        hoja.className = "hoja";
        hoja.style.setProperty("--i", i);

        ["frente", "dorso"].forEach((lado) => {
          const datos = cara(i, lado);
          const div = document.createElement("div");
          div.className = "hoja__cara" + (lado === "dorso" ? " hoja__cara--dorso" : "");

          const img = document.createElement("img");
          img.className = "hoja__mitad hoja__mitad--" + datos.mitad;
          img.alt = datos.alt;
          // El src NO se pone acá: lo pone pintar(), y solo si la hoja está
          // cerca de la abierta. Queda guardado en un data- hasta entonces.
          img.dataset.src = datos.src;

          div.appendChild(img);
          hoja.appendChild(div);
        });

        hoja.addEventListener("click", () => {
          // Solo son clickeables la hoja de arriba de cada pila (el resto
          // tiene pointer-events: none por el aria-hidden). La de la derecha
          // avanza; la que ya está dada vuelta, vuelve.
          ir(i < actual ? i : i + 1);
        });

        contenedor.appendChild(hoja);
        hojas.push(hoja);
      }

      function pintar() {
        hojas.forEach((hoja, i) => {
          const pasada = i < actual;
          // Las dos hojas de afuera de cada pila: la abierta a la derecha y la
          // última pasada a la izquierda. Son las únicas que llevan sombra y
          // pliegue — ver la nota de .hoja.is-arriba en el CSS.
          const arriba = i === actual || i === actual - 1;

          hoja.classList.toggle("is-pasada", pasada);
          hoja.classList.toggle("is-arriba", arriba);

          // El apilado: las pasadas se acumulan a la izquierda en el orden en
          // que se pasaron (z bajo y creciente); las que faltan se apilan a la
          // derecha con la actual arriba de todo.
          hoja.style.zIndex = pasada ? String(i) : String(TOTAL * 2 - i);

          // Solo las dos hojas de arriba reciben clicks y foco.
          hoja.setAttribute("aria-hidden", String(!arriba));

          // Carga perezosa: solo las que están a menos de LIBRO_MARGEN.
          if (Math.abs(i - actual) <= LIBRO_MARGEN) {
            hoja.querySelectorAll(".hoja__mitad").forEach((img) => {
              if (!img.src && img.dataset.src) img.src = img.dataset.src;
            });
          }
        });

        // Cerrado de adelante o de atrás: el escenario se corre para que la
        // tapa (o la contratapa) quede centrada en vez de dejar medio pliego
        // vacío al costado. Ver .libro__escena en el CSS.
        caja.classList.toggle("is-cerrado", actual === 0);
        caja.classList.toggle("is-cerrado-atras", actual === TOTAL);

        if (btnPrev) btnPrev.disabled = actual === 0;
        if (btnNext) btnNext.disabled = actual === TOTAL;
        if (salida)  salida.textContent = nombreDe(actual);
      }

      function ir(destino) {
        // clamp: nunca fuera del rango de estados
        const nuevo = acotar(destino, 0, TOTAL);
        if (nuevo === actual) return;
        actual = nuevo;
        pintar();
        // Y NADA MÁS. Antes acá había un visor.pintar() para redibujar la
        // imagen grande, y ya no existe: el visor no tiene copia del libro, se
        // lleva ESTE nodo adentro. Redibujar el libro ES redibujar el visor.
      }

      if (btnNext) btnNext.addEventListener("click", () => ir(actual + 1));
      if (btnPrev) btnPrev.addEventListener("click", () => ir(actual - 1));

      // Teclado: flechas, pero SOLO cuando el libro está en pantalla. Si no,
      // le robaría las flechas al scroll de la página.
      document.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        if (!caja.isConnected) return;
        // Con el visor abierto ESTE listener sigue siendo el bueno: adentro
        // del visor está este mismo libro, y el visor ya no toca las flechas
        // (solo Escape). Antes había un `return` acá porque el visor tenía su
        // propio teclado y cada flecha pasaba DOS pliegos.

        const r = caja.getBoundingClientRect();
        const visible = r.top < window.innerHeight * 0.85 && r.bottom > 0;
        if (!visible) return;

        e.preventDefault();
        ir(actual + (e.key === "ArrowRight" ? 1 : -1));
      });

      // El visor comparte el estado con el libro: lo que se ve en grande es
      // siempre el pliego abierto, y al cerrar, el libro queda donde lo
      // dejaste. Por eso se arma acá adentro y no como un módulo aparte.
      const visor = armarVisor({
        // caja: el nodo entero. El visor no dibuja una copia del libro — se
        // lleva ESTE y después lo devuelve. Ver armarVisor.
        caja:     caja,
        estado:   () => actual,
        total:    () => TOTAL,
        archivo:  archivoDe,
        nombre:   nombreDe,
        ir:       ir,
      });

      if (btnLupa && visor) {
        btnLupa.addEventListener("click", () => visor.abrir());
      }

      pintar();
    });
  }


  /* ------------------------------------------------------------------------
     3. EL VISOR — el "ver en grande" del libro
     --------------------------------------------------------------------------
     POR QUÉ NO SE USA LA LUPA DE main.js, QUE YA EXISTE.
     initLupa abre la imagen dentro de un marco de polaroid: borde blanco y más
     aire abajo. Para las tres láminas del manual de +54 está perfecto — son
     fotos impresas y el marco lo dice. Para un pliego apaisado de un
     busca-personajes el marco se come el ancho y la imagen termina MÁS CHICA
     que el propio librito de la página. Se veía como un post-it.

     Acá el pliego manda: ocupa lo que puede de la ventana, el fondo es negro
     liso, y se puede acercar. Que se pueda acercar no es un lujo — es un
     busca-personajes: hay que poder mirar de cerca un objeto del tamaño de una
     moneda dentro de un pliego lleno de cosas.

     EL VISOR ES UNO SOLO Y VIVE FUERA DE #swup. Los listeners se enganchan una
     vez sola (la marca es el data-visor-armado); el libro que está en pantalla
     se le pasa en visor.__libro, y los handlers lo leen recién al dispararse.
     Sin eso, cada navegación de Swup sumaba una copia de cada listener.
     ------------------------------------------------------------------------ */

  // El HTML del visor. Está acá y no en la página por una razón concreta: la
  // primera versión lo tenía escrito en amigos-tipines.html, y cuando esa
  // página se regeneró desde la plantilla de las otras tres, el bloque se
  // perdió. Resultado: "Ver en grande" dejó de hacer NADA, sin un solo error
  // en consola que lo delatara — el botón existía, el JS corría, y el
  // querySelector devolvía null en silencio. Armándolo desde acá no puede
  // desincronizarse de la plantilla.
  const FLECHA = (d) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';

  function crearVisor() {
    const visor = document.createElement("div");
    visor.className = "visor";
    visor.setAttribute("data-visor", "");
    visor.hidden = true;
    visor.innerHTML =
      // El fondo es un <button> y no un <div> con onclick: cerrar tocando
      // afuera es una acción, y así funciona con teclado sin agregar nada.
      '<button class="visor__fondo" type="button" data-visor-cerrar aria-label="Cerrar el visor"></button>' +
      '<div class="visor__lienzo" data-visor-lienzo><img data-visor-img alt=""></div>' +
      '<button class="visor__nav visor__nav--prev" type="button" data-visor-prev aria-label="Pliego anterior">' +
        FLECHA("M15 4 L7 12 L15 20") + '</button>' +
      '<button class="visor__nav visor__nav--next" type="button" data-visor-next aria-label="Pliego siguiente">' +
        FLECHA("M9 4 L17 12 L9 20") + '</button>' +
      '<button class="visor__cerrar" type="button" data-visor-cerrar aria-label="Cerrar">' +
        FLECHA("M6 6 L18 18 M18 6 L6 18") + '</button>' +
      '<p class="visor__pie etiqueta" data-visor-pie></p>';
    document.body.appendChild(visor);
    return visor;
  }

  /* ------------------------------------------------------------------------
     3-bis. EL VISOR: EL LIBRO EN PANTALLA COMPLETA
     --------------------------------------------------------------------------
     EL VISOR NO DIBUJA NADA PROPIO. Se MUDA el libro adentro.

     La primera versión mostraba un <img> con el pliego abierto y lo dejaba
     acercar y arrastrar. El problema no era el zoom: era que pasar de página
     ahí adentro era cambiarle el src a una imagen, o sea ninguna animación.
     En grande dejabas de tener un libro y pasabas a tener un carrusel de
     fotos, justo en el momento en que más se lo mira.

     Ahora, al abrir, el .libro__caja entero —sus 16 hojas, su giro 3D y sus
     controles— se mueve del <main> a la ventana del visor, y al cerrar vuelve
     a su lugar. Es el MISMO nodo: mismo JS, mismo estado, mismo giro. Lo único
     que cambia es --libro-alto / --libro-tope (css/tipines.css) y el fondo
     negro que le queda detrás.

     Efecto secundario, y es gratis: el estado se conserva solo en los dos
     sentidos. Abrís en grande en el pliego 7 y arranca en el 7; hojeás hasta
     el 11, cerrás, y la página queda en el 11. No hay nada que sincronizar
     porque no hay dos libros.

     CÓMO SE VUELVE. Antes de mudarlo se deja un comentario vacío en el DOM
     haciendo de mojón; al cerrar, el libro se reinserta delante de ese mojón.
     Un comentario y no un <div>: no ocupa lugar, no hereda estilos y no puede
     aparecer por error en la página.
     ------------------------------------------------------------------------ */

  function armarVisor(libro) {
    // Cuelga del <body> y no de #swup, así que sobrevive a las navegaciones de
    // Swup: se crea una vez y después se reusa.
    const visor = document.querySelector("[data-visor]") || crearVisor();

    const lienzo = visor.querySelector("[data-visor-lienzo]");
    if (!lienzo) return null;

    // El <img> de la versión vieja ya no se usa: si quedó en el HTML, se saca,
    // porque si no ocupa lugar adentro de la ventana y descentra el libro.
    const imgVieja = visor.querySelector("[data-visor-img]");
    if (imgVieja) imgVieja.remove();

    visor.__libro = libro;

    const abierto = () => !visor.hidden;

    function abrir() {
      const l = visor.__libro;
      if (!l || !l.caja || abierto()) return;

      // El mojón que marca de dónde salió, para poder devolverlo exacto.
      visor.__mojon = document.createComment(" el libro vive acá ");
      l.caja.parentNode.insertBefore(visor.__mojon, l.caja);
      lienzo.appendChild(l.caja);

      visor.hidden = false;
      // El doble rAF es para que el navegador pinte el estado inicial (opacity
      // 0) antes de que la clase dispare la transición. Con uno solo, a veces
      // agrupa los dos cambios y el fundido no se ve.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => visor.classList.add("is-abierto")));

      if (window.lenis) window.lenis.stop();
    }

    function devolver() {
      const l = visor.__libro;
      const mojon = visor.__mojon;
      if (!l || !l.caja) return;

      // Si el mojón ya no está en el documento es porque Swup reemplazó #swup
      // mientras el visor estaba abierto: la página a la que había que
      // devolverlo no existe más. En ese caso el libro se descarta — el
      // initLibro de la página nueva arma el suyo.
      if (mojon && mojon.parentNode) {
        mojon.parentNode.insertBefore(l.caja, mojon);
        mojon.remove();
      } else {
        l.caja.remove();
      }
      visor.__mojon = null;
    }

    function cerrar() {
      if (!abierto()) return;
      visor.classList.remove("is-abierto");
      if (window.lenis) window.lenis.start();

      // Se devuelve DESPUÉS del fundido: si no, el libro reaparece de golpe en
      // la página mientras el visor todavía se está yendo, y se ve el salto.
      setTimeout(() => {
        devolver();
        visor.hidden = true;
      }, 320);
    }

    // --- Los listeners, una sola vez para toda la vida de la página ---
    if (!visor.dataset.visorArmado) {
      visor.dataset.visorArmado = "1";

      visor.querySelectorAll("[data-visor-cerrar]").forEach((b) =>
        b.addEventListener("click", cerrar));

      // Las flechas del visor están escondidas por CSS (el libro entra con las
      // suyas), pero se dejan cableadas: si algún día el visor muestra otra
      // cosa, ya andan.
      const btnPrev = visor.querySelector("[data-visor-prev]");
      const btnNext = visor.querySelector("[data-visor-next]");
      btnPrev && btnPrev.addEventListener("click", () =>
        visor.__libro.ir(visor.__libro.estado() - 1));
      btnNext && btnNext.addEventListener("click", () =>
        visor.__libro.ir(visor.__libro.estado() + 1));

      // Escape cierra. Las flechas NO se manejan acá: el libro ya tiene su
      // propio listener de teclado y, estando en el visor, está en pantalla.
      // Si lo hiciéramos también acá, cada flecha pasaría dos páginas.
      document.addEventListener("keydown", (e) => {
        if (!abierto()) return;
        if (e.key === "Escape") cerrar();
      });
    }

    return { abrir, cerrar, estaAbierto: abierto };
  }


  /* ------------------------------------------------------------------------
     4. PIEZAS QUE SE TURNAN EN EL MISMO LUGAR
     --------------------------------------------------------------------------
     Un contenedor con [data-alterna] y adentro varios [data-alterna-item]. Se
     enciende uno por vez, en orden, cada N milisegundos.

     Lo usan los juguetes: el modelo en gris y las figuras pintadas son las
     MISMAS tres piezas en la misma pose, así que turnarse en el mismo lugar
     hace la comparación sola. Una al lado de la otra obliga a ir y venir con
     la mirada.

     El intervalo se declara en el HTML (data-alterna="3000") para que el ritmo
     se toque desde ahí. El fundido está en el CSS (.is-visible), con el resto
     del diseño.

     Solo corre mientras el grupo está en pantalla: un temporizador dando
     vueltas en una sección que nadie está mirando es trabajo al pedo, y encima
     al volver te encontrás la pieza en cualquier punto del ciclo.

     Es una copia de initAlterna de mas-54.js. Va copiada y no importada porque
     el sitio no tiene build step, y mas-54.js no se carga en esta página.
     ------------------------------------------------------------------------ */

  function initAlterna() {
    document.querySelectorAll("[data-alterna]").forEach((grupo) => {
      const piezas = [...grupo.querySelectorAll("[data-alterna-item]")];
      if (!piezas.length) return;

      // Con una sola pieza no hay nada que alternar: se la deja prendida.
      if (piezas.length < 2) {
        piezas.forEach((p) => p.classList.add("is-visible"));
        return;
      }

      let actual = 0;
      const pintar = () =>
        piezas.forEach((p, i) => p.classList.toggle("is-visible", i === actual));

      pintar();

      if (sinMovimiento) return;

      const intervalo = parseInt(grupo.dataset.alterna, 10) || 3000;
      let reloj = null;

      const arrancar = () => {
        if (reloj) return;
        reloj = setInterval(() => {
          actual = (actual + 1) % piezas.length;
          pintar();
        }, intervalo);
      };
      const parar = () => { clearInterval(reloj); reloj = null; };

      new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? arrancar() : parar()));
      }, { threshold: 0.2 }).observe(grupo);
    });
  }


  /* ------------------------------------------------------------------------
     5. LA TELE
     --------------------------------------------------------------------------
     La tapa se va al primer click y NO vuelve. Los controles nativos ya están
     puestos desde el HTML, así que la barra de tiempo existe desde el primer
     cuadro y se puede adelantar el video sin tener que reproducirlo antes.

     La tapa existe por una razón concreta y no por diseño: serie.mp4 pesa
     15,4 MB y el <video> lleva preload="none". Sin un gesto que dispare la
     descarga, el visitante ve un rectángulo negro y no entiende que hay algo.
     ------------------------------------------------------------------------ */

  function initTele() {
    const tapa = document.querySelector("[data-tele-play]");
    const video = document.querySelector("[data-tele-video]");
    if (!tapa || !video) return;

    tapa.addEventListener("click", () => {
      reproducir(video);
      tapa.classList.add("is-fuera");
    });
  }


  /* ------------------------------------------------------------------------
     ARRANQUE
     Igual que main.js y mas-54.js: se expone para que transiciones.js lo
     vuelva a llamar cuando Swup cambia de página sin recargar.
     ------------------------------------------------------------------------ */

  function initTipines() {
    initPaneo();
    initLibro();
    initAlterna();
    initTele();
  }

  window.initTipines = initTipines;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTipines);
  } else {
    initTipines();
  }
})();
