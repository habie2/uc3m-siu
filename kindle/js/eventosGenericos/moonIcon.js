window.addEventListener("DOMContentLoaded", () => {
    const googleIcon = document.getElementById("interactiveGoogleIcon");

    function switchDarkMode() {
    console.log("Switching dark mode...");
    }

    googleIcon.addEventListener("click", () => {
        if (googleIcon) {
            googleIcon.classList.toggle("filled");
            switchDarkMode();
        }
    });
});
