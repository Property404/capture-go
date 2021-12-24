const MAX_GRID_SIZE = 1023;
const DEFAULT_GRID_SIZE = 9;
const DIMENSIONS = 3;

export const WHITE = 1;
export const BLACK = 2;

export function opposingColor(color) {
    if (color == WHITE) {
        return BLACK;
    } else if (color == BLACK) {
        return WHITE
    } else {
        throw new Error("Invalid color!");
    }
}

export class Coordinate {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (typeof(x) != "number" || typeof(y) != "number" || typeof(z) != "number") {
            throw new Error("Not a number!");
        }
    }

    // Return all orthogonally adjacent coordinates 
    getOrthogonals() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return [
            new Coordinate(x - 1, y, z),
            new Coordinate(x, y - 1, z),
            new Coordinate(x, y, z - 1),
            new Coordinate(x + 1, y, z),
            new Coordinate(x, y + 1, z),
            new Coordinate(x, y, z + 1),
        ]
    }

    // Check if all dimensions are inbetween min and max
    inBounds(min, max) {
        for (const d of [this.x, this.y, this.z]) {
            if (d < min || d > max) {
                return false
            }
        }
        return true;
    }

    equals(coord) {
        return this.x == coord.x &&
            this.y == coord.y &&
            this.z == coord.z
    }

    getValue() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const exp = MAX_GRID_SIZE + 1;
        return x + y * exp + z * exp * exp;
    }
}


export class BoardState {
    constructor(grid_size = DEFAULT_GRID_SIZE) {
        this.grid_size = grid_size;
        this.max = (grid_size - 1) / 2;
        this.min = -this.max

        this.reset();
    }

    reset() {
        this._state = {}
        this.taken = {
            BLACK: 0,
            WHITE: 0
        }
    }

    set(coord, color) {
        this.guard(coord);
        this._state[coord.getValue()] = color;
    }

    get(coord) {
        this.guard(coord);
        return this._state[coord.getValue()];
    }

    getAllCoordinates() {
        let coords = [];
        for (let x = this.min; x <= this.max; x++) {
            for (let y = this.min; y <= this.max; y++) {
                for (let z = this.min; z <= this.max; z++) {
                    coords.push(new Coordinate(x, y, z));
                }
            }
        }
        return coords;
    }

    gameOver() {
        const coords = this.getAllCoordinates()
        for (const coord of coords) {
            const color = this.get(coord);
            if (!color) {
                continue;
            }
            if (this.countLiberties(coord) == 0) {
                return color;
            }
        }
        return false;
    }

    guard(coord) {
        if (!coord.inBounds(this.min, this.max)) {
            throw new Error("Out of bounds");
        }
    }

    countLiberties(coord, color = null) {
        this.guard(coord);

        if (color == null) {
            color = this.get(coord);
        }

        if (!color) {
            throw new Error("Cannot count non-theoretical liberties on blank coordinate");
        }

        let searched = new Set();
        searched.add(coord);

        let queue = []
        queue.push(...coord.getOrthogonals());

        let liberties = 0;

        while (queue.length) {
            const subject = queue.pop();
            //console.log(`Searching (${subject.x}, ${subject.y}, ${subject.z})`);

            let already_searched = false;
            for (let elem of searched) {
                if (subject.equals(elem)) {
                    already_searched = true;
                } else {
                    //console.log(`(${subject.x}, ${subject.y}, ${subject.z}) != (${elem.x}, ${elem.y}, ${elem.z})`);
                }
            }
            searched.add(subject);
            if (already_searched) {
                //console.log(`(${subject.x}, ${subject.y}, ${subject.z}) already searched`);
                continue;
            }
            if (!subject.inBounds(this.min, this.max)) {
                //console.log(`(${subject.x}, ${subject.y}, ${subject.z}) out of bounds`);
                continue;
            }
            //console.log("Considering!")

            if (!this.get(subject)) {
                liberties++;
                //console.log(liberties);
                continue;
            } else {
                //console.log(`(${subject.x}, ${subject.y}, ${subject.z}) has color: ${this.get(subject)}`);
            }

            if (this.get(subject) == color) {
                queue.push(...subject.getOrthogonals())
            }
        }

        return liberties;

    }

    moveIsLegal(coord, color) {
        this.guard(coord);

        if (this.get(coord)) {
            return false;
        }

        let adjacents = coord.getOrthogonals();
        for (let adjacent of adjacents) {
            if (this.get(coord) == opposingColor(color) &&
                countLiberties(coord, opposingColor(color)) == 1) {
                return true;
            }
        }

        if (this.countLiberties(coord, color) == 0) {
            return false;
        }

        return true;
    }

    place(coord, color) {
        this.guard(coord);
        if (!this.moveIsLegal(coord, color)) {
            return false;
        }
        this.set(coord, color);
        return true;
    }
}
