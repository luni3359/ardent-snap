import { Entity } from "./entity";

export class Bullet extends Entity {
    static #boundaryStart = new Dim2D(32, 16);
    static #boundaryEnd = new Dim2D(16 * 24 + 16 * 2, 16 * 28 + 16);
    static #spriteCache = null;
    static #cacheMode = null;

    constructor(x, y) {
        super(x, y);
        this.topspeed = 250;
        this.diameter = 16;
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
            const radius = this.diameter / 2;
            const x = Math.floor(this.position.x - radius);
            const y = Math.floor(this.position.y - radius);

            ctx.drawImage(Bullet.#spriteCache, this.diameter * this.color, 0, this.diameter, this.diameter, x, y, this.diameter, this.diameter);
            return;
        }

        this.buildCache(ctx);
    }

    buildCache(ctx) {
        const numberOfFrames = 16;
        const spriteXOffset = 10;
        const spriteYOffset = 48;
        const size = this.diameter;

        Bullet.#spriteCache = document.createElement("canvas");
        Bullet.#spriteCache.width = size * numberOfFrames;
        Bullet.#spriteCache.height = size;
        Bullet.#cacheMode = Ardent.debugMode;
        const ctxC = Bullet.#spriteCache.getContext("2d");

        for (let i = 0; i < numberOfFrames; i++) {
            const x = this.diameter * i;


            if (Ardent.debugMode) {
                ctxC.fillStyle = "cyan";
                ctxC.fillRect(x, 0, size, size);
            }
            ctxC.drawImage(projectiles, spriteXOffset + x, spriteYOffset, size, size, x, 0, size, size);
        }

        this.draw(ctx);
    }

    checkBoundCollision() {
        let bounced = false;
        const radius = this.diameter / 2;

        if (this.position.x + radius > Bullet.#boundaryEnd.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundaryEnd.x - radius;
        } else if (this.position.x - radius < Bullet.#boundaryStart.x) {
            bounced = true;
            this.speed.x = -this.speed.x;
            this.position.x = Bullet.#boundaryStart.x + radius;
        }

        if (this.position.y + radius > Bullet.#boundaryEnd.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundaryEnd.y - radius;
        } else if (this.position.y - radius < Bullet.#boundaryStart.y) {
            bounced = true;
            this.speed.y = -this.speed.y;
            this.position.y = Bullet.#boundaryStart.y + radius;
        }

        if (bounced) {
            this.speed = new Vector2D(this.speed.x * 1.1, this.speed.y * 1.1);

            if (++this.color >= 16) {
                this.color = 0;
            }
        }
    }
}
