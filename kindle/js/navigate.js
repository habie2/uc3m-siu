import { getCurrentPage, getPageCount, setCurrentPage } from "./reader.js";

export function setupNavigation() {
    document.getElementById("next-page").addEventListener("click", function () {
        nextPage();
    });

    document.getElementById("prev-page").addEventListener("click", function () {
        prevPage();
    });
}

export function nextPage() {
    let currentPage = getCurrentPage();
    if (currentPage < getPageCount() - 1) {
        setCurrentPage(currentPage + 1);
    }
}

export function prevPage() {
    let currentPage = getCurrentPage();
    if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
    }
}