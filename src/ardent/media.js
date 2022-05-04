import characters from "../../static/sprites/characters.png";
import fonts from "../../static/sprites/fonts.png";
import hud from "../../static/sprites/hud.png";
import menus from "../../static/sprites/menus.png";
import projectiles from "../../static/sprites/projectiles.png";
import data from "../../static/sprites/spriteInfo.json";
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

class AssetManager {
    #essentialAssets = [];
    #otherAssets = [];

    addEssentialAssets(arrayOrDict) {
        if (typeof arrayOrDict == "array") {
            arrayOrDict = [arrayOrDict];
        }

        this.#essentialAssets.push(arrayOrDict);
    }

    addAssets(arrayOrDict) {
        if (typeof arrayOrDict == "array") {
            arrayOrDict = [arrayOrDict];
        }

        this.#otherAssets.push(arrayOrDict);
    }

    loadAssets() {
        const assets = this.#essentialAssets + this.#otherAssets

        for (let i = 0; i < assets.length; i++) {
            const dictionary = assets[i];
            for (key of dictionary) {

            }
        }
    }
}
