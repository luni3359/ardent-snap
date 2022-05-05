import { Layer, Scene } from "../ardent/scenes";
import { Bullet } from "../classes/bullet";
import { Player } from "../classes/player";

export class TestScene extends Scene {
    #players = [];
    #bullets = [];

    constructor() {
        super("Testing");

        this.#players.push(new Player(200, 350));

        for (let i = 0; i < 100; i++) {
            const bullet = new Bullet(220, 250);
            this.#bullets.push(bullet);
        }

        // const backgroundLayer = new Layer();
        // backgroundLayer.pushEntities();

        const playersLayer = new Layer();
        playersLayer.pushEntities(this.#players);

        const bulletsLayer = new Layer();
        bulletsLayer.pushEntities(this.#bullets);

        // this.addLayer(backgroundLayer);
        this.addLayer(playersLayer);
        this.addLayer(bulletsLayer);
    }
}
