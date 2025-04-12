import { renderReader } from "../reader/reader.js";


export async function renderBooks() {
    const container = document.getElementById("main-container");
    try {
        // List of books to be displayed
        const res = await fetch("./js/epubs/books-config.json");
        const books = await res.json();
        container.innerHTML = `
        <h1 class="boldonse-regular toolbar">Ki..ller</h1>
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
        // Acción al hacer clic en un libro
        document.querySelectorAll('.book').forEach(el => {
            el.addEventListener('click', () => {
                const file = el.getAttribute('data-file');
                console.log("Cargando libro:", file);
                renderReader(file);
            });
        });

    } catch (err) {
        container.innerHTML = `<p>Error cargando libros.</p>`;
        console.error(err);
    }


}