import { loadBook } from "./reader.js";
import { nextPage, prevPage } from "./navigate.js";

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

});