// translationUtils.js
import { rendition } from "./renderReader.js";

/**
 * **Simulación** de traducción de Español a Inglés.
 * Reemplazar con llamada a API real para funcionalidad completa.
 * @private // Indicamos que es una función de ayuda interna a este módulo
 * @param {string} text - Texto en español a traducir.
 * @returns {Promise<string>} - Promesa que resuelve con el texto "traducido" (simulado).
 */
async function _translateText_simulated(text) {
  console.log(`Simulando traducción ES -> EN para: "${text}"`);
  // --- Bloque de Implementación REAL (necesita API Key, etc.) ---
  /*
    const apiKey = 'TU_CLAVE_DE_API_AQUI';
    const sourceLang = 'es';
    const targetLang = 'en';
    const apiUrl = `URL_API?key=${apiKey}&source=${sourceLang}&target=${targetLang}&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error API: ${response.statusText}`);
        const data = await response.json();
        const translatedText = data.translations?.[0]?.text || 'Error al extraer';
        return translatedText;
    } catch (error) {
        console.error("Error durante la traducción real:", error);
        return `[Error Traduciendo: ${text}]`;
    }
    */
  // --- Simulación Actual ---
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[Simulated EN]: ${text}`);
    }, 500);
  });
}

/**
 * Traduce texto (simulado) y aplica una anotación de traducción a un rango CFI.
 * @export // Asegúrate de exportar la función principal
 * @param {object} rendition - El objeto Rendition de ePub.js.
 * @param {string} cfiRange - El rango CFI a anotar.
 * @param {string} textToTranslate - El texto original seleccionado.
 * @returns {Promise<boolean>} - True si se aplicó, false si hubo un error.
 */
export async function applyTranslation(cfiRange, textToTranslate) {
  // Validar parámetros de entrada
  if (!rendition || !rendition.annotations || !cfiRange || !textToTranslate) {
    console.error(
      "Error: Faltan datos (Rendition, CFI o Texto) para traducir."
    );
    return false;
  }
  console.log("Iniciando traducción para:", textToTranslate);

  try {
    // Llama a la función (simulada) de traducción
    const traduccion = await _translateText_simulated(textToTranslate);

    // Datos que se asociarán a la anotación
    const translationData = {
      type: "translation",
      original: textToTranslate,
      translation: traduccion,
    };

    // Usar el objeto rendition pasado como parámetro
    rendition.annotations.highlight(
      cfiRange,
      translationData,
      (e) => {
        // Callback al hacer clic
        console.log("Clic en traducción", e);
        // Acceder a los datos directamente a través de la clausura
        alert(
          `Original: ${translationData.original}\nTraducción: ${translationData.translation}`
        );
      },
      "translation-highlight" // Clase CSS específica
    );

    console.log("Anotación de traducción añadida:", cfiRange);
    return true; // Éxito
  } catch (error) {
    console.error("Error al traducir o aplicar anotación:", error);
    // No mostramos alert aquí, dejamos que el llamador decida
    return false; // Falla
  }
}

// Puedes añadir más funciones relacionadas con traducción aquí si es necesario
