/* ==========================================================================
   MUESTRAS.JS
   Las tres animaciones cortas de pieza que van dentro de la explicación
   (árbol, hongo, alga).

   Es un módulo aparte del scrubbing del ensamble a propósito: acá el scroll
   NO controla la animación. Estas se reproducen solas, en loop, y únicamente
   mientras están a la vista. Motivo: son tres cuadritos chicos metidos en
   medio del texto; hacerlas depender del scroll obligaría a scrollear con
   precisión sobre cada una para entender qué muestra, y son ilustraciones,
   no el número central de la página.

   Si algún día querés que se recorran con el scroll como la del ensamble,
   la parte de carga se reusa igual: lo único que cambia es quién decide el
   frame (acá lo decide un reloj, allá el scroll).
   ========================================================================== */

// Con nombre y no como función anónima: Swup necesita poder volver a
// llamarla cuando cambia de página sin recargar.
window.initMuestras = function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. CONFIGURACIÓN DE CADA MUESTRA
     La clave es el valor del atributo data-muestra en el HTML.

     Los rangos NO empiezan en 0: son los números con los que Blender exportó
     cada secuencia y se respetan tal cual, para no tener que renombrar
     cientos de archivos a mano.
     ------------------------------------------------------------------------ */

  /* ENCUADRE (zoom, cx, cy) — no son números a ojo.
     Cada secuencia salió de Blender con la pieza en un lugar y un tamaño
     distintos dentro del cuadro, así que dibujadas "tal cual" se veían
     desalineadas y de tamaños dispares. Medí en qué rectángulo cae la pieza
     en cada secuencia (comparando pixel por pixel contra el crema del fondo)
     y de ahí salieron estos valores:

       secuencia   pieza ocupa (del cuadro)   centro de la pieza
       árbol       24% ancho · 84% alto       (0.472, 0.479)
       hongos      49% ancho · 74% alto       (0.506, 0.449)
       algas       42% ancho · 48% alto       (0.517, 0.533)

     · cx / cy = dónde está el centro de la pieza. El dibujo se corre para
       que ese punto caiga en el centro del cuadro, no el centro de la imagen.
     · zoom = cuánto agrandar para que las tres piezas midan lo mismo en
       pantalla (apunté a que ocupen ~62% del alto de su caja).
     Si algún día se re-renderiza una secuencia con otro encuadre, hay que
     volver a medir y actualizar su fila. */

  /* ZOOM EN 1 — POR QUÉ.
     Antes cada secuencia tenía un zoom de 1.30 a 1.49 para que las tres
     piezas se vieran del mismo tamaño, cuando iban las tres juntas en una
     fila. Ese zoom agranda el dibujo más allá del cuadro: todo lo que se
     pasa NO se dibuja, y eso era el recorte que se veía.
     Ahora cada pieza tiene su propia pantalla y no necesita igualar a las
     otras, así que el zoom vuelve a 1: el cuadro entra completo y no se
     recorta nada. El cx/cy se mantiene, porque eso no recorta — solo centra
     la pieza en vez del centro de la imagen. */
  /* ZOOM EN MOBILE — POR QUÉ EXISTE Y CÓMO SE CALCULÓ (20/08/2026)
     En escritorio el cuadro mide más de 1100px de ancho y la pieza se ve
     grande aunque el render traiga mucho aire alrededor. En un teléfono el
     mismo cuadro mide 342px: la pieza del árbol quedaba de 80px, ilegible.

     Agrandar el cuadro no sirve: el dibujo entra "contenido", así que lo que
     manda es el ANCHO disponible, y más alto no agranda nada. La única
     palanca real es agrandar el dibujo y dejar que el aire sobrante se salga
     del cuadro. Eso es el zoom.

     EL RIESGO ES RECORTAR LA PIEZA, y ya nos pasó una vez. Por eso cada valor
     sale de una cuenta y no del ojo. Con la pieza centrada en (cx, cy), su
     mitad más larga es lo que decide cuánto se puede agrandar:

     VA DE LA MANO CON EL CSS: en el teléfono el cuadro deja de ser 16:9 y
     pasa a ser VERTICAL (4/5) — ver .pantalla--pieza .muestra__marco en el
     bloque mobile de simbio.css. Es lo que le da alto a la pieza para poder
     crecer; con el cuadro apaisado, el árbol (que es alto y angosto) no podía
     pasar de 1.19 sin cortarse. Si cambia una, hay que cambiar la otra.

     Con el cuadro vertical de 342x428 y el dibujo entrando contenido, estos
     son los topes y lo que quedó puesto:

       secuencia   pieza ocupa     lo que la frena        tope   puesto
       árbol       24% w · 84% h   el alto de la pieza    2.65   2.20
       hongos      49% w · 74% h   el ancho de la pieza   2.04   1.70
       algas       42% w · 48% h   el ancho de la pieza   2.38   2.00

     El valor puesto es ~83% del tope: margen por si la pieza se desplaza unos
     píxeles a lo largo de la secuencia (son animaciones, no fotos).
     Lo que se sale del cuadro es SIEMPRE aire vacío del render, nunca pieza. */
  const MUESTRAS = {
    "muestra-piezas-hongos": { carpeta: "muestra-piezas-hongos-web", primero: 450, ultimo: 550, zoom: 1, zoomMobile: 1.70, cx: 0.506, cy: 0.449 },
    "muestra-alga":          { carpeta: "muestra-alga-web",          primero: 350, ultimo: 450, zoom: 1, zoomMobile: 2.00, cx: 0.517, cy: 0.533 },
    "muestra-pieza-arbol":   { carpeta: "muestra-pieza-arbol-web",   primero: 551, ultimo: 651, zoom: 1, zoomMobile: 2.20, cx: 0.472, cy: 0.479 },
  };

  // El mismo corte que usa el CSS (620px). Si cambia allá, cambia acá.
  const esTelefono = () => window.matchMedia("(max-width: 620px)").matches;

  const FPS = 24;                 // velocidad de reproducción
  const PAUSA_EN_PUNTA = 500;     // ms de espera en cada extremo antes de volver
  const CARGAS_EN_PARALELO = 6;

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     2. UNA MUESTRA
     ------------------------------------------------------------------------ */

  function armarMuestra(figura) {
    const clave = figura.dataset.muestra;
    const config = MUESTRAS[clave];
    const canvas = figura.querySelector(".muestra__canvas");
    const aviso = figura.querySelector(".muestra__falta");
    if (!config || !canvas) return;

    const total = config.ultimo - config.primero + 1;
    if (total <= 1) return; // carpeta todavía vacía: queda el aviso puesto

    const ctx = canvas.getContext("2d");
    const imagenes = new Array(total).fill(null);
    const ruta = (i) =>
      "../assets/simbio/" + config.carpeta + "/" +
      String(config.primero + i).padStart(4, "0") + ".jpg";

    let cargadas = 0;
    let frame = 0;
    let direccion = 1;      // 1 = va, -1 = vuelve. El loop es de rebote.
    let corriendo = false;
    let ultimoDibujo = 0;
    let esperaHasta = 0;    // pausa en las puntas antes de dar la vuelta

    function cargarUna(i) {
      return new Promise((resolve) => {
        const img = new Image();
        let listo = false;
        const terminar = (v) => {
          if (listo) return;
          listo = true;
          clearTimeout(reloj);
          resolve(v);
        };
        // Mismo cuidado que en el ensamble: una request colgada no puede
        // dejar la promesa sin resolver para siempre.
        const reloj = setTimeout(() => { img.src = ""; terminar(null); }, 12000);
        img.onload = () => terminar(img);
        img.onerror = () => terminar(null);
        img.src = ruta(i);
      });
    }

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const caja = canvas.getBoundingClientRect();
      canvas.width = Math.round(caja.width * dpr);
      canvas.height = Math.round(caja.height * dpr);

      // Filtrado en alta al reescalar. Tiene que ir después de cambiar
      // width/height: eso resetea el estado del contexto.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    function dibujar(i) {
      const img = imagenes[i];
      if (!img) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Entra completo en la caja y después se agranda por el zoom del
      // encuadre. Lo que se salga es crema vacío: la pieza nunca se recorta.
      // El zoom se lee EN CADA DIBUJO y no una vez al arrancar: así, si girás
      // el teléfono o cambiás el tamaño de la ventana, el encuadre se corrige
      // solo en el cuadro siguiente.
      const zoom = (esTelefono() && config.zoomMobile) || config.zoom || 1;
      const escala =
        Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;

      const w = img.width * escala;
      const h = img.height * escala;

      // Se centra el CENTRO DE LA PIEZA, no el centro de la imagen: por eso
      // se resta w*cx en vez de w/2. Es lo que alinea las tres entre sí.
      const cx = config.cx != null ? config.cx : 0.5;
      const cy = config.cy != null ? config.cy : 0.5;
      ctx.drawImage(img, canvas.width / 2 - w * cx, canvas.height / 2 - h * cy, w, h);
    }

    // Bucle de reproducción, de REBOTE: llega al final, espera un momento y
    // vuelve para atrás. Sin corte ni salto, porque nunca reinicia desde el
    // primer cuadro: cambia el sentido.
    //
    // Avanza por reloj y no por frame de video: en un monitor de 120Hz, si
    // dibujáramos en cada repintado, la animación iría al doble de velocidad.
    function loop(ahora) {
      if (!corriendo) return;
      requestAnimationFrame(loop);

      // Pausa en la punta: seguimos pidiendo frames pero sin avanzar
      if (ahora < esperaHasta) return;

      if (ahora - ultimoDibujo < 1000 / FPS) return;
      ultimoDibujo = ahora;

      dibujar(frame);
      frame += direccion;

      // ¿Llegamos a una punta? Damos la vuelta y esperamos un momento.
      if (frame >= total || frame < 0) {
        direccion = -direccion;
        // Al invertir, el siguiente cuadro es el vecino del extremo, no el
        // extremo otra vez: si no, ese cuadro se vería dos veces y se nota
        // como un tranco en el movimiento.
        frame += direccion * 2;
        esperaHasta = ahora + PAUSA_EN_PUNTA;
        // SOUND HOOK: muestra-rebote
      }
    }

    async function cargar() {
      let siguiente = 0;

      async function obrero() {
        while (siguiente < total) {
          const i = siguiente++;
          imagenes[i] = await cargarUna(i);
          cargadas++;
        }
      }

      const obreros = [];
      for (let i = 0; i < CARGAS_EN_PARALELO; i++) obreros.push(obrero());
      await Promise.all(obreros);
    }

    /* --- Arranque: no se carga nada hasta que la muestra se acerca ---
       Tres animaciones a la vez son cientos de imágenes. Si se cargaran al
       abrir la página, competirían con los frames del ensamble y con la
       foto. Así, cada una se carga cuando el usuario está por llegar. */

    let iniciada = false;

    const observador = new IntersectionObserver(async (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting && !iniciada) {
          iniciada = true;

          // Nada de "cargando…": mientras baja, sigue el cartel de siempre.
          // Cuando está lista, la animación entra con un fade (lo hace el
          // CSS con la clase .is-lista).
          await cargar();

          // Si terminó la carga y no entró ni una sola imagen, el cartel deja
          // de decir "Cargando": ahí sí falta el material y hay que decirlo,
          // porque un "Cargando" eterno es exactamente lo que parece roto.
          if (!imagenes.some(Boolean)) {
            if (aviso) aviso.textContent = "No se pudieron cargar los frames";
            return;
          }

          medir();
          dibujar(0);                     // primer cuadro antes de destapar
          if (aviso) aviso.hidden = true;
          figura.classList.add("is-lista"); // dispara el fade

          // Con movimiento reducido: un cuadro fijo, el del final, sin loop.
          if (sinMovimiento) { dibujar(total - 1); return; }

          corriendo = true;
          requestAnimationFrame(loop);
          continue;
        }

        // Ya cargada: se pausa al salir de pantalla y sigue al volver.
        // Sin esto, tres loops seguirían dibujando fuera de la vista.
        if (!iniciada || sinMovimiento) continue;
        corriendo = entrada.isIntersecting;
        if (corriendo) requestAnimationFrame(loop);
      }
    }, { rootMargin: "200px 0px" });

    observador.observe(figura);

    // ResizeObserver y no el resize de la ventana: con el hover, la columna
    // de la muestra cambia de ancho sin que la ventana se mueva. Si no
    // remedimos ahí, el canvas se estira con la misma cantidad de píxeles y
    // la animación se ve borrosa justo cuando está grande y se la mira.
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        if (!iniciada) return;
        medir();
        dibujar(Math.min(frame, total - 1));
      }).observe(canvas);
    }

    window.addEventListener("resize", () => {
      medir();
      dibujar(frame < total ? frame : total - 1);
    });
  }

  /* ------------------------------------------------------------------------
     3. ARRANQUE
     ------------------------------------------------------------------------ */

  document.querySelectorAll("[data-muestra]").forEach(armarMuestra);
};

window.initMuestras();
