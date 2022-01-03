import {
    Coordinate
} from "./board_state.js";
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CHECKER_RADIUS,
    BUFFER,
    BOARD_WIDTH,
    BOARD_HEIGHT,
} from "./constants.js";
// Translate canvas coordinates to grid coordinates

function inDelta(value) {
    const diff = Math.abs(value % 1);
    return diff < .3 || diff > .7;
}

function absoluteToCanvas(canvas, absolute_x, absolute_y) {
    const bbox = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bbox.width;
    const scaleY = canvas.height / bbox.height;
    let [x, y] = [(absolute_x - bbox.left) * scaleX, (absolute_y - bbox.top) * scaleY];
    return [x, y];
}

export default class Human {
    constructor(game) {
        this.game = game;
    }

    revTranslate(x, y) {
        x -= BUFFER;
        y -= BUFFER;
        x = (x * (this.game.grid_size - 1)) / BOARD_WIDTH;
        y = (y * (this.game.grid_size - 1)) / BOARD_HEIGHT;
        x -= this.game.highest_index;
        y -= this.game.highest_index;
        return [x, y]
    }

    setCanvasesClickable(yes, state, color, callback) {
        const canvases = this.game.canvases;
        for (let i = 0; i < state.grid_size; i++) {
            if (yes) {
                canvases[i].onclick = (e) => {
                    const [_x, _y] = absoluteToCanvas(e.target, e.clientX, e.clientY)
                    let [x, y] = this.revTranslate(_x, _y)

                    if (inDelta(x) && inDelta(y)) {
                        x = Math.round(x);
                        y = Math.round(y);

                        // Rotate for portrait
                        if (window.innerHeight > window.innerWidth) {
                            const t = x;
                            x = y
                            y = -t;
                        }
                        const offset = (state.grid_size - 1) / 2
                        const coord = new Coordinate(x, y, i - offset);

                        if (state.moveIsLegal(coord, color)) {
                            callback(coord);
                        }
                    }
                }
            } else {
                canvases[i].onclick = null;
            }
        }
    }

    nextMove(state, color, callback) {
        this.setCanvasesClickable(true, state, color, (move) => {
            this.setCanvasesClickable(false, state);
            callback(move);
        });
    }
}
