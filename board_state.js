const MAX_GRID_SIZE = 32;
const DEFAULT_GRID_SIZE = 9;

export const WHITE = 1;
export const BLACK = 2;

export function opposingColor(color) {
    if (color === WHITE) {
        return BLACK;
    } else if (color === BLACK) {
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
            if (typeof(coord) !== "number") {
                throw new Error("Coordinate not a number!");
            }
        }

        this.coordinates = coordinates;
    }

    x() {
        return this.coordinates[0];
    }

    y() {
        return this.coordinates[1];
    }

    z() {
        return this.coordinates[2] ?? 0;
    }

    get3dOrthogonals() {
        return [
            new Point(this.coordinates[0] - 1, this.coordinates[1], this.coordinates[2]),
            new Point(this.coordinates[0] + 1, this.coordinates[1], this.coordinates[2]),
            new Point(this.coordinates[0], this.coordinates[1] - 1, this.coordinates[2]),
            new Point(this.coordinates[0], this.coordinates[1] + 1, this.coordinates[2]),
            new Point(this.coordinates[0], this.coordinates[1], this.coordinates[2] - 1),
            new Point(this.coordinates[0], this.coordinates[1], this.coordinates[2] + 1)
        ]
    }

    get2dOrthogonals() {
        return [
            new Point(this.coordinates[0] - 1, this.coordinates[1], 0),
            new Point(this.coordinates[0] + 1, this.coordinates[1], 0),
            new Point(this.coordinates[0], this.coordinates[1] - 1, 0),
            new Point(this.coordinates[0], this.coordinates[1] + 1, 0),
        ]
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

    // Hash coordinates to number
    getValue() {
        let val = 0;
        for (const i in this.coordinates) {
            val += this.coordinates[i] * Math.pow(MAX_GRID_SIZE, i);
        }
        return val;
    }
}


export class BoardState {
    #state;
    #mode_3d;
    #max;
    #min;
    #next_group_id;
    #group_liberty_map;
    #point_group_map;

    constructor(grid_size = DEFAULT_GRID_SIZE, mode_3d = false) {
        this.#mode_3d = mode_3d;
        this.#max = (grid_size - 1) / 2;
        this.#min = -this.#max
        this.grid_size = grid_size;

        this.reset();
    }

    reset() {
        this.#state = {};
        this.#resetLibertyCache();
    }

    #resetLibertyCache() {
        this.#next_group_id = 1;
        this.#group_liberty_map = {};
        this.#point_group_map = {};

        this.#countGroups();
    }

    #set(point, color) {
        this.#guard(point);
        this.#state[point.getValue()] = color;

        for (const adjacent of this.#getOrthogonals(point)) {
            if (this.get(adjacent)) {
                this.#resetLibertyCache();
                return;
            }
        }
        this.#countGroups();
    }

    remove(point) {
        this.#set(point, null);
    }

    get(point) {
        this.#guard(point);
        return this.#state[point.getValue()];
    }

    getGroupLiberties() {
        return this.#group_liberty_map;
    }

    getAllPoints() {
        if (this._all_points) {
            return this._all_points;
        }

        const points = [];
        for (let x = this.#min; x <= this.#max; x++) {
            for (let y = this.#min; y <= this.#max; y++) {
                if (this.#mode_3d) {
                    for (let z = this.#min; z <= this.#max; z++) {
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
            if (this.countLiberties(point) === 0) {
                return color;
            }
        }
        return false;
    }

    #guard(point) {
        if (!point.inBounds(this.#min, this.#max)) {
            throw new Error("Out of bounds");
        }
    }

    #getOrthogonals(point) {
        let orthogonals;
        if (this.#mode_3d) {
            orthogonals = point.get3dOrthogonals();
        } else {
            orthogonals = point.get2dOrthogonals();
        }
        return orthogonals.filter((x) => x.inBounds(this.#min, this.#max))
    }

    #countGroups() {
        for (let point of this.getAllPoints()) {
            const point_value = point.getValue();
            if (!this.#state[point_value] || this.#point_group_map[point_value]) {
                continue;
            }

            const group_id = this.#next_group_id++;
            this.#countLibertiesForGroup(point, group_id);

        }
    }

    #countLibertiesForGroup(point, group_id) {
        const color = this.get(point);
        const searched = new Set();
        const queue = [point]
        let liberties = 0;

        while (queue.length) {
            const subject = queue.pop();
            const subject_value = subject.getValue();
            const subject_color = this.#state[subject_value];

            if (searched.has(subject_value)) {
                continue;
            }
            searched.add(subject_value);

            if (!subject_color) {
                liberties++;
                continue;
            }

            if (subject_color === color) {
                this.#point_group_map[subject_value] = group_id;
                queue.push(...this.#getOrthogonals(subject))
            }
        }

        this.#group_liberty_map[group_id] = {
            liberties,
            color
        };

        return liberties;

    }

    countLiberties(point) {
        const point_value = point.getValue();
        const group_id = this.#point_group_map[point_value];
        const liberties = this.#group_liberty_map[group_id].liberties;
        if (group_id == null || liberties == null) {
            throw new Error("Cannot count liberties at this point: ", point);
        }
        return liberties;
    }

    moveIsLegal(point, color) {
        this.#guard(point);

        if (this.get(point)) {
            return false;
        }

        const adjacents = this.#getOrthogonals(point);
        for (let adjacent of adjacents) {
            const adjacent_color = this.get(adjacent);
            // To be legal, there needs to be at least one free adjacent,
            // or one adjacent group with more than one liberty (because we're removing a liberty)
            if (!adjacent_color) {
                return true;
            }
            if (adjacent_color === color && this.countLiberties(adjacent) > 1) {
                return true;
            }

            // Allow capture-in-atari
            if (adjacent_color === opposingColor(color) && this.countLiberties(adjacent) === 1) {
                return true;
            }
        }

        return false;
    }

    place(point, color) {
        this.#guard(point);
        if (!this.moveIsLegal(point, color)) {
            return false;
        }
        this.#set(point, color);
        return true;
    }

    in3dMode() {
        return this.#mode_3d;
    }
}
