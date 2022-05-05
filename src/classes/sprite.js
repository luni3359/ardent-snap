import { Entity } from "./entity";

export class Sprite extends Entity {
    #name = "";
    #asset = null;
    #cache = null;

    constructor(x, y, w, h) {
        super(x, y, w, h);
    }

    set name(newName) {
        this.#name = newName;
    }

    get name() {
        return this.#name;
    }
}

export class Animation {
    #name = "";

    set name(newName) {
        this.#name = newName;
    }

    get name() {
        return this.#name;
    }
}
