import { renderReader } from "../booksViewerEPUB/renderReader.js";

/**
   * Adjunta addEventListener("click") a cada elemento de libro.
   */
function attachBookClickListeners() {
    document.querySelectorAll(".book").forEach((el) => {
        el.addEventListener("click", handleBookClick);
    });
}

/**
 * Función que gestion click en un libro.
 * @param {Event} event - El objeto evento click.
 */
function handleBookClick(event) {
    const bookElement = event.currentTarget;
    const file = bookElement.getAttribute('data-file');
    console.log("Charging book:", file);

    renderReader(file); // renderizamos el libro seleccionado
}

export async function renderBooks() {
    const container = document.getElementById("main-container");
    try {
        const res = await fetch("./js/epubs/books-config.json");
        const books = await res.json();
        container.innerHTML = `
        
        <div class="books-selector">
            <div class="books-container">
                ${books.map(book => `
                    <div class="book" data-file="${book.file}">
                        <img src="js/epubs/${book.cover}" alt="${book.title}">
                        <p>${book.title}</p>
                    </div>
                `).join('')}
                
            </div>
        </div>
        `;
        attachBookClickListeners();

    } catch (err) {
        container.innerHTML = `<p>Error cargando libros.</p>`;
        console.error(err);
    }
}
