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

export class Point {
    constructor(...coordinates) {
        if (coordinates.length < 2) {
            throw new Error("Coordinates not given for Point constructor");
        }

        for (let coord of coordinates) {
            if (typeof(coord) != "number") {
                throw new Error("Coordinate not a number!");
            }
        }

        this.coordinates = coordinates;
    }

    x() {
        return this.coordinates[0] || 0;
    }

    y() {
        return this.coordinates[1] || 0;
    }

    z() {
        return this.coordinates[2] || 0;
    }

    // Return all orthogonally adjacent points 
    getOrthogonalsByDimension(dimension) {
        let orthogonals = [];
        let coordinates = []
        for (let i = 0; i < dimension; i++) {
            coordinates[i] = this.coordinates[i] || 0;
        }
        for (let i = 0; i < dimension; i++) {
            coordinates[i] += 1;
            orthogonals.push(new Point(...coordinates));
            coordinates[i] -= 2;
            orthogonals.push(new Point(...coordinates));
            coordinates[i] += 1;
        }
        if (orthogonals.length != dimension * 2) {
            throw new Error("Something's wrong!");
        }
        return orthogonals;
    }

    get3dOrthogonals() {
        return this.getOrthogonalsByDimension(3);
    }

    get2dOrthogonals() {
        return this.getOrthogonalsByDimension(2);
    }

    // Check if all coordinates are inbetween min and max
    inBounds(min, max) {
        for (const c of this.coordinates) {
            if (c < min || c > max) {
                return false
            }
        }
        return true;
    }

    // Compare two points
    equals(point) {
        for (let i in point.coordinates) {
            if ((this.coordinates[i] || 0) != point.coordinates[i]) {
                return false;
            }
        }
        return true;
    }

    // Hash coordinates to number
    getValue() {
        const exp = MAX_GRID_SIZE + 1;
        let val = 0;
        for (let i in this.coordinates) {
            val += this.coordinates[i] * Math.pow(exp, i);
        }
        return val;
    }
}


export class BoardState {
    constructor(grid_size = DEFAULT_GRID_SIZE, mode_3d = false) {
        this.mode_3d = mode_3d;
        this.grid_size = grid_size;
        this.max = (grid_size - 1) / 2;
        this.min = -this.max

        this.reset();
    }

    reset() {
        this._state = {};
        this.resetLibertyCache();
    }

    resetLibertyCache() {
        this.libcache = {
            [BLACK]: {},
            [WHITE]: {}
        };
    }

    set(point, color) {
        this.guard(point);
        this._state[point.getValue()] = color;
        this.resetLibertyCache();
    }

    remove(point) {
        this.set(point, null);
    }

    get(point) {
        this.guard(point);
        return this._state[point.getValue()];
    }

    getAllPoints() {
        if (this._all_points) {
            return this._all_points;
        }

        let points = [];
        for (let x = this.min; x <= this.max; x++) {
            for (let y = this.min; y <= this.max; y++) {
                if (this.mode_3d) {
                    for (let z = this.min; z <= this.max; z++) {
                        points.push(new Point(x, y, z));
                    }
                } else {
                    points.push(new Point(x, y));
                }
            }
        }
        this._all_points = points;
        return points;
    }

    gameOver() {
        const points = this.getAllPoints()
        for (const point of points) {
            const color = this.get(point);
            if (!color) {
                continue;
            }
            if (this.countLiberties(point) == 0) {
                return color;
            }
        }
        return false;
    }

    guard(point) {
        if (!point.inBounds(this.min, this.max)) {
            throw new Error("Out of bounds");
        }
    }

    getOrthogonals(point) {
        if (this.mode_3d) {
            return point.get3dOrthogonals();
        } else {
            return point.get2dOrthogonals();
        }
    }

    countLiberties(point, color = null) {
        this.guard(point);

        if (color == null) {
            color = this.get(point);
        }

        if (!color) {
            throw new Error("Cannot count non-theoretical liberties on blank pointinate");
        }

        if (this.libcache[color][point.getValue()] != null) {
            return this.libcache[color][point.getValue()];
        }

        let searched = new Set();
        searched.add(point);

        let queue = []
        queue.push(...this.getOrthogonals(point));

        let liberties = 0;

        while (queue.length) {
            const subject = queue.pop();

            let already_searched = false;
            for (let elem of searched) {
                if (subject.equals(elem)) {
                    already_searched = true;
                    break;
                }
            }
            searched.add(subject);
            if (already_searched || !subject.inBounds(this.min, this.max)) {
                continue;
            }

            if (!this.get(subject)) {
                liberties++;
                continue;
            }

            if (this.get(subject) == color) {
                if (this.libcache[color][subject.getValue()] != null) {
                    liberties = this.libcache[color][subject.getValue()];
                    break;
                }
                queue.push(...this.getOrthogonals(subject))
            }
        }

        this.libcache[color][point.getValue()] = liberties;
        return liberties;

    }

    moveIsLegal(point, color) {
        this.guard(point);

        if (this.get(point)) {
            return false;
        }

        let adjacents = this.getOrthogonals(point);
        for (let adjacent of adjacents) {
            if (this.get(point) == opposingColor(color) &&
                countLiberties(point, opposingColor(color)) == 1) {
                return true;
            }
        }

        if (this.countLiberties(point, color) == 0) {
            return false;
        }

        return true;
    }

    place(point, color) {
        this.guard(point);
        if (!this.moveIsLegal(point, color)) {
            return false;
        }
        this.set(point, color);
        return true;
    }
}
