const socket = io();

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("next-page");
    nextButton.addEventListener("click", function () {
        socket.emit("next-page");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("prev-page");
    nextButton.addEventListener("click", function () {
        socket.emit("prev-page");
    });
});