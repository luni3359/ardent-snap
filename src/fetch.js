import characters from "../static/sprites/characters.png";
import fonts from "../static/sprites/fonts.png";
import hud from "../static/sprites/hud.png";
import menus from "../static/sprites/menus.png";
import projectiles from "../static/sprites/projectiles.png";
import data from "../static/sprites/spriteInfo.json";
import { AssetManager } from "./ardent/assets";


export async function loadAssets() {
    const essentialAssets = [
        { name: "menus", src: menus },
        { name: "data", src: data },
    ];
    const assets = [
        { name: "hud", src: hud },
        { name: "fonts", src: fonts },
        { name: "characters", src: characters },
        { name: "projectiles", src: projectiles },
    ];

    AssetManager.addAssets(assets);
    AssetManager.addEssentialAssets(essentialAssets);
    await AssetManager.loadAssets();
}
