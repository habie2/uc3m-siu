import { currentFontSizePercentage, updateFontSize, FONT_SIZE_STEP } from "./renderReader.js";

export function increaseFontSize() {
    updateFontSize(currentFontSizePercentage + FONT_SIZE_STEP);
};

export function decreaseFontSize() {
    updateFontSize(currentFontSizePercentage - FONT_SIZE_STEP);
};
