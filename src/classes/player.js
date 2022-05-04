import { Dim2D } from "../ardent/math";
import { Entity } from "./entity";

export class Player extends Entity {
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

    draw(ctx, dt) {
        this.drawAnimation(ctx, dt);
    }

    drawAnimation(ctx, dt) {
        const char = data['character'][this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const frameI = Math.floor(this.frame);

        if (Ardent.debugMode) {
            if (frameI == 0)
                ctx.fillStyle = "cyan";
            else
                ctx.fillStyle = "blue";
            ctx.fillRect(x, y, char.w, char.h);
        }

        ctx.drawImage(characters, char.x + char.w * frameI, char.y, char.w, char.h, x, y, char.w, char.h);

        // changes 12 times a second
        this.frame += 12 * dt;

        if (this.frame >= 8) {
            if (this.animation == "idle") {
                this.frame -= 8;
            } else {
                this.frame = 3;
            }
        }
    }

    drawFocusSign(ctx, dt) {
        const character = data['character'][this.character][this.animation || "idle"];
        const x = Math.floor(this.position.x);
        const y = Math.floor(this.position.y);
        const sign = data['focus-sign'];

        ctx.setTransform(1, 0, 0, 1, x + character.w / 2, y + character.h / 2);
        ctx.rotate(-this.focusFrame);
        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, -sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.rotate(this.focusFrame * 2);

        if (Ardent.debugMode) {
            ctx.fillStyle = "#00000055";
            ctx.fillRect(-sign.w / 2, -sign.h / 2, sign.w, sign.h);
        }

        ctx.drawImage(projectiles, sign.x, sign.y, sign.w, sign.h, -sign.w / 2, -sign.h / 2, sign.w, sign.h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.focusFrame += 6 * dt;

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
                if (this.position.x + this.scale.x > bullet.position.x && this.position.y + this.scale.y > bullet.position.y) {
                    bullet.speed = new Vector2D();
                    // bullets.splice(i,1);
                }
            }
        }
    }

    checkBoundCollision() {
        if (this.position.x + this.scale.x > Player.#boundaryEnd.x) {
            this.position.x = Player.#boundaryEnd.x - this.scale.x;
        } else if (this.position.x < Player.#boundaryStart.x) {
            this.position.x = Player.#boundaryStart.x;
        }

        if (this.position.y + this.scale.y > Player.#boundaryEnd.y) {
            this.position.y = Player.#boundaryEnd.y - this.scale.y;
        } else if (this.position.y < Player.#boundaryStart.y) {
            this.position.y = Player.#boundaryStart.y;
        }
    }
}
