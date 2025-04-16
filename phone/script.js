const socket = io();

let lastGamma = null;
let lastBeta = null;
let lastActionTime = 0;
let lastVerticalActionTime = 0;
let lastInteractionTime = Date.now();
const inactivityThreshold = 180000; // 30000 = 30 segundos, cambiar cuando funcione a 3min o algo así

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

  socket.on("texto-leido", (texto) => {
    setTimeout(() => leerParrafos(texto), 0);
  });

if (window.DeviceOrientationEvent) {
  window.addEventListener(
    "deviceorientation",
    (event) => {
      const now = Date.now();
      // Control del movimiento lateral para pasar paginas
      const gamma = event.gamma;
      const threshold = 160;
      const delay = 1000;

      if (
        gamma != lastGamma &&
        Math.abs(gamma - lastGamma) > threshold &&
        now - lastActionTime > delay
      ) {
        console.log("gamma:", gamma, "lastGamma:", lastGamma);
        console.log("diference:", gamma - lastGamma);
        if (gamma - lastGamma > 0) {
          console.log("Giro a la derecha");
          socket.emit("next-page");
        } else if (gamma - lastGamma < 0) {
          console.log("Giro a la izquierda");
          socket.emit("prev-page");
        }

        lastActionTime = now;
        resetInactivityTimer();
      }
      lastGamma = gamma;

      // Control de movimiento vertical para salir al menú
      const beta = event.beta;
      const betaRangeMin = 60;
      const betaRangeMax = 90;
      const betaDelay = 1500;

      if (
        now - lastVerticalActionTime > betaDelay &&
        beta >= betaRangeMin &&
        beta <= betaRangeMax &&
        (lastBeta === null || Math.abs(beta - lastBeta) > 10) // evita activacion constante
      ) {
        console.log("Salir al menu (beta en rango):", beta);
        socket.emit("exit-book");
        resetInactivityTimer();
        lastVerticalActionTime = now;
      }

      lastBeta = beta;
    },
    true
  );
}

if (!SpeechRecognition) {
  console.log(
    "La API de reconocimiento de voz no es compatible con este navegador."
  );
} else {
  let recognitionActive = false;
  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true; // Escucha continua
  recognition.interimResults = false; // No mostrar resultados intermedios
  recognition.maxAlternatives = 1; // Solo una alternativa

  recognition.onresult = (event) => {
    if (!recognitionActive) return;
    const transcript = event.results[0][0].transcript.trim().toLowerCase();
    console.log("Escuchado:", transcript);
    //resetInactivityTimer(); // debería resetear solo si reconoce alguna acción por si la persona ronca o algo así
    if (
      transcript.includes("pasa") ||
      transcript.includes("siguiente") ||
      transcript.includes("next")
    ) {
      console.log("Comando: pasa");
      resetInactivityTimer();
      socket.emit("next-page"); // Emitir evento de página siguiente al servidor
    } else if (
      transcript.includes("vuelve") ||
      transcript.includes("anterior") ||
      transcript.includes("previo") ||
      transcript.includes("prebio")
    ) {
      console.log("Comando: vuelve");
      resetInactivityTimer();
      socket.emit("prev-page");
      // Emitir evento de página anterior al servidor
    } else if (
      transcript.includes("audiolibro") ||
      transcript.includes("leer") ||
      transcript.includes("lee") ||
      transcript.includes("lectura") ||
      transcript.includes("leer en voz alta") ||
      transcript.includes("leer en alto") ||
      transcript.includes("leer en voz alta")
    ) {
      console.log("Comando: leer en voz alta");
      resetInactivityTimer();
      socket.emit("que-leo");
    } else {
      console.log("Comando no reconocido:", transcript);
    }
  };

  recognition.onerror = (event) => {
    console.error("Error de reconocimiento de voz:", event.error);
    // Si el error es 'not-allowed', puedes reiniciar el reconocimiento aquí si quieres
    if (event.error === "not-allowed") {
      console.log("Permiso de micrófono denegado.");
    }
  };

  // Si el reconocimiento termina (onend), reiniciamos el reconocimiento
  recognition.onend = () => {
    console.log("Reconocimiento de voz terminado.");
    if (recognitionActive) {
      recognition.start(); // Reinicia el reconocimiento de voz
    }
  };
  document.addEventListener("DOMContentLoaded", function () {
    const voiceButton = document.getElementById("stop-voice");
    voiceButton.addEventListener("click", function () {
      if (recognitionActive) {
        recognitionActive = false;
        recognition.stop();
        voiceButton.classList.remove("active");
        console.log("Reconocimiento de voz detenido.");
      } else {
        recognitionActive = true;
        recognition.start();
        voiceButton.classList.add("active");
        console.log("Reconocimiento de voz activado.");
      }
      resetInactivityTimer();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById("next-page");
  nextButton.addEventListener("click", function () {
    socket.emit("next-page");
    resetInactivityTimer();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById("prev-page");
  nextButton.addEventListener("click", function () {
    socket.emit("prev-page");
    socket.emit("que-leo");
    resetInactivityTimer();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById("exit-book");
  nextButton.addEventListener("click", function () {
    socket.emit("exit-book");
    resetInactivityTimer();
  });



  /// Si no metemos esto no lee nada el movil, al menos el mio, al parecer es un problema de seguridad de los navegadores, que no permiten que se inicie la voz sin una interacción del usuario.
  /// En este caso, lo que hacemos es crear un evento de click o touchstart y al ejecutarse, se desbloquea la voz. Asi que si el primer evento es que te lea en voz alta depende del movil no lo hará.
  const desbloquearVoz = () => {
    const dummy = new SpeechSynthesisUtterance(" ");
    window.speechSynthesis.speak(dummy);
    document.removeEventListener("click", desbloquearVoz);
    document.removeEventListener("touchstart", desbloquearVoz);
    console.log("Voz desbloqueada por interacción");
  };

  document.addEventListener("click", desbloquearVoz);
  document.addEventListener("touchstart", desbloquearVoz);
});

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("turn-off");
    nextButton.addEventListener("click", function () {
      socket.emit("turn-off");
      resetInactivityTimer();
    });
  });


setInterval(() => {
  const now = Date.now();
  if (now - lastInteractionTime > inactivityThreshold) {
    console.log("Inactividad detectada. Apagando pantalla.");
    socket.emit("turn-off"); // debería ser un evento de apagado de pantalla
    resetInactivityTimer();
    lastInteractionTime = now; // Evita múltiples emisiones seguidas
  }
}, 5000);
// resetea el temporizador con cada interacción del usuario
function resetInactivityTimer() {
  console.log("Reseteando temporizador de inactividad");
  lastInteractionTime = Date.now();
}

function leerParrafos(parrafos) {
    if (typeof parrafos !== "string" || !parrafos.trim()) {
      console.warn("Texto inválido para leer en voz alta:", parrafos);
      return;
    }
  
    const textoLimpio = parrafos.replace(/\s+/g, ' ').trim(); // quita saltos y excesos de espacio
  
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  
    yapping(textoLimpio);
  }

function pausarLectura() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
  }
}

function continuarLectura() {
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
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      console.log("Speech synthesis está ocupado, esperando...");
      speechSynthesis.cancel();  // Forzar cancelación si está en proceso
    }
    const mensaje = new SpeechSynthesisUtterance(texto.slice(0, 2000));
    mensaje.lang = "es-ES";
    mensaje.rate = 1;
    window.speechSynthesis.speak(mensaje);
  }
