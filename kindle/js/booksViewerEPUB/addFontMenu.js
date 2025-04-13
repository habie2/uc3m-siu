import { rendition } from "./renderReader";

export function increaseFontSize() {};
export function decreaseFontSize() {};
export function changeFont() {};

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
  // Limpiar contenedor principal
  mainContainer.innerHTML = "";

  // Lista de fuentes disponibles para el menú
  const availableFonts = [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "sans-serif",
    "serif",
  ];

  // --- HTML del Lector con el Menú de Fuentes ---
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

  // --- Variables de Estado ---
  let book; // Variable para el objeto ePub Book
  let rendition; // Variable que es el viewer como tal del libro
  let completePath = "./js/epubs/" + epubFilePath; // Ruta completa al archivo EPUB
  let currentFontSizePercentage = 100; // Empezamos con el tamaño base
  const FONT_SIZE_STEP = 10; // Cuánto aumentar/disminuir cada vez (en puntos porcentuales)
  const MAX_FONT_SIZE = 250; // Límite máximo de tamaño
  const MIN_FONT_SIZE = 70; // Límite mínimo de tamaño

  // --- Funciones Auxiliares ---
  /** Actualiza el tamaño de la fuente en la rendition y en la UI */
  function updateFontSize(newSizePercentage) {
    // Validar límites
    newSizePercentage = Math.max(
      MIN_FONT_SIZE,
      Math.min(newSizePercentage, MAX_FONT_SIZE)
    );
    currentFontSizePercentage = newSizePercentage; // Actualizar estado

    if (rendition) {
      const newSizeString = currentFontSizePercentage + "%";
      console.log("Aplicando nuevo tamaño de fuente:", newSizeString);
      rendition.themes.fontSize(newSizeString);
      currentFontSizeSpan.textContent = newSizeString; // Actualizar la UI
    } else {
      console.warn("Rendition no está lista para cambiar tamaño de fuente");
    }
  }

  /** Actualiza la familia de fuentes en la rendition */
  function updateFontFamily(newFontFamily) {
    if (rendition) {
      console.log("Aplicando nueva fuente:", newFontFamily);
      rendition.themes.font(newFontFamily);
    } else {
      console.warn("Rendition no está lista para cambiar la fuente");
    }
  }

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

  // --- Carga y Renderizado del EPUB ---
  fetch(completePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error al cargar el archivo EPUB: ${response.status} ${response.statusText}. <br>Asegura que la ruta: '${completePath}' es correcta.`
        );
      }
      console.log("Archivo EPUB obtenido, procesando...");
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      book = ePub(arrayBuffer);

      rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        spread: "none",
        // Podrías definir un tema por defecto aquí si quisieras
        // themes: book.themes // Puedes usar los temas del libro o definir los tuyos
      });

      // Inicializar la UI del menú con los valores por defecto
      currentFontSizeSpan.textContent = currentFontSizePercentage + "%";
      // Opcional: Seleccionar la fuente por defecto en el dropdown si la conoces
      // fontFamilySelect.value = rendition.themes.current.rules['*'].fontFamily || availableFonts[0];

      // --- Añadir Event Listeners (DESPUÉS de que rendition esté lista) ---

      // Navegación
      prevButton.addEventListener("click", () => {
        rendition
          ?.prev()
          .catch((err) =>
            console.warn("Error al ir a la página anterior:", err)
          );
      });
      nextButton.addEventListener("click", () => {
        rendition
          ?.next()
          .catch((err) =>
            console.warn("Error al ir a la página siguiente:", err)
          );
      });

      // Botón para abrir/cerrar el menú de fuentes
      fontSettingsButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Evita que el clic se propague al document y cierre el menú inmediatamente
        const isHidden = fontMenu.classList.contains("hidden");
        toggleFontMenu(isHidden); // Si está oculto, muéstralo, y viceversa
      });

      // Botón para cerrar el menú explícitamente
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

      // Listener para subrayar (si lo tienes implementado)
      highlightButton.addEventListener("click", () => {
        // Aquí iría tu lógica para subrayar la selección actual
        // Ejemplo básico (necesitarás adaptarlo a cómo guardas/aplicas highlights):
        try {
          const currentSelection = rendition.getRange(
            rendition.location.start.cfi
          ); // O usa rendition.selection.get()
          if (currentSelection) {
            // rendition.annotations.highlight(currentSelection.cfiRange, {}, (e) => {
            //    console.log("Highlight añadido", e);
            // });
            console.log(
              "Subrayar selección (lógica pendiente):",
              currentSelection.cfiRange
            );
          } else {
            console.log("No hay nada seleccionado para subrayar.");
          }
        } catch (error) {
          console.error("Error al obtener o subrayar selección:", error);
        }
      });

      // Muestra el contenido del libro
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
    .catch((error) => {
      console.error("Error durante la carga o renderizado del EPUB:", error);
      if (viewer) {
        viewer.innerHTML = `<p class="viewer-message error-message">Error al cargar el libro: <br>${error.message}<br>Revisa la consola para más detalles.</p>`;
      }
    });
}
