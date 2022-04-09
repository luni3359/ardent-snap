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


function Vector2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector2D.prototype.magnitude = function () {
    return Math.sqrt(Math.abs(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
};

Vector2D.prototype.unit = function () {
    const magnitude = this.magnitude;
    return new Vector2D(this.x / magnitude, this.y / magnitude);
};

function Player() {
    this.size = 50;
    this.position = new Vector2D();
    this.speed = 1;
}

Player.prototype.update = function (dt) {
    let direction = new Vector2D();

    if (keys["a"]) {
        direction.x -= 1;
    }
    if (keys["d"]) {
        direction.x += 1;
    }
    if (keys["w"]) {
        direction.y -= 1;
    }
    if (keys["s"]) {
        direction.y += 1;
    }

    if (direction.x && direction.y) {
        let magnitude = Math.sqrt(Math.pow(direction.x, 2), Math.pow(direction.y, 2));
        this.position.x += direction.x / magnitude;
        this.position.y += direction.y / magnitude;
    } else {
        this.position.x += direction.x;
        this.position.y += direction.y;
    }

    print(`x: ${this.position.x}, y: ${this.position.y}`);

    if (this.position.x + this.size > canvas._resolution[0]) {
        this.position.x = canvas._resolution[0] - this.size;
    } else if (this.position.x < 0) {
        this.position.x = 0;
    }

    if (this.position.y + this.size > canvas._resolution[1]) {
        this.position.y = canvas._resolution[1] - this.size;
    } else if (this.position.y < 0) {
        this.position.y = 0;
    }
};

Player.prototype.draw = function () {
    ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
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
