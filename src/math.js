export default class Vector2D {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    unit() {
        const magnitude = this.magnitude();

        if (!magnitude) {
            return new Vector2D();
        }

        return new Vector2D(this.x / magnitude, this.y / magnitude);
    }

    normalize() {
        const magnitude = this.magnitude();

        if (!magnitude) {
            this.x = 0;
            this.y = 0;
            return;
        }

        this.x /= magnitude;
        this.y /= magnitude;
    }
}
