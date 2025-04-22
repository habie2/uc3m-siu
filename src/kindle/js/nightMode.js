document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("interactiveGoogleIcon");
  const body = document.body;
  const readerElement = document.getElementById("reader");

  const MODE_KEY = "themeMode"; 

  const applyMode = (mode) => {
    if (mode === "dark") {
      body.classList.add("night-mode");
      toggleButton.textContent = "light_mode"; // Cambia el icono a sol
      if (readerElement) {
        readerElement.classList.remove("modo-dia", "modo-lectura"); // Quita otros modos
        readerElement.classList.add("modo-noche");
      }
      
    } else {
      body.classList.remove("night-mode");
      toggleButton.textContent = "dark_mode"; // Cambia el icono a luna
      if (readerElement) {
        readerElement.classList.remove("modo-noche", "modo-lectura"); 
        readerElement.classList.add("modo-dia"); 
      }
      toggleButton.classList.remove('filled'); // esto es para los iconos de google-fonts
    }
  };

  const toggleMode = () => {
    const currentMode = body.classList.contains("night-mode")
      ? "dark"
      : "light";
    const newMode = currentMode === "dark" ? "light" : "dark";

    applyMode(newMode);

    try {
      localStorage.setItem(MODE_KEY, newMode);
    } catch (e) {
      console.error(
        "No se pudo guardar la preferencia de modo en localStorage:",
        e
      );
    }
  };

  if (toggleButton) {
    toggleButton.addEventListener("click", toggleMode);
  } else {
    console.error("Elemento con ID 'interactiveGoogleIcon' no encontrado.");
    return;
  }

  let savedMode = "light"; 
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

  applyMode(savedMode);
});
