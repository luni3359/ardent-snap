/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/


const GAME_RESOLUTION = [640, 720];

window.addEventListener("load", function (e) {
    main();
});

function main() {
    let canvas = document.getElementById("game-window");
    console.log("page fully loaded!");
    console.log(canvas);
    canvas = setupCanvas(canvas);
}

/**
 * 
 * @param {Canvas} canvas 
 * @returns {Canvas}
 */
function setupCanvas(canvas) {
    canvas.style.width = GAME_RESOLUTION[0];
    canvas.style.height = GAME_RESOLUTION[1];
    return canvas;
}

/******/ })()
;