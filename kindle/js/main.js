import { loadBook } from "./reader.js";
import { setupNavigation } from "./navigate.js";

document.addEventListener("DOMContentLoaded", function () {
    loadBook("el-nombre-del-viento.txt");
    setupNavigation();
});