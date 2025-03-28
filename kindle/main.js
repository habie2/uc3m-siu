document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.getElementById("menu-toggle");
    const dropdownMenu = document.querySelector(".dropdown");

    // Toggle de la visibilidad del dropdown
    menuButton.addEventListener("click", function () {
        // Si el menú está oculto, lo mostramos
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Si se hace clic fuera del menú, se cierra
    document.addEventListener("click", function (event) {
        if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = "none"; // Ocultamos el menú si se hace clic fuera de él
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const reader = document.getElementById("reader");

    // Botones de cambio de modo
    const modoDiaBtn = document.getElementById("modo-dia");
    const modoNocheBtn = document.getElementById("modo-noche");
    const modoLecturaBtn = document.getElementById("modo-lectura");

    // Función para cambiar de modo
    function cambiarModo(modo) {
        reader.className = modo;
    }

    // Eventos para cada botón
    modoDiaBtn.addEventListener("click", function () {
        cambiarModo("modo-dia");
    });

    modoNocheBtn.addEventListener("click", function () {
        cambiarModo("modo-noche");
    });

    modoLecturaBtn.addEventListener("click", function () {
        cambiarModo("modo-lectura");
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const readerElement = document.getElementById("reader");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    let content = ""; // El contenido del archivo
    let pages = []; // Las páginas divididas
    let currentPage = 0; // Página actual

    // Cargar el archivo de texto
    fetch("libros/el-nombre-del-viento.txt")
        .then(response => response.text())
        .then(data => {
            content = data;
            pages = splitIntoPages(content);
            showPage(currentPage);
        })
        .catch(error => console.error("Error al cargar el archivo:", error));

    // Función para dividir el contenido en páginas
    function splitIntoPages(content) {
        const pageSize = getPageSize(); // Obtener el tamaño de la página dinámicamente
        let pageArray = [];
        let pageContent = "";

        // Dividir el contenido en fragmentos
        for (let i = 0; i < content.length; i++) {
            pageContent += content[i];

            // Si hemos llegado al tamaño de página, agregamos la página
            if (pageContent.length >= pageSize) {
                pageArray.push(pageContent);
                pageContent = "";
            }
        }

        // Si hay contenido restante, lo añadimos como una última página
        if (pageContent.length > 0) {
            pageArray.push(pageContent);
        }

        return pageArray;
    }

    // Función para obtener el tamaño de la página en caracteres
    function getPageSize() {
        const readerStyle = window.getComputedStyle(readerElement);
        const fontSize = parseFloat(readerStyle.fontSize); // Obtener el tamaño de la fuente en píxeles
        const lineHeight = parseFloat(readerStyle.lineHeight); // Obtener la altura de la línea
        const readerHeight = readerElement.offsetHeight; // Altura del contenedor reader
        const readerWidth = readerElement.offsetWidth; // Ancho del contenedor reader

        const charsPerLine = Math.floor(readerWidth / (fontSize * 0.6)); // Estimar el número de caracteres por línea
        const linesPerPage = Math.floor(readerHeight / lineHeight); // Estimar el número de líneas por página

        // Calculamos el número total de caracteres por página
        const pageSize = charsPerLine * linesPerPage;
        return pageSize;
    }

    // Mostrar el contenido de la página actual
    function showPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < pages.length) {
            // Aseguramos que el texto se muestra correctamente sin scroll
            readerElement.textContent = pages[pageIndex];
            readerElement.innerHTML = readerElement.textContent.replace(/\n/g, "<br>");
        }
    }

    // Función para ir a la siguiente página
    nextButton.addEventListener("click", function () {
        if (currentPage < pages.length - 1) {
            currentPage++;
            showPage(currentPage);
        }
    });

    // Función para ir a la página anterior
    prevButton.addEventListener("click", function () {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
        }
    });
});
