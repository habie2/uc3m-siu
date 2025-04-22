import { rendition } from "./renderReader.js";

/**
 * Aplica una anotación de nota a un rango CFI.
 * @param {string} cfiRange - El rango CFI a anotar.
 * @param {string} noteText - El texto de la nota.
 * @returns {boolean} - True si se aplicó, false si hubo un error.
 */
export function applyNote(cfiRange, noteText) {
  if (!rendition || !rendition.annotations || !cfiRange || !noteText) {
    console.error(
      "Error: Faltan datos (Rendition, CFI o Texto de Nota) para añadir nota."
    );
    return false;
  }

  try {
    const noteData = {
      type: "note",
      note: noteText,
    };

    rendition.annotations.highlight(
      cfiRange,
      noteData,
      (e) => {
        console.log("Clic en nota", e);
        alert(`Nota: ${noteData.note}`);
      },
      undefined, 
      {"fill": "red"}, 
    );

    console.log("Anotación de nota añadida:", cfiRange);
    return true; 
  } catch (error) {
    console.error("Error al aplicar nota:", error);
    return false;
  }
}

