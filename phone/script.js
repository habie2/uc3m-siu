const socket = io(); // Conectar con el servidor

let lastGamma = null;
let lastActionTime = 0;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
        }

        lastGamma = gamma;
    }, true);
}

if (!SpeechRecognition) {
    console.log("La API de reconocimiento de voz no es compatible con este navegador.");
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;  // Escucha continua
    recognition.interimResults = false;  // No mostrar resultados intermedios
    recognition.maxAlternatives = 1;  // Solo una alternativa

    // Inicia el reconocimiento de voz
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        console.log("Escuchado:", transcript);

        if (transcript.includes("pasa")) {
            console.log("Comando: pasa");
            socket.emit("next-page");  // Emitir evento de página siguiente al servidor
        } else if (transcript.includes("vuelve")) {
            console.log("Comando: vuelve");
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
        recognition.start();  // Reinicia el reconocimiento de voz
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("next-page");
    nextButton.addEventListener("click", function () {
        socket.emit("next-page");

    });
});
