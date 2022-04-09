"use strict";

const keys = {};
let players = [];
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

function GameCanvas(canvas) {
    this._canvas = canvas || null;
    this._resolution = new Vector2D(640, 720);
    this.setResolution();
}

GameCanvas.prototype.setResolution = function (w, h) {
    this._resolution.x = w || this._resolution.x;
    this._resolution.y = h || this._resolution.y;

    this._canvas.style.width = `${this._resolution.x}px`;
    this._canvas.style.height = `${this._resolution.y}px`;
    this._canvas.width = this._resolution.x;
    this._canvas.height = this._resolution.y;
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

function Entity(x, y, w, h) {
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(w, h);
}

Entity.prototype.draw = function () {
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
};

function Player(x, y, w, h) {
    Entity.call(this);
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(w || 40, h || 60);
    this.speed = 1;
}
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function (dt) {
    const direction = new Vector2D();
    if (keys[65] || keys[37]) {
        direction.x -= 1;
    }
    if (keys[68] || keys[39]) {
        direction.x += 1;
    }
    if (keys[87] || keys[38]) {
        direction.y -= 1;
    }
    if (keys[83] || keys[40]) {
        direction.y += 1;
    }

    let modifier = 1;
    if (keys[16]) {
        modifier = 0.5;
    }

    direction.normalize();

    this.position.x += this.speed * modifier * direction.x * dt;
    this.position.y += this.speed * modifier * direction.y * dt;

    if (this.position.x + this.size.x > canvas._resolution.x) {
        this.position.x = canvas._resolution.x - this.size.x;
    } else if (this.position.x < 0) {
        this.position.x = 0;
    }

    if (this.position.y + this.size.y > canvas._resolution.y) {
        this.position.y = canvas._resolution.y - this.size.y;
    } else if (this.position.y < 0) {
        this.position.y = 0;
    }
};

function update(dt) {
    for (let i = 0; i < players.length; i++) {
        players[i].update(dt);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas._resolution.x, canvas._resolution.y);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }
}

let last_time = performance.now();
// let simulate_lag_timer = 0;
function gameRun(timestamp) {
    requestAnimationFrame(gameRun);
    const dt = timestamp - last_time;
    last_time = timestamp;

    // simulate_lag_timer++;
    // if (simulate_lag_timer > 500) {
    //     simulate_lag_timer = 0;
    //     sleep(500);
    //     print("whoops");
    // }

    update(dt);
    draw();
}

function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");

    let player = new Player(canvas._canvas.width / 2, canvas._canvas.height / 2);
    players.push(player);

    gameRun(performance.now());
}

window.addEventListener("keydown", e => {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

window.addEventListener("load", () => { main(); });
