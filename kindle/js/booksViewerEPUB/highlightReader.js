export function addHighlightEvent(rendition) {
  let seleccionActual = null; 
  const botonAccion = document.getElementById("highlight-button");

  rendition.on("selected", (cfiRange, contents) => {
    console.log("Texto seleccionado. Guardando CFI Range:", cfiRange);

    // Guarda la información necesaria de la selección
    seleccionActual = {
      cfiRange: cfiRange,
      texto: contents.window.getSelection().toString(), // Opcional: guardar el texto
    };

    // Habilita el botón porque ahora hay una selección válida
    if (botonAccion) {
      botonAccion.disabled = false;
    }
  });

  // --- Opcional: Manejar si el usuario deselecciona el texto ---
  // Detectar clics fuera de una selección puede ser complejo.
  // Una forma simple es deshabilitar el botón si el usuario hace clic
  // en cualquier lugar DENTRO del iframe del contenido.
  rendition.on("rendered", (section, view) => {
    view.document.addEventListener("click", (event) => {
      // Si el clic NO está sobre una selección existente (o anotación)
      // podríamos limpiar la selección guardada y deshabilitar el botón.
      // Esta lógica puede necesitar ajustes finos.
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
          "Realizando acción con la selección guardada:",
          seleccionActual.cfiRange
        );
        console.log("Texto asociado:", seleccionActual.texto); // Si lo guardaste

        // Resaltar texto seleccionado
        rendition.annotations.highlight(
          seleccionActual.cfiRange,
          { nota: "Resaltado desde botón" }, // Datos asociados opcionales
          (e) => {
            console.log("Clic en el nuevo resaltado", e);
          }, // Callback opcional
          "clase-resaltado-boton" // Clase CSS opcional
        );

        seleccionActual = null;
        botonAccion.disabled = true; // Deshabilitar hasta nueva selección

        // TODO: Recuerda guardar esta nueva anotación si necesitas persistencia
        // guardarAnotacionEnStorage({ type: 'highlight', cfiRange: seleccionActual.cfiRange, ... });
      }
    });
  } else {
    console.error("No se encontró el botón con id 'botonAccionSeleccion'");
  } 
} 