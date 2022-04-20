import { Dim2D, Vector2D } from "./math";
import { loadAssets, loadInitAssets } from "./media";
import { print, sleep } from "./utils";

let dpi = window.devicePixelRatio;
let fps = 0;

let fake_lag_timer = 0;
let fake_lag_enabled = false;

const keys = {};
let players = [];
let bullets = [];
let game;
let ctx;

let grid_cache = null;
let hud_cache = null;

let data, menus, fonts, hud, characters, projectiles;

class Ardent {
    #last_time = 0;
    #accumulator = 0;

    constructor() {
        this.canvas = null;
        this.resolution = new Dim2D();
        this.fps = 30;
    }

    gameLoop = (current_time) => {
        requestAnimationFrame(this.gameLoop);
        const dt = Math.max((current_time - this.#last_time) / 1000, this.fps);
        this.#last_time = current_time;

        this.#accumulator += Math.min(dt, 0.1);
        fps = dt;

        while (this.#accumulator >= this.fps) {
            this.update(this.fps);
            this.#accumulator -= this.fps;
        }

        if (fake_lag_enabled) {
            fake_lag_timer++;
            if (fake_lag_timer > 500) {
                fake_lag_timer = 0;
                sleep(500);
                print("whoops");
            }
        }

        this.draw(ctx);
    };

    update = (dt) => {
        for (let i = 0; i < players.length; i++) {
            players[i].update(dt);
        }

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].update(dt);
        }
    };

    draw = (ctx) => {
        ctx.clearRect(0, 0, game.resolution.x, game.resolution.y);

        draw_loading_screen(ctx);

        ctx.fillStyle = "#555";
        ctx.fillRect(32, 16, 16 * 24, 16 * 28);

        for (let i = 0; i < players.length; i++) {
            players[i].draw(ctx);
        }

        draw_hud(ctx);

        draw_temp_fps(ctx);

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].draw(ctx);
        }

        draw_grid(ctx);
    };

    play() {
        this.#last_time = performance.now();
        this.gameLoop(performance.now());
    }

    setFPS(n) {
        this.fps = 1 / n;
    }

    setResolution(w, h) {
        if (!w || !h) {
            return;
        }

        this.resolution.x = w;
        this.resolution.y = h;

        if (this.canvas) {
            this.updateCanvas();
        }
    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    updateCanvas() {
        this.canvas.style.width = `${this.resolution.x}px`;
        this.canvas.style.height = `${this.resolution.y}px`;
        this.canvas.width = this.resolution.x;
        this.canvas.height = this.resolution.y;
    }
}

class Entity {
    constructor(x, y, w, h) {
        this.position = new Vector2D(x, y);
        this.size = new Dim2D(w, h);
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

        if (this.position.x + this.radius > game.resolution.x) {
            this.speed.x = -this.speed.x;
            this.position.x = game.resolution.x - this.radius;
        } else if (this.position.x - this.radius < 0) {
            this.speed.x = -this.speed.x;
            this.position.x = this.radius;
        }

        if (this.position.y + this.radius > game.resolution.y) {
            this.speed.y = -this.speed.y;
            this.position.y = game.resolution.y - this.radius;
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

        const boundary_start = new Dim2D(32, 16);
        const boundary_end = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);

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
        const character = data['reimu']['data'];
        const int_x = Math.floor(this.position.x);
        const int_y = Math.floor(this.position.y);
        const frame_i = Math.floor(this.frame);

        if (frame_i == 0)
            ctx.fillStyle = "cyan";
        else
            ctx.fillStyle = "blue";

        ctx.fillRect(int_x, int_y, character.w, character.h);
        ctx.drawImage(characters, character.x + character.w * frame_i, character.y, character.w, character.h, int_x, int_y, character.w, character.h);

        this.frame += 0.1;

        if (this.frame >= 8) {
            this.frame = 0;
        }

        if (this.slow) {
            const size = 64;
            const x = int_x - size / 2 + character.w / 2;
            const y = int_y - size / 2 + character.h / 2;
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

function draw_loading_screen(ctx) {
    const lsc = data['loading-screen'];
    const lgw = data['loading-girls-waiting'];
    const lnl = data['loading-now-loading'];

    // background
    ctx.drawImage(menus, lsc.x, lsc.y, lsc.w, lsc.h, 0, 0, game.resolution.x, game.resolution.y);
    // girls waiting
    ctx.drawImage(menus, lgw.x, lgw.y, lgw.w, lgw.h, 416, 368, 125, 45);
    // now loading
    ctx.drawImage(menus, lnl.x, lnl.y, lnl.w, lnl.h, 474, 394, 125, 30);
}

function draw_hud(ctx) {
    if (hud_cache) {
        ctx.drawImage(hud_cache, 0, 0);
        return;
    }

    hud_cache = document.createElement("canvas");
    hud_cache.width = game.canvas.width;
    hud_cache.height = game.canvas.height;

    const hudR = data['hud-background-right'];
    const hudL = data['hud-background-left'];
    const hudT = data['hud-background-top'];
    const hudB = data['hud-background-bottom'];
    const ctx_c = hud_cache.getContext("2d");

    // right piece
    ctx_c.drawImage(hud, hudR.x, hudR.y, hudR.w, hudR.h, game.resolution.x - hudR.w, 0, hudR.w, hudR.h);
    // left piece
    ctx_c.drawImage(hud, hudL.x, hudL.y, hudL.w, hudL.h, 0, 0, hudL.w, hudL.h);
    // top piece
    ctx_c.drawImage(hud, hudT.x, hudT.y, hudT.w, hudT.h, hudL.w, 0, hudT.w, hudT.h);
    // bottom piece
    ctx_c.drawImage(hud, hudB.x, hudB.y, hudB.w, hudB.h, hudL.w, game.resolution.y - hudB.h, hudB.w, hudB.h);

    ctx.drawImage(hud_cache, 0, 0);
}

function draw_grid(ctx) {
    if (grid_cache) {
        ctx.drawImage(grid_cache, 0, 0);
        return;
    }

    grid_cache = document.createElement("canvas");
    const grid_size = new Dim2D(40, 30);
    const square_size = 16;
    const line_offset = 0.5;

    grid_cache.width = grid_size.x * square_size;
    grid_cache.height = grid_size.y * square_size;
    const ctx_c = grid_cache.getContext("2d");

    ctx_c.setLineDash([4, 4]);
    ctx_c.translate(line_offset, line_offset);

    // draw vertical lines
    for (let i = 0; i < grid_size.x; i++) {
        const x = i * square_size;
        const y = grid_size.y * square_size;

        ctx_c.strokeStyle = "white";
        ctx_c.beginPath();
        ctx_c.moveTo(x, 0);
        ctx_c.lineTo(x, y);
        ctx_c.stroke();
        ctx_c.strokeStyle = "black";
        ctx_c.beginPath();
        ctx_c.moveTo(x, y);
        ctx_c.lineTo(x, 0);
        ctx_c.stroke();
    }

    // draw horizontal lines
    for (let i = 0; i < grid_size.y; i++) {
        const x = grid_size.x * square_size;
        const y = i * square_size;

        ctx_c.strokeStyle = "white";
        ctx_c.beginPath();
        ctx_c.moveTo(0, y);
        ctx_c.lineTo(x, y);
        ctx_c.stroke();
        ctx_c.strokeStyle = "black";
        ctx_c.beginPath();
        ctx_c.moveTo(x, y);
        ctx_c.lineTo(0, y);
        ctx_c.stroke();
    }

    // draw gold frame
    ctx_c.strokeStyle = "yellow";
    ctx_c.beginPath();
    ctx_c.moveTo(0, 0);
    ctx_c.lineTo(grid_size.x * square_size, 0);
    ctx_c.moveTo(grid_size.x * square_size - 1, 0);
    ctx_c.lineTo(grid_size.x * square_size - 1, grid_size.y * square_size);
    ctx_c.moveTo(0, 0);
    ctx_c.lineTo(0, grid_size.y * square_size);
    ctx_c.moveTo(0, grid_size.y * square_size - 1);
    ctx_c.lineTo(grid_size.x * square_size, grid_size.y * square_size - 1);
    ctx_c.stroke();

    ctx_c.translate(-line_offset, -line_offset);
    ctx.drawImage(grid_cache, 0, 0);
}

function draw_temp_fps(ctx) {
    const fps_number = (1 / fps).toFixed(1);

    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.fillText(`${fps_number}fps`, 412, 456);
}

async function main() {
    const canvas = document.getElementById("game-window");

    game = new Ardent();
    game.setCanvas(canvas);
    game.setResolution(640, 480);
    game.setFPS(60);
    ctx = game.canvas.getContext("2d");
    // ctx.scale(dpi, dpi);

    [data, menus] = await loadInitAssets();

    [fonts, hud, characters, projectiles] = await loadAssets();

    const player = new Player(200, 350);
    players.push(player);

    game.play();
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
