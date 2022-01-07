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

export class GreedyPlayer extends Ai {
    getNextMove(state, color, callback) {
        const points = state.getAllPoints();
        const current_score = getScore(state, color);
        let best_moves = [];
        let best_score = -Infinity;
        for (let point of points) {
            if (state.place(point, color)) {
                let score = getScore(state, color);
                state.remove(point);
                if (score > best_score) {
                    best_score = score;
                    best_moves = [point];
                } else if (score === best_score) {
                    best_moves.push(point);
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

        if (best_moves.length === 0) {
            console.log("Passing");
        }
        return best_moves[Math.floor(Math.random() * best_moves.length)];
    }
}
