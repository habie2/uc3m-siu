import { renderBooks } from "./booksBiblioteca/renderBooks.js";

window.addEventListener("DOMContentLoaded", () => {
    const libraryView = document.getElementById("library-view");
    const viewerView = document.getElementById("viewer-view");
    const bookLinks = document.querySelectorAll(".book-link");
    
    // añadimos evento al boton de biblioteca (como si fuera un boton HOME de la wii)
    const libraryButton = document.getElementById("library-button");
    if (libraryButton) {
        libraryButton.addEventListener("click", renderBooks);
    }

    renderBooks(); // Cargar los libros en la biblioteca 
});

import { prevPage, nextPage, apagarEbook } from "./booksViewerEPUB/bookNav.js";
import { leerParrafos } from "./booksViewerEPUB/OutloudReader.js";
import { rendition } from "./booksViewerEPUB/renderReader.js";

const socket = io();

const pointer = document.getElementById("pointer");
const contentArea = document.body; // O un contenedor específico si lo prefieres

let pointerX = window.innerWidth / 2; // Posición inicial X (centro)
let pointerY = window.innerHeight / 2; // Posición inicial Y (centro)

if (pointer) {
  // Inicializar posición visual del puntero
  pointer.style.left = `${pointerX}px`;
  pointer.style.top = `${pointerY}px`;

  // Listener para mover el puntero
  socket.on("pointer-move", (data) => {
    // console.log('Recibido pointer-move:', data);
    pointerX += data.deltaX;
    pointerY += data.deltaY;

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

    // 1. Efecto visual en el puntero
    pointer.classList.add("clicked");
    setTimeout(() => {
      pointer.classList.remove("clicked");
    }, 150); // Duración del efecto visual

    // 2. Simular un clic en el elemento que está debajo del puntero
    // Ocultar temporalmente el puntero para hacer el elementFromPoint correctamente
    pointer.style.display = "none";
    const elementUnderPointer = document.elementFromPoint(pointerX, pointerY);
    // Volver a mostrar el puntero
    pointer.style.display = "";

    if (elementUnderPointer) {
      console.log("Elemento debajo del puntero:", elementUnderPointer);
      // Simular un evento de clic en ese elemento
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: pointerX, // Añadir coordenadas por si el elemento las usa
        clientY: pointerY,
      });
      elementUnderPointer.dispatchEvent(clickEvent);
      console.log("Evento click simulado en:", elementUnderPointer);

      // Si el elemento es un enlace '<a>', podrías querer navegar
      // if (elementUnderPointer.tagName === 'A' && elementUnderPointer.href) {
      //    window.location.href = elementUnderPointer.href;
      // }
      // Si es un botón <button>, el dispatchEvent debería ser suficiente
    } else {
      console.log("No hay elemento interactivo debajo del puntero.");
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
