import data from "../static/sprites/spriteInfo.json";
import { AssetManager } from "./ardent/assets";
// import menuMusic from "../static/music/01. Sealed Gods.mp3";


export async function loadAssets() {
    const essentialAssets = [
        { name: "data", src: data },
        { name: "menus", src: new URL("../static/sprites/menus.png", import.meta.url) },
    ];
    const assets = [
        { name: "hud", src: new URL("../static/sprites/hud.png", import.meta.url) },
        { name: "fonts", src: new URL("../static/sprites/fonts.png", import.meta.url) },
        { name: "characters", src: new URL("../static/sprites/characters.png", import.meta.url) },
        { name: "projectiles", src: new URL("../static/sprites/projectiles.png", import.meta.url) },
    ];

    AssetManager.addAssets(assets);
    AssetManager.addEssentialAssets(essentialAssets);
    await AssetManager.loadAssets();
}
