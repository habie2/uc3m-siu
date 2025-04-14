window.addEventListener("DOMContentLoaded", () => {
    const googleIcon = document.getElementById("interactiveGoogleIcon");

    function switchDarkMode() {
    console.log("Switching dark mode...");
    }

    // Añadimos un Event Listener para el evento 'click'
    googleIcon.addEventListener("click", () => {
        if (googleIcon) {
            googleIcon.classList.toggle("filled");
            switchDarkMode();
        }
    });
});
