console.log("Script iniciado.");

// --- Constants ---
const HIGHLIGHT_STORAGE_KEY = "epubReaderHighlights"; // Key for localStorage

// --- State Variables ---
let book = null;
let rendition = null;
let currentSelectionCfiRange = null;
let currentBookId = null; // To store the identifier (filename) of the current book

// --- DOM Elements ---
// Ensure the script runs after the DOM is loaded (using 'defer' in HTML script tag)
const fileInput = document.getElementById("file-input");
const viewer = document.getElementById("viewer");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const highlightButton = document.getElementById("highlight-button");
const fileInfo = document.getElementById("file-info");

// Check if elements were found (basic check)
if (
  !fileInput ||
  !viewer ||
  !prevButton ||
  !nextButton ||
  !highlightButton ||
  !fileInfo
) {
  console.error(
    "Error: No se encontraron uno o más elementos del DOM necesarios."
  );
  // Optionally display an error to the user
} else {
  console.log("Elementos DOM obtenidos correctamente.");
}

// --- LocalStorage Helper Functions ---

/**
 * Retrieves all highlights from localStorage.
 * @returns {object} An object where keys are book IDs and values are arrays of CFI strings.
 */
function getHighlightsFromStorage() {
  try {
    const storedData = localStorage.getItem(HIGHLIGHT_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : {};
  } catch (error) {
    console.error("Error al leer subrayados del localStorage:", error);
    return {}; // Return empty object on error
  }
}

/**
 * Saves the entire highlights data object to localStorage.
 * @param {object} data - The highlights data object.
 */
function saveHighlightsToStorage(data) {
  try {
    localStorage.setItem(HIGHLIGHT_STORAGE_KEY, JSON.stringify(data));
    console.log("Subrayados guardados en localStorage.");
  } catch (error) {
    console.error("Error al guardar subrayados en localStorage:", error);
    // Notify user? Could be due to storage limits.
    alert(
      "No se pudieron guardar los subrayados. Es posible que el almacenamiento esté lleno."
    );
  }
}

/**
 * Adds a highlight CFI range for a specific book ID to storage.
 * @param {string} bookId - The identifier of the book.
 * @param {string} cfiRange - The CFI range string of the highlight.
 */
function addHighlightToStorage(bookId, cfiRange) {
  if (!bookId || !cfiRange) return;
  const highlights = getHighlightsFromStorage();
  if (!highlights[bookId]) {
    highlights[bookId] = [];
  }
  // Avoid duplicates
  if (!highlights[bookId].includes(cfiRange)) {
    highlights[bookId].push(cfiRange);
    saveHighlightsToStorage(highlights);
    console.log(`Subrayado añadido para ${bookId}: ${cfiRange}`);
  } else {
    console.log(`Subrayado duplicado ignorado para ${bookId}: ${cfiRange}`);
  }
}

/**
 * Removes a highlight CFI range for a specific book ID from storage.
 * @param {string} bookId - The identifier of the book.
 * @param {string} cfiRange - The CFI range string of the highlight to remove.
 */
function removeHighlightFromStorage(bookId, cfiRange) {
  if (!bookId || !cfiRange) return;
  const highlights = getHighlightsFromStorage();
  if (highlights[bookId]) {
    const initialLength = highlights[bookId].length;
    highlights[bookId] = highlights[bookId].filter((cfi) => cfi !== cfiRange);
    // Clean up book entry if no highlights left
    if (highlights[bookId].length === 0) {
      delete highlights[bookId];
      console.log(
        `Entrada eliminada para ${bookId} ya que no quedan subrayados.`
      );
    }
    if (
      highlights[bookId]?.length < initialLength ||
      (initialLength > 0 && !highlights[bookId])
    ) {
      saveHighlightsToStorage(highlights);
      console.log(`Subrayado eliminado de ${bookId}: ${cfiRange}`);
      return true; // Indicate removal happened
    }
  }
  console.log(
    `Subrayado no encontrado para eliminar en ${bookId}: ${cfiRange}`
  );
  return false; // Indicate removal didn't happen
}

/**
 * Loads and applies highlights for the current book from storage.
 */
function applySavedHighlights() {
  if (!rendition || !currentBookId) return;
  // Clear existing annotations before applying saved ones to avoid duplicates if re-rendering
  rendition.annotations.remove("*", "highlight"); // Remove all existing highlights first
  console.log(
    "Subrayados existentes eliminados antes de aplicar los guardados."
  );

  const highlights = getHighlightsFromStorage();
  const bookHighlights = highlights[currentBookId] || [];
  console.log(
    `Aplicando ${bookHighlights.length} subrayados guardados para ${currentBookId}`
  );
  bookHighlights.forEach((cfiRange) => {
    try {
      // Re-apply highlight using the same parameters as when creating
      rendition.annotations.highlight(
        cfiRange,
        {}, // data
        (e, annotation) => handleHighlightClick(annotation), // click handler
        "hl", // class - Ensure this class exists or styles are applied otherwise
        { fill: "yellow", "fill-opacity": "0.4", "pointer-events": "auto" } // style
      );
    } catch (error) {
      console.error(
        `Error al aplicar subrayado guardado (${cfiRange}):`,
        error
      );
      // Optionally remove invalid CFI from storage?
      // removeHighlightFromStorage(currentBookId, cfiRange);
    }
  });
}

/**
 * Handles clicks on existing highlights (for removal).
 * @param {object} annotation - The annotation object from epub.js.
 */
function handleHighlightClick(annotation) {
  console.log("Subrayado clickeado:", annotation);
  // epub.js annotation object structure might vary, find CFI reliably
  // Prefer annotation.cfiRange if available
  const cfiRange = annotation.cfiRange;

  if (cfiRange && currentBookId) {
    // Use confirm() for simplicity
    if (confirm("¿Quieres eliminar este subrayado?")) {
      try {
        rendition.annotations.remove(cfiRange, "highlight");
        console.log("Subrayado eliminado de la vista:", cfiRange);
        removeHighlightFromStorage(currentBookId, cfiRange);
      } catch (error) {
        console.error("Error al eliminar subrayado de la vista:", error);
        // Maybe the annotation was already removed? Re-sync?
      }
    }
  } else {
    console.warn(
      "No se pudo obtener el CFI del subrayado clickeado para eliminarlo. Annotation:",
      annotation
    );
  }
}

// --- Event Listener for File Input ---
if (fileInput) {
  fileInput.addEventListener("change", function (e) {
    console.log("Evento 'change' en fileInput detectado.");
    const file = e.target.files[0];
    if (file && file.name.endsWith(".epub")) {
      currentBookId = file.name; // Use filename as book identifier
      console.log(`Archivo EPUB válido seleccionado: ${currentBookId}`);

      if (book) {
        book.destroy();
      } // Clean up previous book
      if (viewer)
        viewer.innerHTML =
          '<p class="text-center text-gray-500 p-10 animate-pulse">Cargando libro...</p>';
      if (fileInfo) fileInfo.textContent = `Cargando: ${currentBookId}`;
      currentSelectionCfiRange = null;
      updateHighlightButtonState();

      const reader = new FileReader();
      reader.onload = function (event) {
        console.log("FileReader 'onload' ejecutado.");
        const arrayBuffer = event.target.result;
        try {
          // Ensure ePub is defined (loaded from CDN)
          if (typeof ePub === "undefined") {
            throw new Error("La biblioteca ePub.js no se ha cargado.");
          }
          book = ePub(arrayBuffer);
          console.log("Libro cargado:", book);

          // Ensure rendition target element exists
          if (!viewer)
            throw new Error("El elemento 'viewer' no existe en el DOM.");

          rendition = book.renderTo("viewer", {
            width: "100%",
            height: "100%",
            flow: "paginated",
          });
          console.log("Rendition creada:", rendition);

          rendition
            .display()
            .then(() => {
              console.log("Rendition.display() completado.");
              if (fileInfo) fileInfo.textContent = `Cargado: ${currentBookId}`;
              updateNavButtons();
              updateHighlightButtonState();

              // --- Apply saved highlights for this book ---
              applySavedHighlights();

              // --- Add Rendition-Specific Listeners ---
              console.log("Añadiendo listeners específicos de la rendition.");
              rendition.on("selected", (cfiRange, contents) => {
                currentSelectionCfiRange = cfiRange;
                console.log("Evento 'selected':", cfiRange);
                updateHighlightButtonState();
              });
              rendition.on("displayed", (view) => {
                const doc = view.document || view.contentDocument;
                if (doc) {
                  doc.addEventListener("mouseup", () => {
                    setTimeout(() => {
                      const selection = doc.getSelection();
                      if (
                        (!selection || selection.isCollapsed) &&
                        currentSelectionCfiRange
                      ) {
                        console.log(
                          "Evento 'mouseup' en iframe: Selección eliminada."
                        );
                        currentSelectionCfiRange = null;
                        updateHighlightButtonState();
                      }
                    }, 50);
                  });
                }
              });
              rendition.on("locationChanged", (location) => {
                console.log("Evento 'locationChanged':", location.start.cfi);
                updateNavButtons();
                currentSelectionCfiRange = null;
                updateHighlightButtonState();
              });
              rendition.on("keyup", (event) => {
                if (event.keyCode == 37) {
                  rendition.prev();
                }
                if (event.keyCode == 39) {
                  rendition.next();
                }
              });
            })
            .catch((err) => {
              console.error("Error en rendition.display():", err);
              if (viewer)
                viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error al mostrar el libro.</p>`;
              if (fileInfo)
                fileInfo.textContent = `Error al mostrar: ${currentBookId}`;
            });
        } catch (loadError) {
          console.error("Error al cargar/renderizar:", loadError);
          if (viewer)
            viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error fatal al procesar el EPUB.</p>`;
          if (fileInfo)
            fileInfo.textContent = `Error al procesar: ${
              currentBookId || "archivo"
            }`;
        }
      };
      reader.onerror = (event) => {
        console.error("Error en FileReader:", event.target.error);
        if (viewer)
          viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error al leer el archivo.</p>`;
        if (fileInfo) fileInfo.textContent = `Error al leer el archivo.`;
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.warn("Archivo no válido o no seleccionado.");
      if (fileInfo)
        fileInfo.textContent = "Por favor, selecciona un archivo .epub válido.";
      if (viewer)
        viewer.innerHTML =
          '<p class="text-center text-gray-500 p-10">Por favor, selecciona un archivo EPUB.</p>';
      if (book) {
        book.destroy();
        book = null;
        rendition = null;
      }
      currentBookId = null;
      currentSelectionCfiRange = null;
      updateNavButtons();
      updateHighlightButtonState();
    }
  });
}

// --- Button State Update Functions ---
function updateNavButtons() {
  if (!prevButton || !nextButton) return; // Check if buttons exist
  if (!rendition || !rendition.location) {
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }
  // Ensure location object structure is as expected
  prevButton.disabled = rendition.location.atStart === true;
  nextButton.disabled = rendition.location.atEnd === true;
}
function updateHighlightButtonState() {
  if (!highlightButton) return; // Check if button exists
  highlightButton.disabled = !rendition || !currentSelectionCfiRange;
}

// --- Global Event Listeners ---
if (prevButton) {
  prevButton.addEventListener("click", () => {
    console.log("Botón 'Anterior' clickeado.");
    if (rendition) rendition.prev();
  });
}
if (nextButton) {
  nextButton.addEventListener("click", () => {
    console.log("Botón 'Siguiente' clickeado.");
    if (rendition) rendition.next();
  });
}
if (highlightButton) {
  highlightButton.addEventListener("click", () => {
    console.log("Botón 'Subrayar Selección' clickeado.");
    if (book && rendition && currentSelectionCfiRange && currentBookId) {
      console.log(
        `  - Aplicando y guardando subrayado para ${currentBookId}:`,
        currentSelectionCfiRange
      );
      try {
        // Add highlight to view
        rendition.annotations.highlight(
          currentSelectionCfiRange,
          {}, // data
          (e, annotation) => handleHighlightClick(annotation), // click handler
          "hl", // class
          { fill: "yellow", "fill-opacity": "0.4", "pointer-events": "auto" } // style
        );

        // Save highlight to storage
        addHighlightToStorage(currentBookId, currentSelectionCfiRange);

        // Clear the selection in the view (optional, but good UX)
        if (rendition.manager?.views) {
          rendition.manager.views.forEach((view) => {
            try {
              view.window?.getSelection()?.removeAllRanges();
            } catch (e) {
              console.warn(
                "No se pudo limpiar la selección de la vista:",
                e.message
              );
            }
          });
        }

        currentSelectionCfiRange = null; // Reset stored range
        updateHighlightButtonState(); // Disable button again
      } catch (error) {
        console.error("Error al aplicar el subrayado:", error);
        alert("Hubo un problema al aplicar el subrayado.");
      }
    } else {
      console.warn(
        "  - Click ignorado (faltan datos: book, rendition, selection, or bookId)."
      );
    }
  });
}

document.addEventListener("keyup", (event) => {
  if (!rendition) return;
  // Check if focus is not on an input/button element to avoid interference
  if (!event.target.matches("input, textarea, button")) {
    if (event.keyCode == 37) {
      rendition.prev();
    } // Left Arrow
    if (event.keyCode == 39) {
      rendition.next();
    } // Right Arrow
  }
});

// --- Initial State Setup ---
// Run initial setup only if DOM elements are confirmed to exist
if (
  fileInput &&
  viewer &&
  prevButton &&
  nextButton &&
  highlightButton &&
  fileInfo
) {
  console.log("Estableciendo estado inicial de los botones.");
  updateNavButtons();
  updateHighlightButtonState();
  console.log("Script cargado completamente.");
} else {
  console.error(
    "La configuración inicial de los botones no se pudo ejecutar porque faltan elementos del DOM."
  );
}
