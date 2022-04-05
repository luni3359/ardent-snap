const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

export default function gameRun() {
    requestAnimationFrame(gameRun);
}
