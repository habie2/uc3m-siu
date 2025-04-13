import { renderReader } from "../booksViewerEPUB/renderReader.js";

/**
   * Adjunta los listeners de evento 'click' a cada elemento de libro.
   * Añadie listener también al botón de biblioteca.
   */
function attachBookClickListeners() {
  document.querySelectorAll(".book").forEach((el) => {
    // Primero, removemos cualquier listener antiguo por si acaso esta función se llama múltiples veces
    // sobre los mismos elementos (aunque en este flujo no debería pasar si renderBooks reemplaza todo)
    // Para hacer esto correctamente, necesitaríamos una función nombrada para el listener.
    // Opcional: Si no prevemos re-llamadas complejas, podemos omitir la eliminación por simplicidad.

    // Añadimos el listener
    el.addEventListener("click", handleBookClick);
  });
}

/**
 * Función manejadora para el evento click en un libro.
 * @param {Event} event - El objeto del evento click.
 */
function handleBookClick(event) {
    // 'this' dentro de esta función se referirá al elemento .book que fue clickeado
    const bookElement = event.currentTarget; // Usar currentTarget es más seguro
    const file = bookElement.getAttribute('data-file');
    console.log("Cargando libro:", file);

    // Asegúrate de que la función renderReader está disponible en este scope
    renderReader(file);
}

export async function renderBooks() {
    const container = document.getElementById("main-container");
    try {
        // List of books to be displayed
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
        attachBookClickListeners(); // Attach listeners to the books after rendering

    } catch (err) {
        container.innerHTML = `<p>Error cargando libros.</p>`;
        console.error(err);
    }
}
