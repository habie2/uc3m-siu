document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("interactiveGoogleIcon");
  const body = document.body;
  // Opcional: Si quieres aplicar .modo-noche específicamente al lector
  const readerElement = document.getElementById("reader");

  const MODE_KEY = "themeMode"; // Clave para guardar en localStorage

  // Función para aplicar el modo (light/dark)
  const applyMode = (mode) => {
    if (mode === "dark") {
      body.classList.add("night-mode");
      toggleButton.textContent = "light_mode"; // Cambia el icono a sol
      // Opcional: Aplicar clase específica al lector si existe
      if (readerElement) {
        readerElement.classList.remove("modo-dia", "modo-lectura"); // Quita otros modos
        readerElement.classList.add("modo-noche");
        // rendition.themes.select("default");
      }
      
      // Puedes añadir la clase 'filled' si quieres que el icono se rellene en modo noche
      // toggleButton.classList.add('filled');
    } else {
      body.classList.remove("night-mode");
      toggleButton.textContent = "dark_mode"; // Cambia el icono a luna
      // Opcional: Restaurar modo día por defecto en el lector si existe
      if (readerElement) {
        readerElement.classList.remove("modo-noche", "modo-lectura"); // Quita otros modos
        readerElement.classList.add("modo-dia"); // O el modo por defecto que uses
        // rendition.themes.select("night");
      }
      // Quitar la clase 'filled' si la añadiste
      toggleButton.classList.remove('filled');
    }
  };

  // Función para cambiar el modo
  const toggleMode = () => {
    const currentMode = body.classList.contains("night-mode")
      ? "dark"
      : "light";
    const newMode = currentMode === "dark" ? "light" : "dark";

    applyMode(newMode);

    // Guardar la preferencia en localStorage
    try {
      localStorage.setItem(MODE_KEY, newMode);
    } catch (e) {
      console.error(
        "No se pudo guardar la preferencia de modo en localStorage:",
        e
      );
    }
  };

  // Añadir el listener al botón
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleMode);
  } else {
    console.error("Elemento con ID 'interactiveGoogleIcon' no encontrado.");
    return; // Salir si no se encuentra el botón
  }

  // --- Cargar el modo guardado al iniciar la página ---
  let savedMode = "light"; // Modo por defecto
  try {
    const storedMode = localStorage.getItem(MODE_KEY);
    if (storedMode === "dark") {
      savedMode = "dark";
    }
  } catch (e) {
    console.error(
      "No se pudo leer la preferencia de modo desde localStorage:",
      e
    );
  }

  // Aplicar el modo cargado (guardado o por defecto)
  applyMode(savedMode);
});
