import { rendition } from "./renderReader.js";

/**
 * Funciones para el subrayado de una selección en el ebook
 *
 * @param cfiRange - La selección CFI 
 * @returns {boolean} - true si se aplica el subrayado, false si hay error
*/
export function applyHighlight(cfiRange) {
   if (!rendition || !rendition.annotations || !cfiRange) {
     console.error("Error: Rendition no lista o CFI inválido para subrayar.");
     return false;
   }
   try {
     const highlightData = { type: "highlight", timestamp: Date.now() };
     rendition.annotations.highlight(
       cfiRange,
       highlightData,
       (e) => {
         console.log("Clic en subrayado", e);
       },
       undefined,
       { "fill": "blue" }
     );

     console.log("Subrayado aplicado:", cfiRange);
     return true;
   } catch (error) {
     console.error("Error al aplicar subrayado:", error);
     return false;
   }
 }

/** 
 * Función para añadir evento de resaltado al botón al #highlight-button
 * @returns {void}
 */
export function addHighlightEvent() {
  let seleccionActual = null;
  const botonAccion = document.getElementById("highlight-button");

  rendition.on("selected", (cfiRange, contents) => {
    console.log("Texto seleccionado. Guardando CFI Range:", cfiRange);

    // Guarda la información necesaria de la selección
    seleccionActual = {
      cfiRange: cfiRange,
      texto: contents.window.getSelection().toString(), 
    };

    // Habilita el botón de subrayado
    if (botonAccion) {
      botonAccion.disabled = false;
    }
  });

  // Manejar si el usuario deselecciona el texto
  rendition.on("rendered", (section, view) => {
    view.document.addEventListener("click", (event) => {
      if (seleccionActual && !window.getSelection().toString()) {
        // Comprueba si la selección del navegador está vacía
        console.log("Clic detectado, limpiando selección guardada.");
        seleccionActual = null;
        if (botonAccion) {
          botonAccion.disabled = true;
        }
      }
    });
  });

  if (botonAccion) {
    botonAccion.addEventListener("click", () => {
      console.log("Botón presionado.");

      if (seleccionActual && seleccionActual.cfiRange) {
        console.log(
          "Subrayando la selección guardada:",
          seleccionActual.cfiRange
        );
        console.log("Texto asociado:", seleccionActual.texto); // Si lo guardaste

        // Resaltar texto seleccionado
        rendition.annotations.highlight(
          seleccionActual.cfiRange,
          { nota: "Resaltado desde botón" }, // Datos asociados opcionales
          (e) => {
            console.log("Clic en el nuevo resaltado", e);
          }, 
          "clase-resaltado-boton"
        );

        seleccionActual = null;
        botonAccion.disabled = true;
      }
    });
  } else {
    console.error("No se encontró el botón con id 'botonAccionSeleccion'");
  }
}
