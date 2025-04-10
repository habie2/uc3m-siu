import { splitIntoPages } from "./pages.js";

const readerElement = document.getElementById("reader");
let content = "";
let pages = [];
let currentPage = 0;

export function loadBook(book) {
    fetch("books/" + book)
        .then(response => response.text())
        .then(data => {
            content = data;
            waitForReaderSize(() => {
                pages = splitIntoPages(content);
                showPage(currentPage);
            });
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
