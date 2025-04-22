export function leerParrafos() {
  // Asegura que se seleccione correctamente
  const elementos = document.querySelectorAll('[id*="epubjs-view-"]');
  const ultimoElemento = elementos[elementos.length - 1];
  const srcdoc = ultimoElemento?.getAttribute("srcdoc");
  let textoLimpio = "";
  if (srcdoc) {
    // Eliminar todo lo que esté entre < >
    textoLimpio = srcdoc.replace(/<[^>]*>/g, "");
  }
  return textoLimpio; // leer el texto limpio

}

export function pausarLectura() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
  }
}
