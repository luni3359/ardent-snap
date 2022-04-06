const keys = {};
let canvas;
let ctx;

function print(...args) {
    console.log(...args);
}


/**
 * @class
 * @param {HTMLCanvasElement} canvas
 * @prop {HTMLCanvasElement} _canvas
 */
function GameCanvas(canvas) {
    this._canvas = canvas || null;
    this._resolution = [640, 720];
    this.setResolution();
}

/**
 *
 * @param {Number} w
 * @param {Number} h
 */
GameCanvas.prototype.setResolution = function (w, h) {
    if (w) {
        this._resolution[0] = w;
    }

    if (h) {
        this._resolution[1] = h;
    }

    this._canvas.style.width = `${this._resolution[0]}px`;
    this._canvas.style.height = `${this._resolution[1]}px`;
    this._canvas.width = this._resolution[0];
    this._canvas.height = this._resolution[1];
};

let x = 0;
let y = 0;
let update_last = performance.now();
function update() {
    let update_now = performance.now();
    const dt = update_now - update_last;
    // print(dt);
    update_last = update_now;
    
    if (keys["a"]) {
        x -= 1 * dt;
    }
    if (keys["d"]) {
        x += 1 * dt;
    }
    if (keys["w"]) {
        y -= 1 * dt;
    }
    if (keys["s"]) {
        y += 1 * dt;
    }

    if (x + 50 > canvas._resolution[0]) {
        x = canvas._resolution[0] - 50;
    } else if (x  < 0) {
        x = 0;
    }

    if (y + 50 > canvas._resolution[1]) {
        y = canvas._resolution[1] - 50;
    } else if (y  < 0) {
        y = 0;
    }
}

draw_last = performance.now();
function draw(ct) {
    print(ct - draw_last)
    draw_last = ct;
    ctx.clearRect(0, 0, 640, 720);
    ctx.fillRect(x, y, 50, 50);
    requestAnimationFrame(draw)
}

function gameRun() {
    setInterval(update, 10);
    draw();
}

function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");
    gameRun();
}

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

window.addEventListener("load", () => { main(); });
