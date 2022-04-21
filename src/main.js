import { Dim2D, Vector2D } from "./math";
import { loadAssets, loadInitAssets } from "./media";
import { print, sleep } from "./utils";

let dpi = window.devicePixelRatio;
let fps = 0;

const keys = {};
let players = [];
let bullets = [];
let game;

let grid_cache = null;
let hud_cache = null;

let data, menus, fonts, hud, characters, projectiles;

class Ardent {
    static debugMode = false;

    #last_time = 0;
    #accumulator = 0;
    #ctx = null;

    #fake_lag_timer = 0;
    #fake_lag_enabled = false;

    constructor() {
        this.canvas = null;
        this.resolution = new Dim2D();
        this.fps = 30;
    }

    gameLoop = (current_time) => {
        requestAnimationFrame(this.gameLoop);
        const dt = (current_time - this.#last_time) / 1000;
        this.#last_time = current_time;
        fps = Math.max(dt, this.fps);

        this.#accumulator += Math.min(dt, 0.1);

        while (this.#accumulator >= this.fps) {
            this.#accumulator -= this.fps;
            this.update(this.fps);
        }

        if (this.#fake_lag_enabled) {
            this.#fake_lag_timer++;
            if (this.#fake_lag_timer > 500) {
                this.#fake_lag_timer = 0;
                sleep(500);
                print("whoops");
            }
        }

        this.draw(this.#ctx);
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

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].draw(ctx);
        }

        draw_hud(ctx);
        draw_grid(ctx);
        draw_temp_fps(ctx);
    };

    play() {
        this.#ctx = this.canvas.getContext("2d");
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

    update(dt) { }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

class Bullet extends Entity {
    static #boundary_start = new Dim2D(32, 16);
    static #boundary_end = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);
    static #sprite_cache = null;

    constructor(x, y) {
        super(x, y);
        this.topspeed = 250;
        this.radius = 8;

        const randomDirection = new Vector2D(Math.random() - 0.5, Math.random() - 0.5).unit();
        this.speed = randomDirection.multiply(new Vector2D(this.topspeed * Math.random(), this.topspeed * Math.random()));
    }

    update(dt) {
        this.position.x += this.speed.x * dt;
        this.position.y += this.speed.y * dt;

        this.checkBoundCollision();
    }

    draw(ctx) {
        const size = this.radius * 2;

        if (Bullet.#sprite_cache) {
            ctx.drawImage(Bullet.#sprite_cache, this.position.x - this.radius, this.position.y - this.radius, size, size);
            return;
        }

        const x = this.radius;
        const y = this.radius;

        const sprite_cache = document.createElement("canvas");
        Bullet.#sprite_cache = sprite_cache;
        sprite_cache.width = size;
        sprite_cache.height = size;
        const ctx_c = sprite_cache.getContext("2d");

        if (Ardent.debugMode) {
            ctx_c.fillStyle = "cyan";
            ctx_c.fillRect(-x, -y, size * 2 * 2, size * 2 * 2);
        }

        ctx_c.beginPath();
        ctx_c.arc(x, y, size / 2, 0, 2 * Math.PI, false);
        ctx_c.fillStyle = "magenta";
        ctx_c.fill();
        ctx.drawImage(sprite_cache, this.position.x, this.position.y, size, size);
    }

    checkBoundCollision() {
        let bounced = false;

        if (this.position.x + this.radius > Bullet.#boundary_end.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundary_end.x - this.radius;
        } else if (this.position.x - this.radius < Bullet.#boundary_start.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundary_start.x + this.radius;
        }

        if (this.position.y + this.radius > Bullet.#boundary_end.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundary_end.y - this.radius;
        } else if (this.position.y - this.radius < Bullet.#boundary_start.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundary_start.y + this.radius;
        }

        if (bounced) {
            this.speed = new Vector2D(this.speed.x * 1.1, this.speed.y * 1.1);
        }
    }
}

class Player extends Entity {
    static #boundary_start = new Dim2D(32, 16);
    static #boundary_end = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);

    constructor(x, y, w, h) {
        super(x, y, w || 32, h || 48);
        this.character = "reimu";
        this.speed = 255;

        this.animation = "idle";
        this.frame = 0;

        this.isFocused = false;
        this.focus_frame = 0;
    }

    update(dt) {
        const direction = new Vector2D();
        let focus_modifier = 1;

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
                this.changeAnimation("right");
            } else {
                this.changeAnimation("left");
            }
        } else {
            this.changeAnimation("idle");
        }

        if (keys["ShiftLeft"]) {
            this.isFocused = true;
            focus_modifier = 0.5;
        } else {
            this.isFocused = false;
        }

        direction.normalize();

        this.position.x += this.speed * focus_modifier * direction.x * dt;
        this.position.y += this.speed * focus_modifier * direction.y * dt;

        this.checkBulletCollision();
        this.checkBoundCollision();
    }

    draw(ctx) {
        this.drawAnimation(ctx);

        if (this.isFocused) {
            this.drawFocusSign(ctx);
        }
    }

    drawAnimation(ctx) {
        const character = data[this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const frame_i = Math.floor(this.frame);

        if (Ardent.debugMode) {
            if (frame_i == 0)
                ctx.fillStyle = "cyan";
            else
                ctx.fillStyle = "blue";
            ctx.fillRect(x, y, character.w, character.h);
        }

        ctx.drawImage(characters, character.x + character.w * frame_i, character.y, character.w, character.h, x, y, character.w, character.h);

        this.frame += 0.1;

        if (this.frame >= 8) {
            if (this.animation == "idle") {
                this.frame = 0;
            } else {
                this.frame = 3;
            }
        }
    }

    drawFocusSign(ctx) {
        const character = data[this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const sign = data['focus-sign'];

        ctx.setTransform(1, 0, 0, 1, x + character.w / 2, y + character.h / 2);
        ctx.rotate(-this.focus_frame);
        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, - sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.rotate(this.focus_frame * 2);

        if (Ardent.debugMode) {
            ctx.fillStyle = "#00000055";
            ctx.fillRect(-sign.w / 2, -sign.h / 2, sign.w, sign.h);
        }

        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, - sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.focus_frame += 0.05;

        if (this.focus_frame > Math.PI * 2) {
            this.focus_frame -= Math.PI * 2;
        }
    }

    changeAnimation(animation) {
        if (animation == this.animation) {
            return;
        }

        this.frame = 0;
        this.animation = animation;
    }

    checkBulletCollision() {
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];

            if (this.position.x < bullet.position.x && this.position.y < bullet.position.y) {
                if (this.position.x + this.size.x > bullet.position.x && this.position.y + this.size.y > bullet.position.y) {
                    bullet.speed = new Vector2D();
                    // bullets.splice(i,1);
                }
            }
        }
    }

    checkBoundCollision() {
        if (this.position.x + this.size.x > Player.#boundary_end.x) {
            this.position.x = Player.#boundary_end.x - this.size.x;
        } else if (this.position.x < Player.#boundary_start.x) {
            this.position.x = Player.#boundary_start.x;
        }

        if (this.position.y + this.size.y > Player.#boundary_end.y) {
            this.position.y = Player.#boundary_end.y - this.size.y;
        } else if (this.position.y < Player.#boundary_start.y) {
            this.position.y = Player.#boundary_start.y;
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

function trace_dotted_axis(ctx, dim, lockedAxis, lineSpacing, dashLength) {
    let variableAxis, fixedAxis;

    switch (lockedAxis) {
        case "x":
            fixedAxis = dim.y;
            variableAxis = dim.x;
            break;
        case "y":
            fixedAxis = dim.x;
            variableAxis = dim.y;
            break;
    }

    for (let i = 0; i < fixedAxis; i++) {
        const a = i * lineSpacing;
        for (let j = 0; j < variableAxis * dashLength; j++) {
            const b = j * dashLength;

            if (j % 2 == 0) {
                ctx.fillStyle = "white";
            } else {
                ctx.fillStyle = "black";
            }

            switch (lockedAxis) {
                case "x":
                    ctx.fillRect(b, a, dashLength, 1);
                    break;
                case "y":
                    ctx.fillRect(a, b, 1, dashLength);
                    break;
            }
        }
    }
}

function trace_dotted_frame(ctx, dim, lockedAxis, lineSpacing, dashLength) {
    let variableAxis, fixedAxis;

    switch (lockedAxis) {
        case "x":
            fixedAxis = dim.y;
            variableAxis = dim.x;
            break;
        case "y":
            fixedAxis = dim.x;
            variableAxis = dim.y;
            break;
    }
    for (let i = 0; i < 2; i++) {
        const a = i * fixedAxis * lineSpacing;
        for (let j = 0; j < variableAxis * dashLength; j++) {
            const b = j * dashLength;

            if (j % 2 == 0) {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = "black";
            }

            switch (lockedAxis) {
                case "x":
                    if (i % 2 == 0) {
                        ctx.fillRect(b, a, dashLength, 1);
                    } else {
                        ctx.fillRect(b, a - 1, dashLength, 1);
                    }
                    break;
                case "y":
                    if (i % 2 == 0) {
                        ctx.fillRect(a, b, 1, dashLength);
                    } else {
                        ctx.fillRect(a - 1, b, 1, dashLength);
                    }
                    break;
            }
        }
    }
}

function draw_grid(ctx) {
    if (grid_cache) {
        ctx.drawImage(grid_cache, 0, 0);
        return;
    }

    grid_cache = document.createElement("canvas");
    const grid_size = new Dim2D(40, 30);
    const square_size = 16;
    const dashes_per_square = 4;
    const dash_length = square_size / dashes_per_square;

    grid_cache.width = grid_size.x * square_size;
    grid_cache.height = grid_size.y * square_size;
    const ctx_c = grid_cache.getContext("2d");

    // draw grid lines
    trace_dotted_axis(ctx_c, grid_size, "x", square_size, dash_length);
    trace_dotted_axis(ctx_c, grid_size, "y", square_size, dash_length);

    // draw gold frame
    trace_dotted_frame(ctx_c, grid_size, "x", square_size, dash_length);
    trace_dotted_frame(ctx_c, grid_size, "y", square_size, dash_length);

    ctx.drawImage(grid_cache, 0, 0);
}

function draw_temp_fps(ctx) {
    const fps_number = (1 / fps).toFixed(1);
    const text = `${fps_number}fps`;
    const x = 414;
    const y = 460;

    ctx.font = "16px Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

async function main() {
    const canvas = document.getElementById("game-window");

    game = new Ardent();
    game.setCanvas(canvas);
    game.setResolution(640, 480);
    game.setFPS(60);

    [data, menus] = await loadInitAssets();

    [fonts, hud, characters, projectiles] = await loadAssets();

    const player = new Player(200, 350);
    players.push(player);

    // for (let i = 0; i < 100; i++) {
    //     const bullet = new Bullet(220, 250);
    //     bullets.push(bullet);
    // }

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
