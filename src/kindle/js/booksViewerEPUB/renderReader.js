import { applyTranslation } from "./translationUtils.js";
import { applyNote } from "./noteUtils.js";
import { applyHighlight } from "./highlightReader.js"; 

export let rendition = null;
export let currentFontSizePercentage = 100;
export const FONT_SIZE_STEP = 10;
const MAX_FONT_SIZE = 250;
const MIN_FONT_SIZE = 70;

let book = null; 
let seleccionActual = null; 

function updateFontSize(newFontSize) {
  currentFontSizePercentage = Math.max(
    MIN_FONT_SIZE,
    Math.min(newFontSize, MAX_FONT_SIZE)
  );
  if (rendition) {
    rendition.themes.fontSize(currentFontSizePercentage + "%");
    const currentFontSizeSpan = document.getElementById("current-font-size");
    if (currentFontSizeSpan) {
      currentFontSizeSpan.textContent = currentFontSizePercentage + "%";
    }
  } else {
    console.warn("Rendition no está lista para cambiar tamaño fuente");
  }
}

function updateFontFamily(newFontFamily) {
  if (rendition) {
    rendition.themes.font(newFontFamily);
  } else {
    console.warn("Rendition no está lista para cambiar fuente");
  }
}

/**
 * Manejador para cerrar el menú de fuentes si se hace clic fuera de él.
 * @param {Event} event - El evento de clic.
 */
function handleClickOutsideMenu(event) {
    const fontMenu = document.getElementById("font-menu");
    const fontSettingsButton = document.getElementById("font-settings-button");
    // Si el menú existe y el clic NO fue dentro del menú Y NO fue en el botón que lo abre
    if (fontMenu && fontSettingsButton &&
        !fontMenu.classList.contains('hidden') && // Solo actuar si está abierto
        !fontMenu.contains(event.target) &&
        !fontSettingsButton.contains(event.target))
    {
        console.log("Clic fuera del menú de fuente, cerrando.");
        toggleFontMenu(false); // Cierra menú
    }
}

/**
 * Muestra u oculta el menú de fuentes, gestionando la clase 'hidden',
 * el estilo 'display' y el listener para clics externos.
 * @param {boolean} show - True para mostrar, false para ocultar.
 */
function toggleFontMenu(show) {
    const fontMenu = document.getElementById("font-menu");
    if (!fontMenu) {
        console.error("Elemento #font-menu no encontrado");
        return;
    }

    if (show) {
        console.log("Mostrando menú de fuente");
        fontMenu.classList.remove("hidden");
        fontMenu.style.display = "block"; 
        // Escuchar clics fuera del menú para cerrarlo 
        setTimeout(() => {
             document.addEventListener("click", handleClickOutsideMenu, true);
             console.log("Listener para clic fuera AÑADIDO");
        }, 0);
    } else {
        console.log("Ocultando menú de fuente");
        fontMenu.classList.add("hidden");
        fontMenu.style.display = "none"; 
        document.removeEventListener("click", handleClickOutsideMenu, true);
        console.log("Listener para clic fuera ELIMINADO");
    }
}

function toggleActionButtons(enable) {
  const highlightButton = document.getElementById("highlight-button");
  const translateButton = document.getElementById("translate-button");
  const addNoteButton = document.getElementById("add-note-button");

  if (highlightButton) highlightButton.disabled = !enable;
  if (translateButton) translateButton.disabled = !enable;
  if (addNoteButton) addNoteButton.disabled = !enable;
}

function clearSelection() {
  if (seleccionActual) {
    console.log("Limpiando selección guardada.");
  }
  seleccionActual = null;
  toggleActionButtons(false);
  const noteInputContainer = document.getElementById("note-input-container");
  if (noteInputContainer) {
    noteInputContainer.classList.add("hidden"); // Asegurarse de ocultar input de nota
  }
}

/**
 * Renderiza la interfaz del lector EPUB y carga el libro especificado.
 * @param {string} epubFilePath - La ruta RELATIVA al archivo .epub (ej: 'mi-libro.epub').
 */
export function renderReader(epubFilePath) {
  const mainContainer = document.getElementById("main-container");
  if (!mainContainer) {
    console.error("Error: No se encontró el div #main-container.");
    return;
  }
  mainContainer.innerHTML = "";

  const availableFonts = [
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "sans-serif",
    "serif",
  ];
  const basePath = "./js/epubs/"; 
  const completePath = basePath + epubFilePath;

  // HTML del lector
  const readerHTML = `
        <div class="epub-reader">
            <div id="viewer-container" class="viewer-container">
                <div id="viewer" class="viewer"></div>
                <div id="note-input-container" class="note-input-container hidden">
                    <input type="text" id="note-input-text" placeholder="Escribe tu nota y presiona Enter...">
                    <button id="note-input-cancel" class="note-cancel-button" aria-label="Cancelar nota">X</button>
                </div>
            </div>
            <div id="controls" class="controls">
                <button id="prev" class="action-button">Anterior</button>
                <button id="highlight-button" class="action-button disabled">Subrayar</button>
                <button id="translate-button" class="action-button disabled">Traducir</button>
                <button id="add-note-button" class="action-button disabled">Añadir Nota</button>

                <div class="font-control-wrapper">
                    <button id="font-settings-button" class="action-button">Fuente</button>
                    <div id="font-menu" class="font-menu hidden">
                         <div class="font-menu-section">
                            <span>Tamaño:</span>
                            <button id="decrease-font" aria-label="Disminuir tamaño de fuente">-</button>
                            <span id="current-font-size">${currentFontSizePercentage}%</span>
                            <button id="increase-font" aria-label="Aumentar tamaño de fuente">+</button>
                        </div>
                        <div class="font-menu-section">
                            <label for="font-family-select">Fuente:</label>
                            <select id="font-family-select">
                                ${availableFonts
                                  .map(
                                    (font) =>
                                      `<option value="${font}">${font}</option>`
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
  const translateButton = mainContainer.querySelector("#translate-button");
  const addNoteButton = mainContainer.querySelector("#add-note-button");
  const fontSettingsButton = mainContainer.querySelector(
    "#font-settings-button"
  );
  const fontMenu = mainContainer.querySelector("#font-menu");
  const decreaseFontButton = mainContainer.querySelector("#decrease-font");
  const increaseFontButton = mainContainer.querySelector("#increase-font");
  const fontFamilySelect = mainContainer.querySelector("#font-family-select");
  const closeFontMenuButton = mainContainer.querySelector("#close-font-menu");
  const noteInputContainer = mainContainer.querySelector(
    "#note-input-container"
  );
  const noteInputText = mainContainer.querySelector("#note-input-text");
  const noteInputCancel = mainContainer.querySelector("#note-input-cancel");

  fetch(completePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error ${response.status} al cargar EPUB: ${response.statusText}. Ruta: '${completePath}'`
        );
      }
      console.log("EPUB obtenido, procesando...");
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      book = ePub(arrayBuffer);
      rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated", 
        manager: "continuous",
        spread: "none", 
        allowScriptedContent: true, 
      });

      prevButton.addEventListener("click", () => rendition?.prev());
      nextButton.addEventListener("click", () => rendition?.next());

      fontSettingsButton.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleFontMenu(fontMenu.classList.contains("hidden"));
      });
      closeFontMenuButton.addEventListener("click", () =>
        toggleFontMenu(false)
      );
      increaseFontButton.addEventListener("click", () =>
        updateFontSize(currentFontSizePercentage + FONT_SIZE_STEP)
      );
      decreaseFontButton.addEventListener("click", () =>
        updateFontSize(currentFontSizePercentage - FONT_SIZE_STEP)
      );
      fontFamilySelect.addEventListener("change", (event) =>
        updateFontFamily(event.target.value)
      );

      rendition.on("selected", (cfiRange, contents) => {
        const textoSeleccionado = contents.window
          .getSelection()
          .toString()
          .trim();
        if (textoSeleccionado) {
          console.log("Seleccionado:", textoSeleccionado);
          seleccionActual = { cfiRange, texto: textoSeleccionado };
          toggleActionButtons(true);
          noteInputContainer.classList.add("hidden"); 
        }
      });

      rendition.on("rendered", (section, view) => {
        view.document.addEventListener("click", (event) => {
          setTimeout(() => {
            const currentSelection = view.window
              .getSelection()
              ?.toString()
              .trim();
            if (
              !currentSelection &&
              seleccionActual &&
              noteInputContainer.classList.contains("hidden")
            ) {
              clearSelection();
            }
          }, 50);
        });
        view.document.addEventListener("keydown", (event) => {
          if (
            event.key === "Escape" &&
            !noteInputContainer.classList.contains("hidden")
          ) {
            noteInputContainer.classList.add("hidden");
            clearSelection();
          }
        });
      });

      highlightButton.addEventListener("click", () => {
        if (seleccionActual?.cfiRange && rendition) {
          if (applyHighlight(seleccionActual.cfiRange)) {
            clearSelection();
          }
        }
      });

      translateButton.addEventListener("click", async () => {
        if (seleccionActual?.cfiRange && seleccionActual?.texto && rendition) {
          const success = await applyTranslation(
            seleccionActual.cfiRange,
            seleccionActual.texto
          );
          if (success) {
            clearSelection();
          } else {
            alert("La traducción (simulada) falló."); 
          }
        }
      });

      addNoteButton.addEventListener("click", () => {
        if (seleccionActual?.cfiRange) {
          noteInputContainer.classList.remove("hidden");
          noteInputText.value = "";
          noteInputText.focus();
          toggleActionButtons(false); 
        }
      });

      noteInputText.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          const nota = noteInputText.value.trim();
          if (nota && seleccionActual?.cfiRange && rendition) {
            if (applyNote(seleccionActual.cfiRange, nota)) {
              noteInputContainer.classList.add("hidden");
              clearSelection();
            } else {
              alert("Error al guardar la nota."); 
            }
          } else if (!nota) {
            // Si presiona Enter sin texto, cancelar
            noteInputContainer.classList.add("hidden");
            clearSelection();
          }
        }
      });

      // Input de Nota: Botón Cancelar
      noteInputCancel.addEventListener("click", () => {
        noteInputContainer.classList.add("hidden");
        clearSelection();
      });

      // Mostrar el libro
      console.log("Mostrando rendition...");
      return rendition.display();
    })
    .then(() => {
      console.log("Libro mostrado correctamente.");
      updateFontSize(currentFontSizePercentage);
      updateFontFamily(fontFamilySelect.value);

      rendition.on("relocated", (location) => {
        console.log("Ubicación cambiada, limpiando selección.");
        clearSelection(); 
      });

    })
    .catch((error) => {
      console.error("Error fatal durante carga o renderizado del EPUB:", error);
      if (viewer) {
        viewer.innerHTML = `<p class="viewer-message error-message">Error al cargar el libro: <br>${error.message}<br>Revisa la consola.</p>`;
      }
      const controls = document.getElementById("controls");
      if (controls) controls.style.display = "none"; 
    });
}
