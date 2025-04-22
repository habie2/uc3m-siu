// translationUtils.js
import { rendition } from "./renderReader.js";

/**
 * Función para traducir texto de Español a Inglés con Google API.
 * @param {string} text - Texto en español a traducir.
 * @returns {Promise<string>} - Promesa que resuelve con el texto "traducido" (simulado).
 */
async function _translateText_google(text) {
  const key = 'AIzaSyAVC7h0NPd_Unkq3Z2OwcG9Fzxl91-67YQ';
  const apiUrl = `https://translation.googleapis.com/language/translate/v2`;

  const payload = {
    q: text,
    source: 'es',
    target: 'en',
    format: 'text'
  };

  try {
    const response = await fetch(`${apiUrl}?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error API: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;
    return translatedText;
  } catch (error) {
    console.error("Error durante la traducción real:", error);
    return `[Error Traduciendo: ${text}]`;
  }
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
  if (!rendition || !rendition.annotations || !cfiRange || !textToTranslate) {
    console.error(
      "Error: Faltan datos (Rendition, CFI o Texto) para traducir."
    );
    return false;
  }
  console.log("Iniciando traducción para:", textToTranslate);

  try {
    const traduccion = await _translateText_google(textToTranslate);

    const translationData = {
      type: "translation",
      original: textToTranslate,
      translation: traduccion,
    };

    rendition.annotations.highlight(
      cfiRange,
      translationData,
      (e) => {
        console.log("Clic en traducción", e);
        alert(
          `Traducción: ${translationData.translation}`
        );
      },
      "translation-highlight"
    );

    console.log("Anotación de traducción añadida:", cfiRange);
    return true;
  } catch (error) {
    console.error("Error al traducir o aplicar anotación:", error);
    return false;
  }
}

