import { Dim2D } from "./math";
import { SceneManager } from "./scenes";
import { print, sleep } from "./utils";


let tps, fps;

export class Ardent {
    static debugMode = false;

    #lastTime = 0;
    #accumulator = 0;
    #timeScale = 1000;
    #ctx = null;

    #alphaEnabled = false;

    #fakeLagTimer = 0;
    #fakeLagEnabled = false;
    #fakeLagDuration = 500;

    constructor() {
        this.canvas = null;
        this.resolution = new Dim2D();
        this.tickRate = 0;
    }

    gameLoop = (currentTime) => {
        requestAnimationFrame(this.gameLoop);
        const dt = (currentTime - this.#lastTime) / this.#timeScale;
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
            if (this.#fakeLagTimer > this.#fakeLagDuration) {
                this.#fakeLagTimer = 0;
                sleep(this.#fakeLagDuration);
                print(`Game stuttered for ${this.#fakeLagDuration}ms`);
            }
        }

        this.draw(this.#ctx, dt);
    };

    update = (dt) => {
        SceneManager.update(dt);
    };

    draw = (ctx, dt) => {
        SceneManager.draw(ctx, dt);
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
