let book = null;
let rendition = null;
let currentSelectionCfiRange = null;

export function renderReader(book_name) {
    const container = document.getElementById("main-container");
    container.innerHTML = `
    <div class="viewer-container">
    
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
    </div>
    `;



    loadBook(book_name);

    function updateNavButtons() {
        console.log("Ejecutando updateNavButtons..."); // Log function call
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');

        if (!rendition || !rendition.location) {
            console.log("  - No hay rendition o location. Desactivando botones Anterior/Siguiente."); // Log condition
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        }
        const atStart = rendition.location.atStart;
        const atEnd = rendition.location.atEnd;
        prevButton.disabled = atStart;
        nextButton.disabled = atEnd;
        console.log(`  - atStart: ${atStart}, atEnd: ${atEnd}. Estado disabled: prev=${prevButton.disabled}, next=${nextButton.disabled}`); // Log state update
    }

    function loadBook(bookPath) {

        const viewer = document.getElementById("reader");
        if (!viewer) {
            console.error("No se pudo encontrar el elemento con id 'reader'.");
            return;
        }
        currentSelectionCfiRange = null;

        fetch("js/epubs/" + bookPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el libro.");
                }
                return response.arrayBuffer(); // Convertimos la respuesta en un ArrayBuffer
            })
            .then(arrayBuffer => {
                console.log("Libro cargado desde la ruta:", bookPath);

                try {
                    console.log("Intentando cargar el libro con ePub().");
                    book = ePub(arrayBuffer);
                    console.log("Libro cargado:", book);

                    console.log("Intentando renderizar el libro con book.renderTo().");
                    rendition = book.renderTo("reader", {
                        width: "100%",
                        height: "100%",
                        flow: "paginated",
                        manager: "default",
                        spread: "none"
                    });
                    console.log("Rendition creada:", rendition);

                    console.log("Intentando mostrar la rendition con rendition.display().");
                    rendition.display().then(() => {
                        console.log("Rendition.display() completado con éxito.");
                        updateNavButtons();

                        // --- Event Listeners específicos de la rendition ---
                        rendition.on('selected', function (cfiRange, contents) {
                            currentSelectionCfiRange = cfiRange;
                        });

                        rendition.on('displayed', (view) => {
                            const doc = view.document || view.contentDocument;
                            if (doc) {
                                doc.addEventListener('mouseup', (event) => {
                                    setTimeout(() => {
                                        const selection = doc.getSelection();
                                        if (!selection || selection.isCollapsed) {
                                            if (currentSelectionCfiRange) {
                                                currentSelectionCfiRange = null;
                                            }
                                        }
                                    }, 50);
                                });
                            }
                        });

                        rendition.on("locationChanged", (location) => {
                            updateNavButtons();
                            currentSelectionCfiRange = null;
                        });

                        rendition.on("keyup", function (event) {
                            if (event.keyCode == 37) { rendition.prev(); }
                            if (event.keyCode == 39) { rendition.next(); }
                        });

                    }).catch(err => {
                        console.error("Error en rendition.display():", err);
                        viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error al cargar el libro. Asegúrate de que sea un archivo EPUB válido.</p>`;
                    });

                } catch (loadError) {
                    console.error("Error al cargar o renderizar el libro:", loadError);
                    viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error fatal al procesar el EPUB.</p>`;
                }
            })
            .catch(error => {
                console.error("Error al cargar el archivo con fetch:", error);
                viewer.innerHTML = `<p class="text-center text-red-500 p-10">Error al cargar el archivo.</p>`;
            });
    }

    document.getElementById("next-page").addEventListener("click", function () {
        nextPage();
    });

    document.getElementById("prev-page").addEventListener("click", function () {
        prevPage();
    });
}

export function nextPage() {
    console.log("Siguiente página");
    if (rendition) {
        rendition.next();
    } else {
        console.error("Rendition no está definido.");
    }
}
export function prevPage() {
    console.log("Anterior página");
    if (rendition) {
        rendition.prev();
    } else {
        console.error("Rendition no está definido.");
    }
}