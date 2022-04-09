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
}

Player.prototype.update = function (dt) {
    if (keys["a"]) {
        this.x -= 1 * dt;
    }
    if (keys["d"]) {
        this.x += 1 * dt;
    }
    if (keys["w"]) {
        this.y -= 1 * dt;
    }
    if (keys["s"]) {
        this.y += 1 * dt;
    }

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

draw_last = performance.now();
function draw(ct) {
    // print(ct - draw_last)
    draw_last = ct;
    ctx.clearRect(0, 0, 640, 720);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }

    requestAnimationFrame(draw)
}

function gameRun() {
    setInterval(update, 10);
    draw();
}

function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");
    players.push(new Player());
    gameRun();
}

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

window.addEventListener("load", () => { main(); });
