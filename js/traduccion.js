/* ==========================================================================
   TRADUCCION.JS — EL PAR ES/EN DE LA NAV
   Traducción automática con el widget de Google Translate.

   LO QUE HAY QUE SABER ANTES DE TOCAR ESTO
   Google discontinuó el "Website Translator" en 2019: el script sigue vivo y
   funcionando, pero es un servicio sin soporte y puede cortarse sin aviso. Si
   un día los botones dejan de hacer nada, empezá por ahí, no por este archivo.
   Por eso todo acá está escrito para FALLAR EN SILENCIO: si el script no
   carga (sin internet, Google lo apaga, un bloqueador), la página queda en
   español y no se rompe nada.

   CÓMO FUNCIONA EL WIDGET, QUE NO ES OBVIO
   No tiene una API para "traducí a inglés". Lo que hace es inyectar un <select>
   escondido (.goog-te-combo) en la página. La única forma de manejarlo desde
   afuera es ponerle un valor a ese select y dispararle un evento "change" a
   mano, como si un usuario lo hubiera usado. Eso es lo que hace cambiarA().
   El select tarda en aparecer, así que hay que esperarlo (ver cuandoEsteListo).

   Y ADEMÁS INYECTA UI PROPIA: una barra arriba de todo y un globito al pasar
   el mouse. Los dos se esconden desde layout.css — buscá "GOOGLE TRANSLATE".

   LO QUE NO SE TRADUCE
   Los nombres propios llevan translate="no" en el HTML: Archivo, Mi Cajón,
   Simbio, +54, Amigos Tipines, el nombre de Mati. Sin eso Google convierte
   "Archivo" en "File" y "Mi Cajón" en "My Drawer", que es peor que no traducir.
   Si sumás un proyecto con nombre propio, marcalo igual.
   ========================================================================== */

(function () {
  "use strict";

  /* PERILLAS
     --------
     El idioma en el que está escrito el sitio, y al que se vuelve con ES. */
  const IDIOMA_ORIGEN = "es";
  // Dónde se recuerda la elección para que sobreviva a un refresh.
  const MEMORIA = "archivo-idioma";
  /* Cuántas veces se le vuelve a pedir la traducción, y cada cuánto.
     Por qué hace falta insistir, medido: el <select> de Google aparece en menos
     de un segundo, pero el primer "change" que se le dispara SE PIERDE — su
     manejador todavía no está enganchado. Y no se recupera solo: se esperó 9
     segundos y seguía en español. El mismo disparo repetido más tarde traduce
     al instante. Por eso esto insiste hasta ver el resultado en vez de
     confiar en que el select exista. 10 x 800ms = 8 segundos de paciencia. */
  const REINTENTOS = 10;
  const ESPERA_ENTRE_MS = 800;

  let cargado = false;

  /* --- 1. TRAER EL SCRIPT DE GOOGLE ---
     Se carga una sola vez y recién cuando hace falta: es un pedido a un
     tercero, y la mayoría de las visitas nunca van a tocar el botón. Así la
     portada no paga ese costo de entrada. */
  function cargarWidget() {
    if (cargado) return;
    cargado = true;

    // El widget necesita un contenedor con este id sí o sí, y una función
    // global con este nombre para avisar que ya está. Los dos nombres los
    // elige Google, no nosotros.
    if (!document.getElementById("google_translate_element")) {
      const caja = document.createElement("div");
      caja.id = "google_translate_element";
      caja.setAttribute("aria-hidden", "true");
      document.body.appendChild(caja);
    }

    window.googleTranslateElementInit = function () {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: IDIOMA_ORIGEN,
          includedLanguages: "es,en",
          autoDisplay: false,
        }, "google_translate_element");
      } catch (e) {
        console.warn("[traduccion] El widget de Google no arrancó.", e);
      }
    };

    const s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js" +
            "?cb=googleTranslateElementInit";
    s.onerror = function () {
      console.warn("[traduccion] No se pudo cargar Google Translate. " +
                   "La página se queda en español.");
    };
    document.head.appendChild(s);
  }

  /* --- 2. ¿YA ESTÁ TRADUCIDA LA PÁGINA? ---
     Google le agrega la clase "translated-ltr" al <html> cuando terminó, y la
     saca al volver al original. Es la única señal de afuera que dice si el
     pedido llegó: no hay evento ni callback. */
  function estaTraducido() {
    return document.documentElement.className.indexOf("translated-") !== -1;
  }

  /* --- 2-bis. VOLVER AL ORIGINAL: HAY QUE RECARGAR ---
     Poner el select en "" y disparar el change NO deshace la traducción. Se
     probaron las tres formas y quedó medido:
       · value="" + change ................... sigue en inglés
       · borrar la cookie + value="" + change . sigue en inglés
       · borrar la cookie + recargar .......... vuelve al español ✓
     Google guarda el idioma en una cookie llamada googtrans y la lee al
     arrancar. Mientras esa cookie exista, cualquier carga sale traducida. Así
     que para volver al español se borra y se recarga, y listo.

     Es la única vez que el sitio recarga de verdad en vez de navegar con Swup.
     Ir a inglés NO recarga: eso sí se puede hacer en caliente.

     La cookie se borra en varias rutas a propósito: Google la escribe a veces
     en "/" y a veces en la carpeta de la página, y si queda una sola viva la
     traducción vuelve sola en la próxima carga. */
  function borrarCookieDeGoogle() {
    const ayer = "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const carpeta = location.pathname.replace(/[^/]*$/, "");
    ["/", carpeta].forEach(function (ruta) {
      document.cookie = "googtrans=" + ayer + "; path=" + ruta;
      document.cookie = "googtrans=" + ayer + "; path=" + ruta +
                        "; domain=" + location.hostname;
    });
  }

  function volverAlOriginal() {
    borrarCookieDeGoogle();
    location.reload();
  }

  /* --- 3. CAMBIAR DE IDIOMA, INSISTIENDO ---
     El widget no tiene una API. La única manera es ponerle un valor a su
     <select> escondido y dispararle un "change" a mano. Con el idioma de
     origen el valor va vacío: así le decimos "dejá el texto como estaba".

     Se vuelve a intentar hasta que la página quede como se pidió, porque los
     primeros disparos se pierden (ver la nota de REINTENTOS arriba). Cada
     intento verifica el resultado real, no que el select exista. */
  function cambiarA(idioma) {
    const alOriginal = (idioma === IDIOMA_ORIGEN);
    let intentos = 0;

    (function insistir() {
      // Si el visitante cambió de idea a mitad de camino, este intento sobra.
      if (idiomaGuardado() !== idioma) return;

      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = alOriginal ? "" : idioma;
        combo.dispatchEvent(new Event("change"));
      }
      intentos++;

      setTimeout(function () {
        const listo = alOriginal ? !estaTraducido() : estaTraducido();
        if (listo) return;
        if (intentos < REINTENTOS) { insistir(); return; }
        console.warn("[traduccion] Google Translate no respondió. " +
                     "La página se queda como estaba.");
      }, ESPERA_ENTRE_MS);
    })();
  }

  /* --- 3-bis. LO QUE SE TRADUCE A MANO ---
     Todo el sitio lo traduce Google menos un puñado de cosas cortas, que
     llevan su inglés escrito en el HTML (data-es / data-en) y translate="no"
     para que Google no las toque: los botones de la nav, las pestañas de las
     tarjetas de trabajo ("Proy. 1" / "Proj 1") y el botón del CV.

     POR QUÉ LA EXCEPCIÓN: la traducción automática es mala justo donde son
     palabras sueltas sin contexto alrededor, y la nav es exactamente eso — y
     encima es lo primero que se ve. Medido: Google convertía "Trabajos" en
     "JOBS", o sea puestos de trabajo, cuando acá quiere decir obra. En un
     portfolio eso no es un matiz, está mal.

     Si mañana Google te traduce mal alguna otra cosa corta (un rótulo, un
     botón), el arreglo es el mismo: translate="no" + data-es + data-en. */
  function textosAMano(idioma) {
    const es = (idioma === IDIOMA_ORIGEN);

    document.querySelectorAll("[data-en][data-es]").forEach(function (el) {
      const texto = es ? el.dataset.es : el.dataset.en;
      if (texto && el.textContent !== texto) el.textContent = texto;
    });

    /* Y LOS QUE ADEMÁS CAMBIAN DE ARCHIVO.
       Hasta acá esto solo cambiaba TEXTO. El botón del CV necesita algo más:
       hay un PDF en español y otro en inglés, así que además del rótulo tiene
       que cambiar a dónde apunta. Se declara igual que el resto, con un par
       de data-*, pero para el href.
       Va en un querySelectorAll aparte y no dentro del de arriba porque son
       dos cosas independientes: un elemento puede cambiar solo el texto (los
       botones de la nav), y mañana otro podría cambiar solo el archivo. */
    document.querySelectorAll("[data-href-es][data-href-en]").forEach(function (el) {
      const destino = es ? el.dataset.hrefEs : el.dataset.hrefEn;
      if (destino && el.getAttribute("href") !== destino) {
        el.setAttribute("href", destino);
      }
    });
  }

  /* --- 4. LOS BOTONES ---
     Se marca cuál está activo con las mismas clases que el resto de la nav, y
     se guarda la elección. aria-pressed es lo que le dice a un lector de
     pantalla cuál de los dos está puesto. */
  function pintarBotones(idioma) {
    textosAMano(idioma);
    document.querySelectorAll("[data-idioma]").forEach(function (b) {
      const suyo = b.dataset.idioma === idioma;
      b.classList.toggle("is-activa", suyo);
      b.setAttribute("aria-pressed", suyo ? "true" : "false");
    });
  }

  function idiomaGuardado() {
    try { return localStorage.getItem(MEMORIA) || IDIOMA_ORIGEN; }
    catch (e) { return IDIOMA_ORIGEN; }   // modo incógnito y similares
  }

  function guardar(idioma) {
    try { localStorage.setItem(MEMORIA, idioma); } catch (e) { /* da igual */ }
  }

  /* --- 5. ENGANCHAR ---
     La guarda va en el NODO, no en una variable de módulo: Swup reemplaza la
     nav entera en cada navegación, así que estos botones son OTROS nodos y hay
     que volver a engancharlos. (Misma razón que initHamburguesa en main.js.) */
  function init() {
    const botones = document.querySelectorAll("[data-idioma]");
    if (!botones.length) return;

    const actual = idiomaGuardado();
    pintarBotones(actual);

    botones.forEach(function (boton) {
      if (boton.dataset.listo) return;
      boton.dataset.listo = "1";

      boton.addEventListener("click", function () {
        const idioma = boton.dataset.idioma;
        if (idioma === idiomaGuardado()) return;   // ya estamos ahí

        guardar(idioma);
        pintarBotones(idioma);

        if (idioma === IDIOMA_ORIGEN) {
          // Volver al español: se recarga (ver la nota de arriba). Si la
          // página nunca llegó a traducirse no hay nada que deshacer.
          if (estaTraducido()) volverAlOriginal();
          return;
        }

        cargarWidget();
        cambiarA(idioma);
      });
    });

    /* Si en la visita anterior había quedado en inglés, se retraduce. Esto
       también cubre las navegaciones de Swup: la página nueva entra en español
       —es el HTML tal cual— y hay que volver a pedirle la traducción. */
    if (actual !== IDIOMA_ORIGEN) {
      cargarWidget();
      cambiarA(actual);
    }
  }

  window.initTraduccion = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
