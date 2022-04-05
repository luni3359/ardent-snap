"use strict";
window.addEventListener("load", e => {
    main();
});

window.addEventListener("keydown", e => {

});

window.addEventListener("keyup", e => {

});

function gameRun() {
    requestAnimationFrame(gameRun);
}

function main() {
    const GAME_RESOLUTION = [640, 720];
    let canvas = document.getElementById("game-window");
    canvas.style.width = GAME_RESOLUTION[0] + "px";
    canvas.style.height = GAME_RESOLUTION[1] + "px";

    gameRun();
}
