import Vector2D from "./math";
import { loadAssets, loadInitAssets } from "./media";
import { print, sleep } from "./utils";

let dpi = window.devicePixelRatio;
let fps = 0;

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

    draw(ctx) {
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

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "magenta";
        ctx.fill();
    }
}

class Player extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w || 32, h || 48);
        this.speed = 255;
        this.animation = "idle";
        this.frame = 0;
        this.slow = false;
        this.focus_frame = 0;
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

        if (direction.x != 0) {
            if (direction.x > 0) {
                this.animation = "right";
            } else {
                this.animation = "left";
            }
        } else {
            this.animation = "idle";
        }

        let modifier = 1;
        if (keys["ShiftLeft"]) {
            this.slow = true;
            modifier = 0.5;
        } else {
            this.slow = false;
        }

        direction.normalize();

        this.position.x += this.speed * modifier * direction.x * dt;
        this.position.y += this.speed * modifier * direction.y * dt;

        const boundary_start = new Vector2D(32, 16);
        const boundary_end = new Vector2D(16 * 24 + 16 * 2, 16 * 28 + 16);

        if (this.position.x + this.size.x > boundary_end.x) {
            this.position.x = boundary_end.x - this.size.x;
        } else if (this.position.x < boundary_start.x) {
            this.position.x = boundary_start.x;
        }

        if (this.position.y + this.size.y > boundary_end.y) {
            this.position.y = boundary_end.y - this.size.y;
        } else if (this.position.y < boundary_start.y) {
            this.position.y = boundary_start.y;
        }
    }

    draw(ctx) {
        const int_x = Math.ceil(this.position.x);
        const int_y = Math.ceil(this.position.y);
        let offset_x = 16;
        let offset_y = 16;
        let w = 32;
        let h = 48;
        let frame_i = Math.floor(this.frame);
        print(frame_i);

        if (frame_i == 0)
            ctx.fillStyle = "cyan";
        else
            ctx.fillStyle = "blue";

        // ctx.fillRect(int_x, int_y, this.size.x, this.size.y);
        ctx.fillRect(int_x, int_y, w, h);
        // ctx.drawImage(characters, 10, 10, 45, 60, int_x, int_y, this.size.x, this.size.y);
        ctx.drawImage(characters, offset_x + w * frame_i, offset_y, w, h, int_x, int_y, w, h);

        this.frame += 0.1;

        if (this.frame >= 8) {
            this.frame = 0;
        }

        if (this.slow) {
            const size = 64;
            const x = int_x - size / 2 + w / 2;
            const y = int_y - size / 2 + h / 2;
            ctx.save();
            ctx.rotate(this.focus_frame);
            ctx.fillStyle = "#00000055";
            ctx.fillRect(x, y, size, size);
            ctx.drawImage(projectiles, 268, 32, size, size, x, y, size, size)
            ctx.restore();

            this.focus_frame += 0.1;

            if (this.focus_frame > Math.PI * 2) {
                this.focus_frame -= Math.PI * 2;
            }
        }
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

function draw_loading_screen(ctx) {
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

function draw_hud(ctx) {
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

function draw_grid(ctx) {
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
    ctx.moveTo(grid_size.x * square_size - 1, 0);
    ctx.lineTo(grid_size.x * square_size - 1, grid_size.y * square_size);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, grid_size.y * square_size);
    ctx.moveTo(0, grid_size.y * square_size - 1);
    ctx.lineTo(grid_size.x * square_size, grid_size.y * square_size - 1);
    ctx.stroke();

    ctx.translate(-line_offset, -line_offset);
}

function draw_temp_fps(ctx) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    const fps_number = (1 / fps).toFixed(1);
    ctx.fillText(`${fps_number}fps`, 412, 456);
}

function draw(ctx) {
    ctx.clearRect(0, 0, canvas._resolution.x, canvas._resolution.y);

    // draw_loading_screen();

    ctx.fillStyle = "#555";
    ctx.fillRect(32, 16, 16 * 24, 16 * 28);

    for (let i = 0; i < players.length; i++) {
        players[i].draw(ctx);
    }

    draw_hud(ctx);

    draw_grid(ctx);

    draw_temp_fps(ctx);

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw(ctx);
    }
}

let data, menus, fonts, hud, characters, projectiles;

const STEP = 1 / 60;
let last_time = performance.now();
let accumulator = 0;

function gameLoop(current_time) {
    requestAnimationFrame(gameLoop);
    const dt = (current_time - last_time) / 1000;
    last_time = current_time;

    accumulator += Math.min(dt, 0.1);
    fps = dt;

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

    draw(ctx);
}

async function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");
    // ctx.scale(dpi, dpi);

    [data, menus] = await loadInitAssets();

    [fonts, hud, characters, projectiles] = await loadAssets();

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

window.addEventListener("resize", e => {
    // dpi = window.devicePixelRatio;
    // ctx.scale(dpi, dpi);
})

window.addEventListener("load", () => { main(); });
