export class Entity {
    constructor(x, y, w, h) {
        this.position = new Vector2D(x || 0, y || 0);
        this.rotation = new Vector2D(x || 0, y || 0);
        this.scale = new Dim2D(w || 1, h || 1);
    }

    update(dt) { }

    draw(ctx, dt) { }
}
