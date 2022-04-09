"use strict";

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

function Player() {
    this.size = 50;
    this.x = 0;
    this.y = 0;
    this.speed = 1;
}

Player.prototype.update = function (dt) {
    let direction = [0, 0];

    if (keys["a"]) {
        direction[0] -= 1;
    }
    if (keys["d"]) {
        direction[0] += 1;
    }
    if (keys["w"]) {
        direction[1] -= 1;
    }
    if (keys["s"]) {
        direction[1] += 1;
    }

    if (direction[0] && direction[1]) {
        let magnitude = Math.sqrt(Math.pow(direction[0], 2), Math.pow(direction[1], 2));
        this.x += direction[0] / magnitude;
        this.y += direction[1] / magnitude;
    } else {
        this.x += direction[0];
        this.y += direction[1];
    }

    print(`x: ${this.x}, y: ${this.y}`);

    if (this.x + this.size > canvas._resolution[0]) {
        this.x = canvas._resolution[0] - this.size;
    } else if (this.x < 0) {
        this.x = 0;
    }

    if (this.y + this.size > canvas._resolution[1]) {
        this.y = canvas._resolution[1] - this.size;
    } else if (this.y < 0) {
        this.y = 0;
    }
};

Player.prototype.draw = function () {
    ctx.fillRect(this.x, this.y, this.size, this.size);
};

let players = [];
let update_last = performance.now();
function update() {
    let update_now = performance.now();
    const dt = update_now - update_last;
    // print(dt);
    update_last = update_now;

    for (let i = 0; i < players.length; i++) {
        players[i].update(dt);
    }
}

let draw_last = performance.now();
function draw(dt) {
    // print(ct - draw_last)
    // draw_last = ct;
    ctx.clearRect(0, 0, 640, 720);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }
}

function gameRun() {
    update();
    draw();
}

function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");
    players.push(new Player());
    window.setInterval(gameRun, 10);
}

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

window.addEventListener("load", () => { main(); });
