import Vector2D from "./math";
import { loadAssets, loadInitAssets } from "./media";
import { print, sleep } from "./utils";


let fake_lag_timer = 0;
let fake_lag_enabled = false;

const keys = {};
let players = [];
let bullets = [];
let canvas;
let ctx;

class GameCanvas {
    constructor(canvas) {
        this._canvas = canvas || null;
        this._resolution = new Vector2D(640, 480);
        this.setResolution();
    }

    setResolution(w, h) {
        this._resolution.x = w || this._resolution.x;
        this._resolution.y = h || this._resolution.y;

        this._canvas.style.width = `${this._resolution.x}px`;
        this._canvas.style.height = `${this._resolution.y}px`;
        this._canvas.width = this._resolution.x;
        this._canvas.height = this._resolution.y;
    }
}

class Entity {
    constructor(x, y, w, h) {
        this.position = new Vector2D(x, y);
        this.size = new Vector2D(w, h);
    }

    draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

class Bullet extends Entity {
    constructor(x, y) {
        super(x, y);
        this.topspeed = 500;
        this.radius = 8;
        this.speed = new Vector2D(Math.random() * this.topspeed - this.topspeed / 2, Math.random() * this.topspeed - this.topspeed / 2);
    }

    update(dt) {
        this.position.x += this.speed.x * dt;
        this.position.y += this.speed.y * dt;

        if (this.position.x + this.radius > canvas._resolution.x) {
            this.speed.x = -this.speed.x;
            this.position.x = canvas._resolution.x - this.radius;
        } else if (this.position.x - this.radius < 0) {
            this.speed.x = -this.speed.x;
            this.position.x = this.radius;
        }

        if (this.position.y + this.radius > canvas._resolution.y) {
            this.speed.y = -this.speed.y;
            this.position.y = canvas._resolution.y - this.radius;
        } else if (this.position.y - this.radius < 0) {
            this.speed.y = -this.speed.y;
            this.position.y = this.radius;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "magenta";
        ctx.fill();
    }
}

class Player extends Entity {
    constructor(x, y, w, h) {
        super();
        this.position = new Vector2D(x, y);
        this.size = new Vector2D(w || 40, h || 60);
        this.speed = 200;
    }

    update(dt) {
        const direction = new Vector2D();
        if (keys["KeyA"] || keys["ArrowLeft"]) {
            direction.x -= 1;
        }
        if (keys["KeyD"] || keys["ArrowRight"]) {
            direction.x += 1;
        }

        if (keys["KeyW"] || keys["ArrowUp"]) {
            direction.y -= 1;
        }

        if (keys["KeyS"] || keys["ArrowDown"]) {
            direction.y += 1;
        }

        let modifier = 1;
        if (keys["ShiftLeft"]) {
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
    }

    draw() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}


function update(dt) {
    for (let i = 0; i < players.length; i++) {
        players[i].update(dt);
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update(dt);
    }
}

function draw_loading_screen() {
    const lsc = data['loading-screen'];
    const lgw = data['loading-girls-waiting'];
    const lnl = data['loading-now-loading'];

    // background
    ctx.drawImage(menus, lsc.x, lsc.y, lsc.w, lsc.h, 0, 0, canvas._resolution.x, canvas._resolution.y);
    // girls waiting
    ctx.drawImage(menus, lgw.x, lgw.y, lgw.w, lgw.h, 416, 368, 125, 45);
    // now loading
    ctx.drawImage(menus, lnl.x, lnl.y, lnl.w, lnl.h, 474, 394, 125, 30);
}

function draw_hud() {
    const hudR = data['hud-background-right'];
    const hudL = data['hud-background-left'];
    const hudT = data['hud-background-top'];
    const hudB = data['hud-background-bottom'];

    // right piece
    ctx.drawImage(hud, hudR.x, hudR.y, hudR.w, hudR.h, canvas._resolution.x - hudR.w, 0, hudR.w, hudR.h);
    // left piece
    ctx.drawImage(hud, hudL.x, hudL.y, hudL.w, hudL.h, 0, 0, hudL.w, hudL.h);
    // top piece
    ctx.drawImage(hud, hudT.x, hudT.y, hudT.w, hudT.h, hudL.w, 0, hudT.w, hudT.h);
    // bottom piece
    ctx.drawImage(hud, hudB.x, hudB.y, hudB.w, hudB.h, hudL.w, canvas._resolution.y - hudB.h, hudB.w, hudB.h);
}

function draw_grid() {
    const grid_size = new Vector2D(40, 30);
    const square_size = 16;
    const line_offset = 0.5;

    ctx.setLineDash([4, 4]);
    ctx.translate(line_offset, line_offset);

    // draw vertical lines
    for (let i = 0; i < grid_size.x; i++) {
        const x = i * square_size;
        const y = grid_size.y * square_size;

        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, 0);
        ctx.stroke();
    }

    // draw horizontal lines
    for (let i = 0; i < grid_size.y; i++) {
        const x = grid_size.x * square_size;
        const y = i * square_size;

        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(0, y);
        ctx.stroke();
    }

    // draw gold frame
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(grid_size.x * square_size, 0);
    ctx.lineTo(grid_size.x * square_size, grid_size.y * square_size);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, grid_size.y * square_size);
    ctx.lineTo(grid_size.x * square_size, grid_size.y * square_size);
    ctx.stroke();

    ctx.translate(-line_offset, -line_offset);
}

function draw() {
    ctx.clearRect(0, 0, canvas._resolution.x, canvas._resolution.y);

    draw_loading_screen();

    // ctx.fillStyle = "magenta";
    // ctx.fillRect(32, 16, 16 * 24, 16 * 28);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }

    draw_hud();

    draw_grid();

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw();
    }
}

let data, menus, hud;

const STEP = 1 / 60;
let last_time = performance.now();
let accumulator = 0;

function gameLoop(current_time) {
    requestAnimationFrame(gameLoop);
    let dt = Math.min((current_time - last_time) / 1000, 0.1);
    last_time = current_time;

    accumulator += dt;

    while (accumulator >= STEP) {
        update(STEP);
        accumulator -= STEP;
    }

    if (fake_lag_enabled) {
        fake_lag_timer++;
        if (fake_lag_timer > 500) {
            fake_lag_timer = 0;
            sleep(500);
            print("whoops");
        }
    }

    draw();
}

async function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");

    [data, menus] = await loadInitAssets();

    [hud] = await loadAssets();

    let player = new Player(200, 350);
    players.push(player);

    gameLoop(performance.now());
}


window.addEventListener("keydown", e => {
    // e.preventDefault();
    keys[e.code] = true;
});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});

window.addEventListener("load", () => { main(); });
