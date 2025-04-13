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

import { prevPage, nextPage } from "./booksViewerEPUB/bookNav.js";

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
        renderBooks(); // Retroceder de página cuando llegue el evento
    });

    socket.on("turn-off", () => {
        console.log("Recibido evento: turn-off");
        apagarEbook(); // Retroceder de página cuando llegue el evento
    });

});
