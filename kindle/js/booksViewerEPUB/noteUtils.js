import { rendition } from "./renderReader.js";

/**
 * Aplica una anotación de nota a un rango CFI.
 * @export // Asegúrate de exportar la función
 * @param {object} rendition - El objeto Rendition de ePub.js.
 * @param {string} cfiRange - El rango CFI a anotar.
 * @param {string} noteText - El texto de la nota.
 * @returns {boolean} - True si se aplicó, false si hubo un error.
 */
export function applyNote(cfiRange, noteText) {
  // Validar parámetros de entrada
  if (!rendition || !rendition.annotations || !cfiRange || !noteText) {
    console.error(
      "Error: Faltan datos (Rendition, CFI o Texto de Nota) para añadir nota."
    );
    return false;
  }

  try {
    // Datos que se asociarán a la anotación
    const noteData = {
      type: "note",
      note: noteText,
    };

    // Usar el objeto rendition pasado como parámetro
    rendition.annotations.highlight(
      cfiRange,
      noteData,
      (e) => {
        // Callback al hacer clic
        console.log("Clic en nota", e);
        // Acceder a los datos directamente a través de la clausura
        alert(`Nota: ${noteData.note}`);
      },
      "note-highlight" // Clase CSS específica
    );

    console.log("Anotación de nota añadida:", cfiRange);
    return true; // Éxito
  } catch (error) {
    console.error("Error al aplicar nota:", error);
    return false; // Falla
  }
}

// Puedes añadir más funciones relacionadas con notas aquí si es necesario
