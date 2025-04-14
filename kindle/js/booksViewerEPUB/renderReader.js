export let rendition; // Variable global para el objeto ePub Book
export let currentFontSizePercentage = 100; // Empezamos con el tamaño base
export const FONT_SIZE_STEP = 10; // Cuánto aumentar/disminuir cada vez (en puntos porcentuales)
const MAX_FONT_SIZE = 250; // Límite máximo de tamaño
const MIN_FONT_SIZE = 70; // Límite mínimo de tamaño

import { addHighlightEvent } from "./highlightReader.js";

export function updateFontSize(newFontSize) {
  

  currentFontSizePercentage = newFontSize;
  if (rendition) {
    console.log("Aplicando nuevo tamaño de fuente:", newFontSize, "%");
    rendition.themes.fontSize(newFontSize + "%"); // Aplica el nuevo tamaño de fuente
  
    const mainContainer = document.getElementById("main-container");
    const currentFontSizeSpan = mainContainer.querySelector("#current-font-size");
    currentFontSizeSpan.textContent = currentFontSizePercentage + "%";
  } else {
    console.warn("Rendition no está lista para cambiar el tamaño de fuente");
  }
}

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
          <button id="highlight-button" class="action-button disabled">Subrayar Selección</button>

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
    const fontFamilySelect = mainContainer.querySelector("#font-family-select");
    const closeFontMenuButton = mainContainer.querySelector("#close-font-menu");
  
    let book; // Variable para el objeto ePub Book
    let completePath = "./js/epubs/" + epubFilePath; // Ruta completa al archivo EPUB

  /** Muestra u oculta el menú de fuentes */
  function toggleFontMenu(show) {
    if (show) {
      fontMenu.classList.remove("hidden");
      fontMenu.style.display = "block"; // O 'flex', 'grid', etc. según tu CSS
      // Escuchar clics fuera del menú para cerrarlo
      document.addEventListener("click", handleClickOutsideMenu, true);
    } else {
      fontMenu.classList.add("hidden");
      fontMenu.style.display = "none";
      // Dejar de escuchar clics fuera
      document.removeEventListener("click", handleClickOutsideMenu, true);
    }
  }

  /** Manejador para cerrar el menú si se hace clic fuera de él */
  function handleClickOutsideMenu(event) {
    // Si el clic NO fue dentro del menú Y NO fue en el botón que lo abre
    if (
      !fontMenu.contains(event.target) &&
      !fontSettingsButton.contains(event.target)
    ) {
      toggleFontMenu(false); // Cierra el menú
    }
  }
  function updateFontFamily(newFontFamily) {
      if (rendition) {
        console.log("Aplicando nueva fuente:", newFontFamily);

        rendition.themes.font(newFontFamily);
      } else {
        console.warn("Rendition no está lista para cambiar la fuente");
      }
    };

  fetch(completePath) // Usa la ruta del archivo pasado a la función
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error al cargar el archivo EPUB: ${response.status} ${response.statusText}. <br>Asegura que la ruta: '${completePath}' es correcta.`
        );
      }
      console.log("Archivo EPUB obtenido, procesando...");
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

      fontSettingsButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Evita que el clic se propague al document y cierre el menú inmediatamente
        const isHidden = fontMenu.classList.contains("hidden");
        toggleFontMenu(isHidden); // Si está oculto, muéstralo, y viceversa
      });
     
      closeFontMenuButton.addEventListener("click", () => {
        toggleFontMenu(false);
      });

      // Botones de tamaño de fuente dentro del menú
      increaseFontButton.addEventListener("click", () => {
        updateFontSize(currentFontSizePercentage + FONT_SIZE_STEP);
      });
      decreaseFontButton.addEventListener("click", () => {
        updateFontSize(currentFontSizePercentage - FONT_SIZE_STEP);
      });

      // Selector de familia de fuentes dentro del menú
      fontFamilySelect.addEventListener("change", (event) => {
        updateFontFamily(event.target.value);
      });

      addHighlightEvent(rendition);
      // Muestra el contenido del libro. Devuelve una promesa.
      return rendition.display();
    })
    .then(() => {
      console.log("Libro mostrado correctamente.");
      // Aplicar estado inicial de fuente y tamaño al cargar
      updateFontSize(currentFontSizePercentage); // Aplica el 100% inicial
      updateFontFamily(fontFamilySelect.value); // Aplica la fuente seleccionada por defecto

      rendition.on("relocated", function (location) {
        // console.log("Nueva ubicación:", location.start.cfi);
        // Actualizar UI si es necesario
      });

      // Listeners de selección (útiles para depurar o para el highlight)
      if (rendition.manager && typeof rendition.manager.on === "function") {
        rendition.manager.on("selected", function (cfiRange, contents) {
          // console.log("Selección cambió (manager event):", cfiRange);
        });
      } else if (typeof rendition.on === "function") {
        rendition.on("selected", function (cfiRange, contents) {
          // console.log("Selección cambió (rendition event):", cfiRange);
        });
      }
    })
    // .catch((error) => {
    //   // Captura errores de fetch, ePub() o rendition.display()
    //   console.error("Error durante la carga o renderizado del EPUB:", error);
    //   if (viewer) {
    //     // Comprueba si viewer existe antes de modificarlo
    //     viewer.innerHTML = `<p class="viewer-message error-message">Error al cargar el libro: <br>${error.message}<br>Revisa la consola para más detalles.</p>`;
    //   }
    // });
}
