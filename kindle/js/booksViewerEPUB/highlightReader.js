highlightButton.addEventListener("click", () => {
        if (
          rendition &&
          rendition.manager &&
          typeof rendition.manager.getContents === "function"
        ) {
          // Obtener la selección del iframe del rendition
          const contents = rendition.manager.getContents();
          const selection = contents[0]?.window?.getSelection(); // Accede a la selección dentro del iframe

          if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            try {
              // Obtener el CFI range de la selección
              const cfiRange = rendition.CFI(range).toString(); // Utiliza la instancia de rendition para obtener el CFI
              console.log("Texto seleccionado (CFI):", cfiRange);

              // Añadir el subrayado usando la API de anotaciones
              rendition.annotations.highlight(
                cfiRange,
                {}, // Datos adicionales opcionales
                (e) => {
                  // Callback al hacer clic en el subrayado
                  console.log("Highlight clickeado:", e.target);
                  // Opcional: añadir lógica para eliminar el subrayado
                  // rendition.annotations.remove(cfiRange, "highlight");
                },
                "hl", // Clase CSS para el subrayado (puedes definirla en tu CSS)
                {
                  fill: "yellow",
                  "fill-opacity": "0.3",
                  "pointer-events": "auto",
                } // Estilos SVG
              );
              // Limpiar la selección visual después de subrayar
              selection.removeAllRanges();
              console.log("Subrayado aplicado.");
            } catch (err) {
              console.error("Error al generar CFI o aplicar subrayado:", err);
              alert("Error al procesar la selección para subrayar.");
            }
          } else {
            alert("Por favor, selecciona texto en el libro para subrayar.");
          }
        } else {
          console.warn(
            "Rendition o su manager no están listos, o no se pudo acceder a la selección (highlight)."
          );
        }
      });