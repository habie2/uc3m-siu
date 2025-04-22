import { rendition } from "./renderReader.js";

/**
 * Función para pasar aa la página previa.
 */
export function prevPage() {
  if (rendition) {
    rendition.prev(); // Cambia a la página anterior
  } else {
    console.error("Error: 'rendition' no está definido.");
  }
}

/**
 * Función para pasar a la siguiente página.
 */
export function nextPage() {
  if (rendition) {
    rendition.next(); // Cambia a la siguiente página
  } else {
    console.error("Error: 'rendition' no está definido.");
  }
}

/**
 * Función para poner en reposo al ebook.
 */
export function apagarEbook() {
  if (document.documentElement.style.display == "none") {
    document.documentElement.style.display = "block";
  }else {
    document.documentElement.style.display = "none";
  }
  
}


