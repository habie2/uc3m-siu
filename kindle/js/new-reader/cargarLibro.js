window.addEventListener("DOMContentLoaded", function () {
  const filePath = "./js/new-reader/el-nombre-del-viento.epub"; // Ruta local del archivo EPUB
  const viewer = document.getElementById("viewer");

  fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    
    .then((arrayBuffer) => {
      const book = ePub(arrayBuffer);
      const rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
      });
      console.log("Archivo EPUB cargado correctamente.");

      rendition.display().catch((err) => {
        console.error("Error al mostrar el libro:", err);
      });
    })
    .catch((error) => {
      console.error("Error al cargar el archivo EPUB:", error);
      viewer.innerHTML =
        '<p class="text-center text-gray-500 p-10">No se pudo cargar el archivo EPUB.</p>';
    });
});
