import { isLiteralObject, print } from "./utils";

export class AssetManager {
    static assets = {};

    static #essentialAssets = [];
    static #otherAssets = [];

    static addEssentialAssets(arrayOrDict) {
        AssetManager.#addAssetsGeneric(AssetManager.#essentialAssets, arrayOrDict);
    }

    static addAssets(arrayOrDict) {
        AssetManager.#addAssetsGeneric(AssetManager.#otherAssets, arrayOrDict);
    }

    static async loadAssets() {
        const assets = AssetManager.#essentialAssets.concat(AssetManager.#otherAssets);

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];

            if (!("src" in asset)) {
                // webpack loaded this asset directly as a json object
                print(`Loaded "${asset.name}" asset locally`);
                AssetManager.assets[asset.name] = asset.data;
                continue;
            }

            AssetManager.assets[asset.name] = await AssetManager.#loadImage(asset.src);
        }
    }

    static #addAssetsGeneric(target, object) {
        if (!Array.isArray(object)) {
            object = [object];
        }

        for (const element of object) {
            if (isLiteralObject(element.src)) {
                element.data = element.src;
                delete element.src;
            }
        }

        target.push(...object);
    }

    static #loadImage(url) {
        return new Promise(resolve => {
            const image = new Image();
            image.addEventListener("load", () => {
                print(`Loaded "${url}"`);
                resolve(image);
            });
            image.src = url;
        });
    }
}
