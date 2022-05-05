import { Ardent } from "./ardent/engine";
import "./ardent/input";
import { Dim2D } from "./ardent/math";
import { SceneManager } from "./ardent/scenes";
import { StorageManager } from "./ardent/storage";
import { loadAssets } from "./fetch";
import { TestScene } from "./scenes/testScene";


let dpi = window.devicePixelRatio;
let fps, tps = 0;

let game, cursor, showGrid, showCounters;

function drawCounters(ctx) {
    const tpsNumber = (1 / tps).toFixed(1);
    const fpsNumber = (1 / fps).toFixed(1);
    const tpsLabel = `${tpsNumber}tps`;
    const fpsLabel = `${fpsNumber}fps`;
    const x = 415;
    const y = 460;
    const fontSize = 12;

    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(tpsLabel, x, y - fontSize);
    ctx.fillText(tpsLabel, x, y - fontSize);
    ctx.strokeText(fpsLabel, x, y);
    ctx.fillText(fpsLabel, x, y);
}

function drawMouse(ctx) {
    const boxSize = 20;
    const x = Math.floor(cursor.x - boxSize);
    const y = Math.floor(cursor.y - boxSize);

    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, boxSize, boxSize);
}

async function main() {
    const canvas = document.getElementById("game-window");
    cursor = new Dim2D(0, 0);

    canvas.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        cursor.x = (e.clientX - rect.left) * scaleX;
        cursor.y = (e.clientY - rect.top) * scaleY;
    });

    game = new Ardent();
    game.setCanvas(canvas);
    game.setResolution(640, 480);
    game.setTickRate(60);

    await loadAssets();

    showCounters = StorageManager.load("displayCounters", true);
    showGrid = StorageManager.load("displayGrid", false);
    Ardent.debugMode = StorageManager.load("debugMode", false);

    SceneManager.loadScene(new TestScene());

    game.play();
}

window.addEventListener("resize", e => {
    // dpi = window.devicePixelRatio;
    // ctx.scale(dpi, dpi);
})

window.addEventListener("load", main);
