"use strict";

const keys = {};
let canvas;
let ctx;

function print(...args) {
    console.log(...args);
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
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
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2D.prototype.unit = function () {
    const magnitude = this.magnitude();

    if (!magnitude) {
        return new Vector2D();
    }

    return new Vector2D(this.x / magnitude, this.y / magnitude);
};

Vector2D.prototype.normalize = function () {
    const magnitude = this.magnitude();

    if (!magnitude) {
        this.x = 0;
        this.y = 0;
        return;
    }

    this.x /= magnitude;
    this.y /= magnitude;
};

function Player() {
    this.position = new Vector2D();
    this.size = new Vector2D(40, 60);
    this.speed = 1;
}

Player.prototype.update = function (dt) {
    const direction = new Vector2D();

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

    direction.normalize();

    this.position.x += this.speed * direction.x * dt;
    this.position.y += this.speed * direction.y * dt;

    if (this.position.x + this.size.x > canvas._resolution[0]) {
        this.position.x = canvas._resolution[0] - this.size.x;
    } else if (this.position.x < 0) {
        this.position.x = 0;
    }

    if (this.position.y + this.size.y > canvas._resolution[1]) {
        this.position.y = canvas._resolution[1] - this.size.y;
    } else if (this.position.y < 0) {
        this.position.y = 0;
    }
};

Player.prototype.draw = function () {
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
};

let players = [];
function update(dt) {
    for (let i = 0; i < players.length; i++) {
        players[i].update(dt);
    }
}

function draw() {
    ctx.clearRect(0, 0, 640, 720);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }
}

let last_time = performance.now();
let simulate_lag_timer = 0;
function gameRun() {
    let current_time = performance.now();
    // print(`prev: ${last_time}, now: ${current_time}`);
    const dt = current_time - last_time;
    last_time = current_time;

    simulate_lag_timer++;
    if (simulate_lag_timer > 500) {
        simulate_lag_timer = 0;
        sleep(500);
        print("whoops");
    }

    update(dt);
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
