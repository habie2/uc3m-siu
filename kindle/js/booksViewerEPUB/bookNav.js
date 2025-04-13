import { rendition } from "./renderReader.js";

export function prevPage() {
  if (rendition) {
    rendition.prev(); // Cambia a la página anterior
  } else {
    console.error("Error: 'rendition' no está definido.");
  }
}

export function nextPage() {
  if (rendition) {
    rendition.next(); // Cambia a la siguiente página
  } else {
    console.error("Error: 'rendition' no está definido.");
  }
}