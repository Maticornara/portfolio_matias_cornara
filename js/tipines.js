/* ==========================================================================
   TIPINES.JS
   Los comportamientos de la página de Amigos Tipines.

     initPaneo()   las tres piezas del hero, corriéndose de a una
     initLibro()   el libro hojeable: 16 hojas con giro 3D sobre el lomo
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
     IntersectionObserver genérico de los otros proyectos. El motivo: la
     ventana del paneo tiene overflow hidden, pero un observer mira el
     viewport, no el recorte del padre. O sea que el video "se ve" para el
     observer incluso cuando está corrido afuera de la ventana, y quedaba
     reproduciéndose sin que nadie lo estuviera mirando. Acá corre solo cuando
     es la pieza activa Y el hero está en pantalla.
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
      function mostrar(i) {
        riel.style.setProperty("--paneo-x", (-i * paneo.clientWidth) + "px");

        piezas.forEach((pieza, j) => {
          if (pieza.tagName !== "VIDEO") return;
          if (j === i && enPantalla) reproducir(pieza);
          else pieza.pause();
        });
      }

      mostrar(0);
      window.addEventListener("resize", () => mostrar(actual), { passive: true });

      const intervalo = parseInt(paneo.dataset.paneo, 10) || 4600;
      let reloj = null;

      const arrancar = () => {
        enPantalla = true;
        mostrar(actual);                 // por si la pieza activa es el video
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
        piezas.forEach((p) => { if (p.tagName === "VIDEO") p.pause(); });
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
      const lupa     = caja.querySelector("[data-libro-lupa]");

      const TOTAL = pliegos + 1;   // 15 pliegos → 16 hojas
      let actual = 0;              // cuántas hojas están pasadas: 0..TOTAL

      // Swup no recarga la página: si este init corre dos veces sobre el mismo
      // DOM, las hojas se duplicarían. Se vacía antes de armar.
      contenedor.innerHTML = "";

      const archivoPliego = (n) => ruta + String(n).padStart(2, "0") + ".jpg";

      // Qué imagen y qué mitad le toca a cada cara. Devuelve null cuando la
      // cara no existe (no pasa nunca con esta cuenta, pero deja el armado a
      // prueba de que alguien cambie el número de pliegos).
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

          hoja.classList.toggle("is-pasada", pasada);

          // El apilado: las pasadas se acumulan a la izquierda en el orden en
          // que se pasaron (z bajo y creciente); las que faltan se apilan a la
          // derecha con la actual arriba de todo.
          hoja.style.zIndex = pasada ? String(i) : String(TOTAL * 2 - i);

          // Solo las dos hojas de arriba reciben clicks y foco.
          const arriba = i === actual || i === actual - 1;
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

        if (salida) {
          salida.textContent =
            actual === 0     ? "Tapa" :
            actual === TOTAL ? "Contratapa" :
            "Pliego " + String(actual).padStart(2, "0") + " / " + pliegos;
        }

        // La lupa apunta siempre al pliego que se está viendo. initLupa
        // (main.js) lee este atributo recién al hacer click, así que
        // reescribirlo acá alcanza.
        if (lupa) {
          lupa.dataset.lupa =
            actual === 0     ? ruta + "tapa.jpg" :
            actual === TOTAL ? ruta + "contratapa.jpg" :
            archivoPliego(actual);
        }
      }

      function ir(destino) {
        // clamp: nunca fuera del rango de estados
        const nuevo = Math.max(0, Math.min(TOTAL, destino));
        if (nuevo === actual) return;
        actual = nuevo;
        pintar();
      }

      if (btnNext) btnNext.addEventListener("click", () => ir(actual + 1));
      if (btnPrev) btnPrev.addEventListener("click", () => ir(actual - 1));

      // Teclado: flechas, pero SOLO cuando el libro está en pantalla. Si no,
      // le robaría las flechas al scroll de la página.
      document.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        if (!caja.isConnected) return;

        const r = caja.getBoundingClientRect();
        const visible = r.top < window.innerHeight * 0.85 && r.bottom > 0;
        if (!visible) return;

        e.preventDefault();
        ir(actual + (e.key === "ArrowRight" ? 1 : -1));
      });

      pintar();
    });
  }


  /* ------------------------------------------------------------------------
     3. LA TELE
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
    initTele();
  }

  window.initTipines = initTipines;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTipines);
  } else {
    initTipines();
  }
})();
