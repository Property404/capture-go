import {
    Point
} from "./board_state.js";
import {
    BUFFER,
    BOARD_WIDTH,
    BOARD_HEIGHT,
} from "./constants.js";

function inDelta(value) {
    const diff = Math.abs(value % 1);
    return diff < .3 || diff > .7;
}

function absoluteToCanvas(canvas, absolute_x, absolute_y) {
    const bbox = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bbox.width;
    const scaleY = canvas.height / bbox.height;
    return [(absolute_x - bbox.left) * scaleX, (absolute_y - bbox.top) * scaleY];
}

export default class Human {
    #game;

    constructor(game) {
        this.#game = game;
    }

    useTimer() {
        return false;
    }

    // Translate canvas points to grid points
    #revTranslate(x, y) {
        x -= BUFFER;
        y -= BUFFER;
        x = (x * (this.#game.grid_size - 1)) / BOARD_WIDTH;
        y = (y * (this.#game.grid_size - 1)) / BOARD_HEIGHT;
        x -= this.#game.highest_index;
        y -= this.#game.highest_index;
        return [x, y]
    }

    #getPointOnCanvas(canvas, x, y, z) {
        [x, y] = this.#revTranslate(
            ...absoluteToCanvas(canvas, x, y)
        )

        if (inDelta(x) && inDelta(y)) {
            x = Math.round(x);
            y = Math.round(y);

            const offset = (this.#game.num_planes - 1) / 2
            const point = new Point(x, y, z - offset);
            return point;
        }
        return null;
    }

    #setCanvasesClickable(yes, state, color, callback) {
        const canvases = this.#game.canvases;
        for (let i = 0; i < this.#game.num_planes; i++) {
            if (yes) {
                canvases[i].onclick = (e) => {
                    const point = this.#getPointOnCanvas(e.target, e.clientX, e.clientY, i);
                    if (point && state.moveIsLegal(point, color)) {
                        callback(point);
                    }
                }
                canvases[i].onmousemove = (e) => {
                    const point = this.#getPointOnCanvas(e.target, e.clientX, e.clientY, i);
                    if (point && state.moveIsLegal(point, color)) {
                        document.body.style.cursor = "pointer";
                    } else {
                        document.body.style.cursor = "default";
                    }
                }
            } else {
                canvases[i].onclick = null;
            }
        }
    }

    nextMove(state, color, callback) {
        this.#setCanvasesClickable(true, state, color, (move) => {
            this.#setCanvasesClickable(false, state);
            callback(move);
        });
    }
}
