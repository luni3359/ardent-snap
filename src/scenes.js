export class SceneManager {
    #currentScene;

    static update(dt) {
        if (this.#currentScene)
            this.#currentScene.update(dt);
    }

    static draw(ctx, dt) {
        if (this.#currentScene)
            this.#currentScene.draw(ctx, dt);
    }

    static loadScene(scene) {
        this.#currentScene = scene;
    }
}

export class Scene {
    #layers = []

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
