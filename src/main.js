import { Dim2D, Vector2D } from "./math";
import { loadAssets, loadInitAssets } from "./media";
import { SaveData } from "./storage";
import { print, sleep } from "./utils";

let dpi = window.devicePixelRatio;
let fps, tps = 0;

const keys = {};
let players = [];
let bullets = [];

let gridCache = null;
let hudCache = null;

let game, cursor, showGrid, showCounters;
let data, menus, fonts, hud, characters, projectiles;

class Ardent {
    static debugMode = false;

    #lastTime = 0;
    #accumulator = 0;
    #ctx = null;

    #alphaEnabled = false;

    #fakeLagTimer = 0;
    #fakeLagEnabled = false;

    constructor() {
        this.canvas = null;
        this.resolution = new Dim2D();
        this.tickRate = 0;
    }

    gameLoop = (currentTime) => {
        requestAnimationFrame(this.gameLoop);
        const dt = (currentTime - this.#lastTime) / 1000;
        this.#lastTime = currentTime;
        tps = Math.max(dt, this.tickRate);
        fps = dt;

        this.#accumulator += Math.min(dt, 0.1);

        while (this.#accumulator >= this.tickRate) {
            this.#accumulator -= this.tickRate;
            this.update(this.tickRate);
        }

        if (this.#fakeLagEnabled) {
            this.#fakeLagTimer++;
            if (this.#fakeLagTimer > 500) {
                this.#fakeLagTimer = 0;
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

        drawLoadingScreen(ctx);

        ctx.fillStyle = "#555";
        ctx.fillRect(32, 16, 16 * 24, 16 * 28);

        // Enemies.draw()

        for (let i = 0; i < players.length; i++) {
            players[i].draw(ctx);
        }

        for (let i = 0; i < bullets.length; i++) {
            bullets[i].draw(ctx);
        }

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (player.isFocused) {
                player.drawFocusSign(ctx);
            }
        }

        drawHud(ctx);

        if (showGrid)
            drawGrid(ctx);

        if (showCounters)
            drawCounters(ctx);

        if (Ardent.debugMode)
            drawMouse(ctx);
    };

    play() {
        const currentTime = performance.now();
        this.#ctx = this.canvas.getContext("2d", { alpha: this.#alphaEnabled });
        this.#lastTime = currentTime;
        this.gameLoop(currentTime);
    }

    setTickRate(n) {
        this.tickRate = 1 / n;
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

    // Enable this if you want to display what's through the canvas
    enableAlpha(bool) {
        this.#alphaEnabled = bool;
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
    static #boundaryStart = new Dim2D(32, 16);
    static #boundaryEnd = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);
    static #spriteCache = null;
    static #cacheMode = null;

    constructor(x, y) {
        super(x, y);
        this.topspeed = 250;
        this.radius = 8;
        this.color = 0;

        const randomDirection = new Vector2D(Math.random() - 0.5, Math.random() - 0.5).unit();
        this.speed = randomDirection.multiply(new Vector2D(this.topspeed * Math.random(), this.topspeed * Math.random()));
    }

    update(dt) {
        this.position.x += this.speed.x * dt;
        this.position.y += this.speed.y * dt;

        this.checkBoundCollision();
    }

    draw(ctx) {
        if (Bullet.#spriteCache && Bullet.#cacheMode != null && Bullet.#cacheMode == Ardent.debugMode) {
            const size = this.radius * 2;
            const x = Math.floor(this.position.x - this.radius);
            const y = Math.floor(this.position.y - this.radius);

            ctx.drawImage(Bullet.#spriteCache[this.color], x, y, size, size);
            return;
        }

        this.buildCache(ctx);
    }

    buildCache(ctx) {
        const x = this.radius;
        const y = this.radius;
        const size = this.radius * 2;

        Bullet.#spriteCache = [];
        Bullet.#cacheMode = Ardent.debugMode;

        for (let i = 0; i < 16; i++) {
            const spriteCache = document.createElement("canvas");
            spriteCache.width = size;
            spriteCache.height = size;
            const ctxC = spriteCache.getContext("2d");

            if (Ardent.debugMode) {
                ctxC.fillStyle = "cyan";
                ctxC.fillRect(-x, -y, size * 2 * 2, size * 2 * 2);
            }

            ctxC.drawImage(projectiles, 10 + size * i, 48, size, size, Math.floor(x - size / 2), Math.floor(y - size / 2), size, size);
            Bullet.#spriteCache.push(spriteCache);
        }

        ctx.drawImage(Bullet.#spriteCache[this.color], Math.floor(this.position.x - this.radius), Math.floor(this.position.y - this.radius), size, size);
    }

    checkBoundCollision() {
        let bounced = false;

        if (this.position.x + this.radius > Bullet.#boundaryEnd.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundaryEnd.x - this.radius;
        } else if (this.position.x - this.radius < Bullet.#boundaryStart.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundaryStart.x + this.radius;
        }

        if (this.position.y + this.radius > Bullet.#boundaryEnd.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundaryEnd.y - this.radius;
        } else if (this.position.y - this.radius < Bullet.#boundaryStart.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundaryStart.y + this.radius;
        }

        if (bounced) {
            this.speed = new Vector2D(this.speed.x * 1.1, this.speed.y * 1.1);

            if (++this.color >= 16) {
                this.color = 0;
            }
        }
    }
}

class Player extends Entity {
    static #boundaryStart = new Dim2D(32, 16);
    static #boundaryEnd = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);

    constructor(x, y, w, h) {
        super(x, y, w || 32, h || 48);
        this.character = "reimu";
        this.speed = 255;

        this.animation = "idle";
        this.frame = 0;

        this.isFocused = false;
        this.focusFrame = 0;
    }

    update(dt) {
        const direction = new Vector2D();
        let focusModifier = 1;

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
            focusModifier = 0.5;
        } else {
            this.isFocused = false;
        }

        direction.normalize();

        this.position.x += this.speed * focusModifier * direction.x * dt;
        this.position.y += this.speed * focusModifier * direction.y * dt;

        this.checkBulletCollision();
        this.checkBoundCollision();
    }

    draw(ctx) {
        this.drawAnimation(ctx);

        // if (this.isFocused) {
        //     this.drawFocusSign(ctx);
        // }
    }

    drawAnimation(ctx) {
        const character = data['character'][this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const frameI = Math.floor(this.frame);

        if (Ardent.debugMode) {
            if (frameI == 0)
                ctx.fillStyle = "cyan";
            else
                ctx.fillStyle = "blue";
            ctx.fillRect(x, y, character.w, character.h);
        }

        ctx.drawImage(characters, character.x + character.w * frameI, character.y, character.w, character.h, x, y, character.w, character.h);

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
        const character = data['character'][this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const sign = data['focus-sign'];

        ctx.setTransform(1, 0, 0, 1, x + character.w / 2, y + character.h / 2);
        ctx.rotate(-this.focusFrame);
        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, - sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.rotate(this.focusFrame * 2);

        if (Ardent.debugMode) {
            ctx.fillStyle = "#00000055";
            ctx.fillRect(-sign.w / 2, -sign.h / 2, sign.w, sign.h);
        }

        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, - sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.focusFrame += 0.05;

        if (this.focusFrame > Math.PI * 2) {
            this.focusFrame -= Math.PI * 2;
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
        if (this.position.x + this.size.x > Player.#boundaryEnd.x) {
            this.position.x = Player.#boundaryEnd.x - this.size.x;
        } else if (this.position.x < Player.#boundaryStart.x) {
            this.position.x = Player.#boundaryStart.x;
        }

        if (this.position.y + this.size.y > Player.#boundaryEnd.y) {
            this.position.y = Player.#boundaryEnd.y - this.size.y;
        } else if (this.position.y < Player.#boundaryStart.y) {
            this.position.y = Player.#boundaryStart.y;
        }
    }
}

function drawLoadingScreen(ctx) {
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

function drawHud(ctx) {
    if (hudCache) {
        ctx.drawImage(hudCache, 0, 0);
        return;
    }

    hudCache = document.createElement("canvas");
    hudCache.width = game.canvas.width;
    hudCache.height = game.canvas.height;

    const hudR = data['hud-background-right'];
    const hudL = data['hud-background-left'];
    const hudT = data['hud-background-top'];
    const hudB = data['hud-background-bottom'];
    const ctxC = hudCache.getContext("2d");

    // right piece
    ctxC.drawImage(hud, hudR.x, hudR.y, hudR.w, hudR.h, game.resolution.x - hudR.w, 0, hudR.w, hudR.h);
    // left piece
    ctxC.drawImage(hud, hudL.x, hudL.y, hudL.w, hudL.h, 0, 0, hudL.w, hudL.h);
    // top piece
    ctxC.drawImage(hud, hudT.x, hudT.y, hudT.w, hudT.h, hudL.w, 0, hudT.w, hudT.h);
    // bottom piece
    ctxC.drawImage(hud, hudB.x, hudB.y, hudB.w, hudB.h, hudL.w, game.resolution.y - hudB.h, hudB.w, hudB.h);

    ctx.drawImage(hudCache, 0, 0);
}

function traceDottedAxis(ctx, dim, lockedAxis, lineSpacing, dashLength) {
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

function traceDottedFrame(ctx, dim, lockedAxis, lineSpacing, dashLength) {
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

function drawGrid(ctx) {
    if (gridCache) {
        ctx.drawImage(gridCache, 0, 0);
        return;
    }

    gridCache = document.createElement("canvas");
    const gridSize = new Dim2D(40, 30);
    const squareSize = 16;
    const dashesPerSquare = 4;
    const dashLength = squareSize / dashesPerSquare;

    gridCache.width = gridSize.x * squareSize;
    gridCache.height = gridSize.y * squareSize;
    const ctxC = gridCache.getContext("2d");

    // draw grid lines
    traceDottedAxis(ctxC, gridSize, "x", squareSize, dashLength);
    traceDottedAxis(ctxC, gridSize, "y", squareSize, dashLength);

    // draw gold frame
    traceDottedFrame(ctxC, gridSize, "x", squareSize, dashLength);
    traceDottedFrame(ctxC, gridSize, "y", squareSize, dashLength);

    ctx.drawImage(gridCache, 0, 0);
}

function drawCounters(ctx) {
    const tpsNumber = (1 / tps).toFixed(1);
    const fpsNumber = (1 / fps).toFixed(1);
    const tpsLabel = `${tpsNumber}tps`;
    const fpsLabel = `${fpsNumber}fps`;
    const x = 415;
    const y = 460;
    const fontSize = 12;

    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(tpsLabel, x, y - fontSize);
    ctx.fillText(tpsLabel, x, y - fontSize);
    ctx.strokeText(fpsLabel, x, y);
    ctx.fillText(fpsLabel, x, y);
}

function drawMouse(ctx) {
    const boxSize = 20;
    const x = Math.floor(cursor.x - boxSize);
    const y = Math.floor(cursor.y - boxSize);

    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, boxSize, boxSize);
}

async function main() {
    const canvas = document.getElementById("game-window");
    cursor = new Dim2D(0, 0);

    canvas.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        cursor.x = (e.clientX - rect.left) * scaleX;
        cursor.y = (e.clientY - rect.top) * scaleY;
    });

    game = new Ardent();
    game.setCanvas(canvas);
    game.setResolution(640, 480);
    game.setTickRate(60);

    showCounters = SaveData.load("displayCounters", true);
    showGrid = SaveData.load("displayGrid", false);
    Ardent.debugMode = SaveData.load("debugMode", false);

    [data, menus] = await loadInitAssets();

    [fonts, hud, characters, projectiles] = await loadAssets();

    const player = new Player(200, 350);
    players.push(player);

    for (let i = 0; i < 100; i++) {
        const bullet = new Bullet(220, 250);
        bullets.push(bullet);
    }

    game.play();
}


window.addEventListener("keydown", e => {
    if (keys[e.code])
        return;

    keys[e.code] = true;

    switch (e.code) {
        case "KeyG":
            e.preventDefault();
            showGrid = !showGrid;
            SaveData.save("displayGrid", showGrid);
            break;
        case "KeyB":
            e.preventDefault();
            Ardent.debugMode = !Ardent.debugMode;
            SaveData.save("debugMode", Ardent.debugMode);
            break;
        case "KeyF":
            e.preventDefault();
            showCounters = !showCounters;
            SaveData.save("displayCounters", showCounters);
            break;
    }
});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});

window.addEventListener("resize", e => {
    // dpi = window.devicePixelRatio;
    // ctx.scale(dpi, dpi);
})

window.addEventListener("load", () => { main(); });
