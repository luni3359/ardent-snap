import { Layer, Scene, SceneManager } from "../ardent/scenes";
import { Player } from "../classes/player";


export class TestScene extends Scene {
    #players = [];
    #bullets = [];

    constructor() {
        super()
        this.#players.push(new Player(200, 350));

        for (let i = 0; i < 100; i++) {
            const bullet = new Bullet(220, 250);
            this.#bullets.push(bullet);
        }

        const playersLayer = new Layer();
        playersLayer.pushEntities(this.#players);

        const bulletsLayer = new Layer();
        bulletsLayer.pushEntities(this.#bullets);

        const scene = new Scene();
        scene.addLayer(playersLayer);
        scene.addLayer(bulletsLayer);
        SceneManager.loadScene(scene);
    }
}
