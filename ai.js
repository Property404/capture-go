import cloneDeep from "./node_modules/lodash-es/cloneDeep.js";
import {
    BoardState,
    WHITE,
    BLACK,
    Coordinate,
    opposingColor
} from "./board_state.js"

class Ai {
    nextMove(state, color, callback) {
        callback(this.getNextMove(state, color));
    }

}

function randomLegalCoordinate(state, color) {
    const grid_size = state.grid_size;

    function randomCoordinate() {
        function random() {
            return Math.floor(Math.random() * grid_size) - (grid_size - 1) / 2;
        }
        return new Coordinate(random(), random(), random());
    }
    while (true) {
        let coord = randomCoordinate(state)
        if (state.moveIsLegal(coord, color)) {
            return coord;
        }
    }
}

function getScore(state, color) {
    let coords = state.getAllCoordinates();
    let score = 0;
    for (let coord of coords) {
        if (state.get(coord) == opposingColor(color)) {
            score -= state.countLiberties(coord);
        } else if (state.get(coord) == color) {
            score += state.countLiberties(coord);
        }
    }
    return score;
}

export class NaivePlayer extends Ai {
    getNextMove(state, color) {
        return randomLegalCoordinate(state, color);
    }
}

export class SimplePlayer extends Ai {
    getNextMove(state, color, callback) {
        let best_move = null;
        let best_score = -1000;
        let coords = state.getAllCoordinates();
        let current_score = getScore(state, color);
        for (let coord of coords) {
            let the_deep_state = cloneDeep(state);
            if (the_deep_state.place(coord, color)) {
                let score = getScore(the_deep_state, color);
                if (score > best_score) {
                    best_score = score;
                    best_move = coord;
                }

                // Quit early for larger grids
                if (state.grid_size >= 9 && score > current_score) {
                    return coord;
                }

                if (state.grid_size > 13) {
                    return coord;
                }
            }
        }

        if (best_move == null) {
            console.log("Passing");
        }
        return best_move;
    }
}
