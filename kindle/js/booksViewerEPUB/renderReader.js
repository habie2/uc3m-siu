export let rendition; // Variable global para el objeto ePub Book

/**
 * Renderiza la interfaz del lector EPUB y carga el libro especificado.
 * @param {string} epubFilePath - La ruta al archivo .epub que se debe cargar.
 */
export function renderReader(epubFilePath) {
  const mainContainer = document.getElementById("main-container");
  if (!mainContainer) {
    console.error("Error: No se encontró el div #main-container.");
    return;
  }
  // clean contenedor principal
  mainContainer.innerHTML = "";
  const availableFonts = [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "sans-serif",
    "serif",
  ];
  // HTML del lector
  const readerHTML = `
        <div class="epub-reader">
        <div id="viewer-container" class="viewer-container">
          <div id="viewer" class="viewer"></div>
        </div>
        <div id="controls" class="controls">
          <button id="prev" class="action-button">Anterior</button>
          <button id="highlight-button" class="action-button">Subrayar Selección</button>

          <div class="font-control-wrapper"> <button id="font-settings-button" class="action-button">Fuente</button>
            <div id="font-menu" class="font-menu hidden"> <div class="font-menu-section">
                    <span>Tamaño:</span>
                    <button id="decrease-font" aria-label="Disminuir tamaño de fuente">-</button>
                    <span id="current-font-size">100%</span> <button id="increase-font" aria-label="Aumentar tamaño de fuente">+</button>
                </div>
                <div class="font-menu-section">
                    <label for="font-family-select">Fuente:</label>
                    <select id="font-family-select">
                        ${availableFonts
                          .map(
                            (font) => `<option value="${font}">${font}</option>`
                          )
                          .join("")}
                    </select>
                </div>
                <button id="close-font-menu" class="close-button" aria-label="Cerrar menú de fuente">×</button>
            </div>
          </div>

          <button id="next" class="action-button">Siguiente</button>
        </div>
      </div>
    `;
  mainContainer.innerHTML = readerHTML;


    // --- Selección de Elementos del DOM ---
    const viewer = mainContainer.querySelector("#viewer");
    const prevButton = mainContainer.querySelector("#prev");
    const nextButton = mainContainer.querySelector("#next");
    const highlightButton = mainContainer.querySelector("#highlight-button");
    const fontSettingsButton = mainContainer.querySelector(
      "#font-settings-button"
    ); // El botón que abre el menú
    const fontMenu = mainContainer.querySelector("#font-menu"); // El menú contextual
    const decreaseFontButton = mainContainer.querySelector("#decrease-font");
    const increaseFontButton = mainContainer.querySelector("#increase-font");
    const currentFontSizeSpan = mainContainer.querySelector("#current-font-size");
    const fontFamilySelect = mainContainer.querySelector("#font-family-select");
    const closeFontMenuButton = mainContainer.querySelector("#close-font-menu");
  
    let book; // Variable para el objeto ePub Book
    let completePath = "./js/epubs/" + epubFilePath; // Ruta completa al archivo EPUB

  // setRenditionInstance(null); // limpia la instancia anterior

  fetch(completePath) // Usa la ruta del archivo pasado a la función
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error al cargar el archivo EPUB: ${response.status} ${response.statusText}. <br>Asegura que la ruta: '${completePath}' es correcta.`
        );
      }
      console.log("Archivo EPUB obtenido, procesando...");
      console.log("*******Rendition creado y listo para mostrar el libro.");
      return response.arrayBuffer(); // Obtiene el contenido como ArrayBuffer
    })
    .then((arrayBuffer) => {
      book = ePub(arrayBuffer); // Crea el objeto Book de ePub.js

      rendition = book.renderTo("viewer", {
        // Renderiza en el #viewer que acabamos de crear
        width: "100%",
        height: "100%", // Asegúrate que el contenedor tenga altura definida en CSS
        flow: "paginated", // "paginated" o "scrolled-doc"
        spread: "none", // Opcional: para vista de dos páginas en pantallas anchas
      });
      console.log("*******Rendition creado y listo para mostrar el libro.");
      // setRenditionInstance(rendition); // Establece la instancia de rendition en el módulo de navegación

      // Añade los listeners para los botones *después* de que rendition esté lista
      prevButton.addEventListener("click", () => {
        if (rendition) {
          console.log("Botón 'Anterior' clickeado.");
          rendition.prev();
        } else {
          console.warn("Rendition no está lista (prev)");
        }
      });

      nextButton.addEventListener("click", () => {
        if (rendition) {
          console.log("Botón 'Siguiente' clickeado.");
          rendition.next();
        } else {
          console.warn("Rendition no está lista (next)");
        }
      });

      let currentFontSizePercentage = 100; // Empezamos asumiendo el 100% inicial

      fontSettingsButton.addEventListener("click", () => {
        if (rendition) {
          console.log("Botón 'Aumentar Fuente' clickeado.");

          // 2. Calcula el nuevo porcentaje: Aumenta el actual en un 20%
          // Multiplicar por 1.20 es lo mismo que añadir el 20%
          currentFontSizePercentage *= 1.2;

          // Opcional: Redondear para evitar demasiados decimales (puedes ajustar)
          currentFontSizePercentage = Math.round(currentFontSizePercentage);

          // Opcional: Poner un límite máximo si no quieres que crezca indefinidamente
          // if (currentFontSizePercentage > 300) { // Ejemplo: Límite del 300%
          //   currentFontSizePercentage = 300;
          //   console.log("Tamaño máximo alcanzado.");
          // }

          // 3. Convierte el nuevo porcentaje a un string para la función
          const newSizeString = currentFontSizePercentage + "%";
          console.log("Aplicando nuevo tamaño de fuente:", newSizeString);

          // 4. Aplica el nuevo tamaño de fuente
          rendition.themes.fontSize(newSizeString);
        } else {
          console.warn("Rendition no está lista (font)");
        }
      });

      // Muestra el contenido del libro. Devuelve una promesa.
      return rendition.display();
    })
    .then(() => {
      console.log("Libro mostrado correctamente.");
      // Puedes añadir listeners a eventos de la rendition aquí si lo necesitas
      rendition.on("relocated", function (location) {
        console.log("Nueva ubicación:", location.start.cfi);
        // Aquí podrías actualizar un indicador de progreso o capítulo actual
      });

      // Listener para cuando la selección cambie (útil para depurar)
      if (rendition.manager && typeof rendition.manager.on === "function") {
        rendition.manager.on("selected", function (cfiRange, contents) {
          console.log("Selección cambió (manager event):", cfiRange);
        });
      } else if (typeof rendition.on === "function") {
        rendition.on("selected", function (cfiRange, contents) {
          console.log("Selección cambió (rendition event):", cfiRange);
        });
      }
    })
    .catch((error) => {
      // Captura errores de fetch, ePub() o rendition.display()
      console.error("Error durante la carga o renderizado del EPUB:", error);
      if (viewer) {
        // Comprueba si viewer existe antes de modificarlo
        viewer.innerHTML = `<p class="viewer-message error-message">Error al cargar el libro: <br>${error.message}<br>Revisa la consola para más detalles.</p>`;
      }
    });
}
