import { renderBooks } from "./booksBiblioteca/renderBooks.js";
import { prevPage, nextPage, apagarEbook } from "./booksViewerEPUB/bookNav.js";
import { leerParrafos } from "./booksViewerEPUB/OutloudReader.js";
import { rendition } from "./booksViewerEPUB/renderReader.js";

window.addEventListener("DOMContentLoaded", () => {

  // añadimos evento al boton de biblioteca (como si fuera un boton HOME de la wii)
  const libraryButton = document.getElementById("library-button");
  if (libraryButton) {
    libraryButton.addEventListener("click", () => {
      renderBooks();               // Llamas a tu función
      socket.emit("pausar-lectura"); // Y emites el evento
    });
  }

  renderBooks(); // Cargar los libros en la biblioteca 
});



const socket = io();

const pointer = document.getElementById("pointer");
let pointerX = window.innerWidth / 2; // Posición inicial X (centro)
let pointerY = window.innerHeight / 2; // Posición inicial Y (centro)

if (pointer) {
  // Inicializar posición visual del puntero
  pointer.style.left = `${pointerX}px`;
  pointer.style.top = `${pointerY}px`;

  // Listener para mover el puntero
  socket.on("pointer-move", (data) => {
    // console.log('Recibido pointer-move:', data);
    pointerX += data.x;
    pointerY += data.y;

    // Limitar el puntero a los bordes de la ventana
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;


    pointerX = Math.max(0, Math.min(pointerX, maxX));
    pointerY = Math.max(0, Math.min(pointerY, maxY));

    // Actualizar posición visual
    pointer.style.left = `${pointerX}px`;
    pointer.style.top = `${pointerY}px`;
  });

  // Listener para el clic
  socket.on("pointer-click", () => {
    console.log("Recibido pointer-click en:", pointerX, pointerY);


    pointer.classList.add("clicked");
    setTimeout(() => {
      pointer.classList.remove("clicked");
    }, 150); // Duración del efecto visual

    pointer.style.display = "none";
    const elementUnderPointer = document.elementFromPoint(pointerX, pointerY);

    pointer.style.display = "";

    if (elementUnderPointer) {
      console.log("Elemento debajo del puntero:", elementUnderPointer);
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: pointerX, // Añadir coordenadas por si el elemento las usa
        clientY: pointerY,
      });
      elementUnderPointer.dispatchEvent(clickEvent);
      console.log("Evento click simulado en:", elementUnderPointer);


    } else {
      console.log("No hay elemento interactivo debajo del puntero.");
    }
  });

  let isSimulatingSelection = false;

  const simulateMouseEventInIframe = (type, x, y) => {
    const iframe = document.querySelector("iframe[id^='epubjs-view']");
    if (!iframe) {
      console.warn("Iframe EPUB no encontrado.");
      return;
    }

    const rect = iframe.getBoundingClientRect();
    const insideX = x - rect.left;
    const insideY = y - rect.top;

    // Verificar si las coordenadas están dentro del área visible del iframe
    if (insideX < 0 || insideX > rect.width || insideY < 0 || insideY > rect.height) {
      console.warn(`Coordenadas (${x}, ${y}) fuera del área visible del iframe.`);
      return;
    }

    const iframeWindow = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWindow.document;

    if (!iframeDoc || !iframeDoc.elementFromPoint) {
      console.warn("No se pudo acceder al documento del iframe.");
      return;
    }

    const target = iframeDoc.elementFromPoint(insideX, insideY);

    if (target) {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: iframeWindow,
        clientX: insideX,
        clientY: insideY,
      });

      target.dispatchEvent(event);
      console.log(`Evento ${type} simulado dentro del iframe en`, target);
    } else {
      console.warn(`No se encontró ningún elemento en (${insideX}, ${insideY}) dentro del iframe.`);
    }
  };

  // Evento al inicio de la selección
  socket.on("start-selecting-text", (data) => {

    isSimulatingSelection = true;
    pointerX = data.x;
    pointerY = data.y;
    simulateMouseEventInIframe("mousedown", data.x, data.y);
  });

  // Evento al mover la selección
  socket.on("move-selecting-text", (data) => {
    if (!isSimulatingSelection) return;

    pointerX = data.x;
    pointerY = data.y;

    // Limitar el puntero a los bordes de la ventana
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;

    pointerX = Math.max(0, Math.min(pointerX, maxX));
    pointerY = Math.max(0, Math.min(pointerY, maxY));

    // Actualizar posición visual
    pointer.style.left = `${pointerX}px`;
    pointer.style.top = `${pointerY}px`;

    simulateMouseEventInIframe("mousemove", data.x, data.y);
  });

  // Evento al final de la selección
  socket.on("end-selecting-text", (data) => {
    if (!isSimulatingSelection) return;

    pointerX = data.x;
    pointerY = data.y;
    simulateMouseEventInIframe("mouseup", data.x, data.y);
    isSimulatingSelection = false;

    const iframe = document.querySelector("iframe[id^='epubjs-view']");
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;

    // Asegúrate de que getSelection() existe y devuelve una selección válida
    const selection = iframeDoc?.getSelection();
    if (selection) {
      const selectedText = selection.toString().trim();

      if (selectedText) {
        console.log("Texto seleccionado:", selectedText);
        // socket.emit("selected-text", selectedText); // Puedes enviar el texto aquí
      } else {
        console.warn("La selección está vacía.");
      }
    } else {
      console.warn("getSelection() no está disponible en el documento del iframe.");
    }
  });

} else {
  console.error("Elemento #pointer no encontrado.");
}


document.addEventListener("DOMContentLoaded", function () {
  socket.on("next-page", () => {
    console.log("Recibido evento: next-page");
    nextPage(); // Avanzar de página cuando llegue el evento
  });
  socket.on("prev-page", () => {
    console.log("Recibido evento: prev-page");
    prevPage(); // Retroceder de página cuando llegue el evento

  });

  socket.on("exit-book", () => {
    console.log("Recibido evento: exit-book");
    renderBooks(); // Salir al menú principal cuando llegue el evento
  });

  socket.on("turn-off", () => {
    console.log("Recibido evento: turn-off");
    apagarEbook(); // Mostrar display apagado cuando llegue el evento
  });

  socket.on("que-leo", () => {
    console.log("Recibido evento: que-leo");
    const texto = leerParrafos(); // Leer en alto(); 
    console.log("Texto leído:", texto);
    socket.emit("texto-leido", texto);
  });
});
