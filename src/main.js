import GameCanvas from "./canvas";
import gameRun from "./game";

function main() {
    const canvas = new GameCanvas(document.getElementById("game-window"));
    gameRun();
}

window.addEventListener("load", () => { main(); });
