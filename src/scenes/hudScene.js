import { Scene } from "../scenes";

class HudScene extends Scene {
    constructor() {
        this.hudCache = null;
        this.hudTexture = null;
    }

    draw(ctx) {
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
        ctxC.drawImage(this.hudTexture, hudR.x, hudR.y, hudR.w, hudR.h, game.resolution.x - hudR.w, 0, hudR.w, hudR.h);
        // left piece
        ctxC.drawImage(this.hudTexture, hudL.x, hudL.y, hudL.w, hudL.h, 0, 0, hudL.w, hudL.h);
        // top piece
        ctxC.drawImage(this.hudTexture, hudT.x, hudT.y, hudT.w, hudT.h, hudL.w, 0, hudT.w, hudT.h);
        // bottom piece
        ctxC.drawImage(this.hudTexture, hudB.x, hudB.y, hudB.w, hudB.h, hudL.w, game.resolution.y - hudB.h, hudB.w, hudB.h);

        ctx.drawImage(hudCache, 0, 0);
    }
}
