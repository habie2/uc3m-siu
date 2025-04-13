console.log("Script iniciado.");

// --- Constants ---
const HIGHLIGHT_STORAGE_KEY = "epubReaderHighlights"; // Key for localStorage

// --- State Variables ---
let book = null;
let rendition = null;
let currentSelectionCfiRange = null;
let currentBookId = null; // To store the identifier (filename) of the current book

// --- DOM Elements ---
const fileInput = document.getElementById("file-input");
const viewer = document.getElementById("viewer");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const highlightButton = document.getElementById("highlight-button");
// const fileInfo = document.getElementById("file-info");
// const viewerContainer = document.getElementById('viewer-container'); // Not currently used

console.log("Elementos DOM obtenidos.");

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
    if (highlights[bookId].length < initialLength) {
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
        "hl", // class
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
  const cfiRange =
    annotation.cfiRange || (annotation.location && annotation.location.cfi);

  if (cfiRange && currentBookId) {
    // Use confirm() for simplicity
    if (confirm("¿Quieres eliminar este subrayado?")) {
      try {
        rendition.annotations.remove(cfiRange, "highlight");
        console.log("Subrayado eliminado de la vista:", cfiRange);
        removeHighlightFromStorage(currentBookId, cfiRange);
      } catch (error) {
        console.error("Error al eliminar subrayado de la vista:", error);
      }
    }
  } else {
    console.warn(
      "No se pudo obtener el CFI del subrayado clickeado para eliminarlo."
    );
  }
}



// --- Initial State Setup ---
console.log("Estableciendo estado inicial de los botones.");
updateNavButtons();
updateHighlightButtonState();
console.log("Script cargado completamente.");
