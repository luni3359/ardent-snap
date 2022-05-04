import { Ardent } from "./engine";

const keys = {};

class Action {
    static UP = new Action("UP");
    static DOWN = new Action("DOWN");
    static LEFT = new Action("LEFT");
    static RIGHT = new Action("RIGHT");
    static FOCUS = new Action("FOCUS");
    static FIRE = new Action("FIRE");
    static BOMB = new Action("BOMB");

    constructor(name) {
        this.name = name;
    }
}

class ControlScheme {
    constructor() {

    }
}


// class PlayerState {
//     static
// }

class InputManager {

}


window.addEventListener("keydown", e => {
    if (keys[e.code])
        return;

    keys[e.code] = true;

    switch (e.code) {
        case "KeyG":
            e.preventDefault();
            showGrid = !showGrid;
            SaveData.save("displayGrid", showGrid);
            break;
        case "KeyB":
            e.preventDefault();
            Ardent.debugMode = !Ardent.debugMode;
            SaveData.save("debugMode", Ardent.debugMode);
            break;
        case "KeyF":
            e.preventDefault();
            showCounters = !showCounters;
            SaveData.save("displayCounters", showCounters);
            break;
    }
});

window.addEventListener("keyup", e => {
    keys[e.code] = false;
});
