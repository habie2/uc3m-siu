const socket = io(); // Conectar con el servidor

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("next-page");
    nextButton.addEventListener("click", function () {
        socket.emit("next-page");

    });
});
