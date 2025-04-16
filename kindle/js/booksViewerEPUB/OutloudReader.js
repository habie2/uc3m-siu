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

  
  

  
  console.log("siiiiiiiiii") // leer el texto limpio
  return textoLimpio; // leer el texto limpio
  
}

export function pausarLectura() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
  }
}

export function continuarLectura() {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

function detenerLectura() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

function yapping(texto) {
    const mensaje = new SpeechSynthesisUtterance(texto);
    mensaje.lang = "es-ES";
    mensaje.rate = 1;
    window.speechSynthesis.speak(mensaje);}
