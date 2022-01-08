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
        const point = randomPoint(state)
        if (state.moveIsLegal(point, color)) {
            return point;
        }
    }
}

function getScore(state, color) {
    const MEDIUM_PRIORITY_PENALTY = 100;
    const HIGH_PRIORITY_PENALTY = 1000;
    const CRITICAL_PRIORITY_PENALTY = 1000000000000;

    const points = state.getAllPoints();
    let score = 0;

    for (let point of points) {
        if (state.get(point) == opposingColor(color)) {
            const libs = state.countLiberties(point);

            // Always take the opportunity to capture an opponent.
            if (libs == 0) {
                return Infinity;
            } else if (libs == 1) {
                score += HIGH_PRIORITY_PENALTY;
            } else if (libs == 2) {
                score += MEDIUM_PRIORITY_PENALTY;
            } else {
                score -= libs;
            }
        } else if (state.get(point) == color) {
            const libs = state.countLiberties(point);

            // Having one or less liberties at end of turn is a guaranteed loss
            // against a sane player.
            if (libs <= 1) {
                score -= CRITICAL_PRIORITY_PENALTY;
            } else if (libs == 2) {
                score -= MEDIUM_PRIORITY_PENALTY;
            } else {
                score += libs;
            }
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
