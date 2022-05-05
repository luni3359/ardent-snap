import { print } from "./utils";

export class SceneManager {
    static #activeScenes = [];

    static update(dt) {
        for (let i = 0; i < SceneManager.#activeScenes.length; i++) {
            const scene = SceneManager.#activeScenes[i];
            scene.update(dt);
        }
    }

    static draw(ctx, dt) {
        for (let i = 0; i < SceneManager.#activeScenes.length; i++) {
            const scene = SceneManager.#activeScenes[i];
            scene.draw(ctx, dt);
        }
    }

    static loadScene(scene) {
        print(`Loading "${scene.name}" scene`);
        SceneManager.#activeScenes.push(scene);
    }
}

export class Scene {
    #name = "";
    #layers = [];

    constructor(name) {
        this.name = name;
    }

    set name(newName) {
        this.#name = newName;
    }

    get name() {
        return this.#name;
    }

    update(dt) {
        for (let i = 0; i < this.#layers.length; i++) {
            const layer = this.#layers[i];
            layer.update(dt);
        }
    }

    draw(ctx, dt) {
        for (let i = 0; i < this.#layers.length; i++) {
            const layer = this.#layers[i];
            layer.draw(ctx, dt);
        }
    }

    addLayer(layer) {
        if (!layer)
            throw Error("Cannot add undefined layer");

        this.#layers.push(layer);
    }
}

export class Layer {
    #entityList = [];

    update(dt) {
        for (let i = 0; i < this.#entityList.length; i++) {
            const entitySublist = this.#entityList[i];
            for (let j = 0; j < entitySublist.length; j++) {
                const entity = entitySublist[j];
                entity.update(dt);
            }
        }
    }

    draw(ctx, dt) {
        for (let i = 0; i < this.#entityList.length; i++) {
            const entitySublist = this.#entityList[i];
            for (let j = 0; j < entitySublist.length; j++) {
                const entity = entitySublist[j];
                entity.draw(ctx, dt);
            }
        }
    }

    pushEntities(entities) {
        this.#entityList.push(entities);
    }
}
