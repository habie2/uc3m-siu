import { splitIntoPages } from "./pages.js";


const readerElement = document.getElementById("reader");
let content = "";
let pages = [];
let currentPage = 0;

export function renderReader(book_name) {
    loadBook(book_name);
    const container = document.getElementById("main-container");
    container.innerHTML = `
        <div class="toolbar">
        <h1 class="logo boldonse-regular">Ki..ller</h1>
        <div class="menu-container">
            <button class="menu-button" id="menu-toggle">☰</button>
            <div class="dropdown">
                <h3>Tamaño letra</h3>
                <div class="font-size-options">
                    <button class="font-size-button" id="increase-font">+</button>
                    <button class="font-size-button" id="decrease-font">-</button>
                </div>
                <h3>Fuente</h3>
                <div class="font-options">
                    <button class="font-button" id="font1">Cutive Mono</button>
                    <button class="font-button" id="font2">LXGW WenKai Mono TC</button>
                    <button class="font-button" id="font3">Old Standard TT</button>
                    <button class="font-button" id="font4">Sono</button>
                </div>
                <h3>Color de fondo</h3>
                <div class="color-options">
                    <button class="color-button" id="modo-dia">Modo Día</button>
                    <button class="color-button" id="modo-noche">Modo Noche</button>
                    <button class="color-button" id="modo-lectura">Modo Lectura</button>
                </div>
                <h3>Espacio entre letras</h3>
                <div class="letter-spacing-options">
                    <button class="letter-spacing-button" id="increase-letter-spacing">+</button>
                    <button class="letter-spacing-button" id="decrease-letter-spacing">-</button>
                </div>
            </div>
        </div>
    </div>
    <div class="content">
        <div class="reader-container">
            <button class="nav-button" id="prev-page">←</button>
            <div class="modo-lectura old-standard-tt-regular-italic" id="reader"></div>
            <button class="nav-button" id="next-page">→</button>
        </div>
    </div>
    `;
    document.getElementById("next-page").addEventListener("click", function () {
        nextPage();
    });

    document.getElementById("prev-page").addEventListener("click", function () {
        prevPage();
    });
}

export function loadBook(book) {
    fetch("js/epubs/" + book)
        .then(response => response.text())
        .then(data => {
            content = data;
            // waitForReaderSize(() => {
            // pages = splitIntoPages(content);
            // showPage(currentPage);
            const x = document.getElementById("reader");
            x.innerText = content;
            // });
        })
        .catch(error => console.error("Error al cargar el archivo:", error));
}

function waitForReaderSize(callback) {
    const checkSize = setInterval(() => {
        if (readerElement.offsetWidth > 0 && readerElement.offsetHeight > 0) {
            clearInterval(checkSize);
            callback();
        }
    }, 100);
}

export function showPage(pageIndex) {
    if (pages.length === 0) {
        console.warn("No hay páginas cargadas.");
        return;
    }

    if (pageIndex >= 0 && pageIndex < pages.length) {
        readerElement.innerHTML = pages[pageIndex].replace(/\n/g, "<br>");
    }
}

export function getPageCount() {
    return pages.length;
}

export function setCurrentPage(page) {
    currentPage = page;
    showPage(currentPage);
}

export function getCurrentPage() {
    return currentPage;
}
