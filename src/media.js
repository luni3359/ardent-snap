import characters from "./assets/sprites/characters.png";
import fonts from "./assets/sprites/fonts.png";
import hud from "./assets/sprites/hud.png";
import menus from "./assets/sprites/menus.png";
import projectiles from "./assets/sprites/projectiles.png";
import data from "./assets/sprites/spriteInfo.json";
import { print } from "./utils";

export function loadImage(url) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener("load", () => {
            print(`Loaded "${url}"`);
            resolve(image);
        });
        image.src = url;
    });
}

export async function loadInitAssets() {
    return [data, await loadImage(menus)];
}

export async function loadAssets() {
    return await Promise.all([
        await loadImage(fonts),
        await loadImage(hud),
        await loadImage(characters),
        await loadImage(projectiles)
    ]);
}
