const socket = io();

let lastGamma = null;
let lastActionTime = 0;
let lastInteractionTime = Date.now();
const inactivityThreshold = 30000; // 30000 = 30 segundos, cambiar cuando funcione a 3min o algo así

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// resetea el temporizador con cada interacción del usuario
function resetInactivityTimer() {
    console.log("Reseteando temporizador de inactividad");
    lastInteractionTime = Date.now();
}



if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const gamma = event.gamma;
        const now = Date.now();
        const threshold = 160;
        const delay = 1000;

        if (gamma != lastGamma && Math.abs(gamma - lastGamma) > threshold && now - lastActionTime > delay) {
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
    }, true);
}

if (!SpeechRecognition) {
    console.log("La API de reconocimiento de voz no es compatible con este navegador.");
} else {
    let recognitionActive = false;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;  // Escucha continua
    recognition.interimResults = false;  // No mostrar resultados intermedios
    recognition.maxAlternatives = 1;  // Solo una alternativa

    recognition.onresult = (event) => {
        if (!recognitionActive) return;
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Escuchado:", transcript);
        //resetInactivityTimer(); // a lo mejor debería resetear solo si reconoce alguna acción
        if (transcript.includes("pasa")) {
            console.log("Comando: pasa");
            resetInactivityTimer();
            socket.emit("next-page");  // Emitir evento de página siguiente al servidor
        } else if (transcript.includes("vuelve")) {
            console.log("Comando: vuelve");
            resetInactivityTimer();
            socket.emit("prev-page");  // Emitir evento de página anterior al servidor
        } else {
            console.log("Comando no reconocido:", transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error("Error de reconocimiento de voz:", event.error);
        // Si el error es 'not-allowed', puedes reiniciar el reconocimiento aquí si quieres
        if (event.error === 'not-allowed') {
            console.log("Permiso de micrófono denegado.");
        }
    };

    // Si el reconocimiento termina (onend), reiniciamos el reconocimiento
    recognition.onend = () => {
        console.log("Reconocimiento de voz terminado.");
        if (recognitionActive) {
            recognition.start();  // Reinicia el reconocimiento de voz
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
        resetInactivityTimer();
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("exit-book");
    nextButton.addEventListener("click", function () {
        socket.emit("exit-book");
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
