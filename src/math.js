export default function Vector2D(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector2D.prototype.magnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector2D.prototype.unit = function () {
    const magnitude = this.magnitude();

    if (!magnitude) {
        return new Vector2D();
    }

    return new Vector2D(this.x / magnitude, this.y / magnitude);
};

Vector2D.prototype.normalize = function () {
    const magnitude = this.magnitude();

    if (!magnitude) {
        this.x = 0;
        this.y = 0;
        return;
    }

    this.x /= magnitude;
    this.y /= magnitude;
};
