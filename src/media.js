import menus from "./assets/sprites/menus.png";
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
    return [await loadImage(menus)];
}

export async function loadAssets() {
    return await Promise.all([
        await loadImage("https://www.spriters-resource.com/resources/sheets/142/145503.png?updated=1608620689")
    ]);
}
