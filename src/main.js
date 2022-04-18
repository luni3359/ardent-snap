import Vector2D from "./math";

const keys = {};
let players = [];
let bullets = [];
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

function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => {
            print(`Loaded "${url}"`);
            resolve(image);
        });
        image.src = url;
    });
}

async function loadAssets() {
    return await Promise.all([
        await loadImage("https://www.spriters-resource.com/resources/sheets/142/145503.png?updated=1608620689")
    ]);
}

function GameCanvas(canvas) {
    this._canvas = canvas || null;
    this._resolution = new Vector2D(640, 480);
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

function Entity(x, y, w, h) {
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(w, h);
}

Entity.prototype.draw = function () {
    ctx.fillStyle = "black";
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
};

function Bullet(x, y) {
    Entity.call(this, x, y);
    this.topspeed = 500;
    this.radius = 8;
    this.speed = new Vector2D(Math.random() * this.topspeed - this.topspeed / 2, Math.random() * this.topspeed - this.topspeed / 2);

}
Bullet.prototype = Object.create(Entity.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function (dt) {
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
};

Bullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "magenta";
    ctx.fill();
};

function Player(x, y, w, h) {
    Entity.call(this);
    this.position = new Vector2D(x, y);
    this.size = new Vector2D(w || 40, h || 60);
    this.speed = 200;
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

Player.prototype.draw = function () {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
};

function update(dt) {
    for (let i = 0; i < players.length; i++) {
        players[i].update(dt);
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update(dt);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas._resolution.x, canvas._resolution.y);
    ctx.drawImage(background, 0, 0, canvas._resolution.x, canvas._resolution.y, 0, 0, canvas._resolution.x, canvas._resolution.y);

    for (let i = 0; i < players.length; i++) {
        players[i].draw();
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw();
    }
}

let background;

const STEP = 1 / 60;
let last_time = performance.now();
let accumulator = 0;
// let simulate_lag_timer = 0;
function gameLoop(current_time) {
    requestAnimationFrame(gameLoop);
    let dt = Math.min((current_time - last_time) / 1000, 0.1);
    last_time = current_time;

    accumulator += dt;

    while (accumulator >= STEP) {
        update(STEP);
        accumulator -= STEP;
    }

    // simulate_lag_timer++;
    // if (simulate_lag_timer > 500) {
    //     simulate_lag_timer = 0;
    //     sleep(500);
    //     print("whoops");
    // }

    draw();
}

async function main() {
    canvas = new GameCanvas(document.getElementById("game-window"));
    ctx = canvas._canvas.getContext("2d");

    [background] = await loadAssets();
    print(toType(background))
    let player = new Player(canvas._canvas.width / 2, canvas._canvas.height / 2);
    players.push(player);

    for (let i = 0; i < 5; i++) {
        bullets.push(new Bullet(Math.random() * 300, Math.random() * 300));
    }

    gameLoop(performance.now());
}

// Determines the true type of a variable
const toType = (param) => {
    if (param === NaN) return 'NaN';
    else return Object.prototype.toString.call(param).replace('[object ', '').slice(0, -1).toLowerCase();
}

window.addEventListener("keydown", e => {
    keys[e.keyCode] = true;
});

window.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

window.addEventListener("load", () => { main(); });
