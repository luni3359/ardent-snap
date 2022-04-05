/**
 * @class
 * @param {HTMLCanvasElement} canvas
 * @prop {HTMLCanvasElement} _canvas
 */
export default function GameCanvas(canvas) {
    this._canvas = canvas || document.createElement("canvas");
    this._resolution = [640, 720];
    this.setResolution();
}

/**
 *
 * @param {Number} w
 * @param {Number} h
 */
GameCanvas.prototype.setResolution = function (w, h) {
    if (w) {
        this._resolution[0] = w;
    }

    if (h) {
        this._resolution[1] = h;
    }

    this._canvas.style.width = `${this._resolution[0]}px`;
    this._canvas.style.height = `${this._resolution[1]}px`;
};
