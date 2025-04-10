import { loadBook } from "./reader.js";
import { nextPage, prevPage, apagarEbook } from "./navigate.js";

const socket = io();

document.addEventListener("DOMContentLoaded", function () {
    loadBook("el-nombre-del-viento.txt");
    document.getElementById("next-page").addEventListener("click", function () {
        nextPage();
    });

    document.getElementById("prev-page").addEventListener("click", function () {
        prevPage();
    });

    socket.on("next-page", () => {
        console.log("📥 Recibido evento: next-page");
        nextPage(); // Avanzar de página cuando llegue el evento
    });
    socket.on("prev-page", () => {
        console.log("📥 Recibido evento: prev-page");
        prevPage(); // Retroceder de página cuando llegue el evento
    });

    socket.on("turn-off", () => {
        console.log("Recibido evento: turn-off");
        apagarEbook(); // Retroceder de página cuando llegue el evento
    });
});