import { getCurrentPage, getPageCount, setCurrentPage } from "./reader.js";


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

export function apagarEbook() {
    //window.close();
    document.body.style.display = "none";
}