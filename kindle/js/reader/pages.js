function getPageSize() {
    const readerElement = document.getElementById("reader");
    const readerHeight = readerElement.offsetHeight;
    const lineHeight = parseFloat(window.getComputedStyle(readerElement).lineHeight);

    const linesPerPage = Math.floor(readerHeight / lineHeight);
    return linesPerPage * getCharsPerLine();
}

function getCharsPerLine() {
    const readerElement = document.getElementById("reader");
    const readerWidth = readerElement.offsetWidth;
    const fontSize = parseFloat(window.getComputedStyle(readerElement).fontSize);
    const charWidth = fontSize;

    return Math.floor(readerWidth / charWidth);
}

export function splitIntoPages(content) {
    const pageSize = getPageSize();
    const linesPerPage = Math.floor(pageSize / getCharsPerLine());

    let lines = content.split("\n");
    let pageArray = [];
    let pageContent = [];

    for (let line of lines) {
        pageContent.push(line);

        if (pageContent.length >= linesPerPage) {
            pageArray.push(pageContent.join("\n"));
            pageContent = [];
        }
    }

    if (pageContent.length > 0) {
        pageArray.push(pageContent.join("\n"));
    }

    return pageArray;
}
