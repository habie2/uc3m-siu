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
