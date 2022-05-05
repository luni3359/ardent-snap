export class SceneManager {
    static #currentScene;

    static update(dt) {
        if (SceneManager.#currentScene)
            SceneManager.#currentScene.update(dt);
    }

    static draw(ctx, dt) {
        if (SceneManager.#currentScene)
            SceneManager.#currentScene.draw(ctx, dt);
    }

    static loadScene(scene) {
        console.log(`Loading "${scene.name}" scene`);
        SceneManager.#currentScene = scene;
    }
}

export class Scene {
    #name = ""; 
    #layers = [];

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
        this.#layers.push(layer);
    }

    set name(newName) {
        this.#name = newName; 
    }

    get name() {
        return this.#name;
    }
}

export class Layer {
    #entityList = []

    update(dt) {
        for (let i = 0; i < this.#entityList.length; i++) {
            const entitySublist = this.#entityList[i];
            for (let j = 0; j < entitySublist; j++) {
                const entity = entitySublist[j];
                entity.update(dt);
            }
        }
    }

    draw(ctx, dt) {
        for (let i = 0; i < this.#entityList.length; i++) {
            const entitySublist = this.#entityList[i];
            for (let j = 0; j < entitySublist; j++) {
                const entity = entitySublist[j];
                entity.draw(ctx, dt);
            }
        }
    }

    pushEntities(entities) {
        this.#entityList.push(entities);
    }
}
