import {
    BoardState,
    WHITE,
    BLACK,
    Point,
    opposingColor
} from "./board_state.js"

class Ai {
    useTimer() {
        return true;
    }

    nextMove(state, color, callback) {
        callback(this.getNextMove(state, color));
    }
}

function randomLegalPoint(state, color) {
    const grid_size = state.grid_size;

    function randomPoint() {
        function random() {
            return Math.floor(Math.random() * grid_size) - (grid_size - 1) / 2;
        }
        return new Point(random(), random(), random());
    }
    while (true) {
        let point = randomPoint(state)
        if (state.moveIsLegal(point, color)) {
            return point;
        }
    }
}

function getScore(state, color) {
    let points = state.getAllPoints();
    let score = 0;

    function scoreAtPoint(point) {
        let score = state.countLiberties(point);
        if (score == 2) {
            score = -100;
        } else if (score == 1) {
            score = -1000;
        } else if (score == 0) {
            score = -Infinity;
        }
        return score;
    }

    for (let point of points) {
        if (state.get(point) == opposingColor(color)) {
            score -= scoreAtPoint(point);
        } else if (state.get(point) == color) {
            score += scoreAtPoint(point);
        }
    }
    return score;
}

export class NaivePlayer extends Ai {
    getNextMove(state, color) {
        return randomLegalPoint(state, color);
    }
}

export class SimplePlayer extends Ai {
    getNextMove(state, color, callback) {
        let best_move = null;
        let best_score = -Infinity;
        let points = state.getAllPoints();
        let current_score = getScore(state, color);
        for (let point of points) {
            if (state.place(point, color)) {
                let score = getScore(state, color);
                state.remove(point);
                if (score > best_score || (score == best_score && Math.random() > .1)) {
                    best_score = score;
                    best_move = point;
                }

                // Quit early for larger grids
                if (state.mode_3d) {
                    if (state.grid_size >= 9 && score > current_score) {
                        return point;
                    }

                    if (state.grid_size > 13) {
                        return point;
                    }
                }
            }
        }

        if (best_move == null) {
            console.log("Passing");
        }
        return best_move;
    }
}
