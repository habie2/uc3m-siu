
import { nextPage, prevPage, apagarEbook } from "./reader/navigate.js";
import { renderBooks } from "./books/books.js";


const socket = io();

renderBooks();

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