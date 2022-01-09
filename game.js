"use strict";
import {
    BoardState,
    WHITE,
    BLACK,
    Point,
    opposingColor
} from "./board_state.js";

import Human from "./human.js";

import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    CHECKER_RADIUS,
    BUFFER,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    FONT_SIZE
} from "./constants.js";

const AI_SLEEP_TIME = 0;

function clear(context) {
    context.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
    context.rect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
    context.fillStyle = "lightgrey";
    context.fill();
}

export default class Game {
    constructor(black_player, white_player, grid_size = 5, mode_3d = true) {
        if (!(grid_size % 2)) {
            new Error("Grid size must be odd!!");
        }

        if (!black_player || !white_player) {
            new Error("Players must be set");
        }

        this.highest_index = (grid_size - 1) / 2;
        this.grid_size = grid_size;
        this.black_player = black_player || new Human(this);
        this.white_player = white_player || new Human(this);
        this.mode_3d = mode_3d;
        if (mode_3d) {
            this.num_planes = this.grid_size;
        } else {
            this.num_planes = 1
        }

        this.init();
    }

    init() {
        this.turn = null;
        this.canvases = [];
        this.contexts = [];
        this.state = new BoardState(this.grid_size, this.mode_3d);

        // This will actually be the middle plane
        this.current_plane = (this.num_planes - 1) / 2;

        const container = document.querySelector("#boards");
        container.innerHTML = "";
        for (let i = 0; i < this.num_planes; i++) {
            let canvas = document.createElement("canvas");

            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;

            container.appendChild(canvas);
            this.canvases.push(canvas);

            let context = canvas.getContext('2d');
            clear(context);
            this.contexts.push(context);
        }

        this.#scrollToCurrent();
        this.#drawBoard();
        this.#nextTurn();

        const game = this;
        document.onkeydown = function(e) {
            if (e.keyCode == 37) {
                e.preventDefault();
                if (game.current_plane > 0) {
                    game.current_plane -= 1;
                }
                game.#scrollToCurrent();
            }
            if (e.keyCode == 39) {
                e.preventDefault();
                if (game.current_plane < game.num_planes - 1) {
                    game.current_plane += 1;
                }
                game.#scrollToCurrent();
            }
        }
    }

    // Translate grid points to canvas points
    #translate(x, y) {
        x += this.highest_index;
        y += this.highest_index;
        return [x * BOARD_WIDTH / (this.grid_size - 1) + BUFFER, y * BOARD_HEIGHT / (this.grid_size - 1) + BUFFER]
    }


    #drawBoard() {
        for (let i = 0; i < this.num_planes; i++) {
            let context = this.contexts[i]
            clear(context);
            context.lineWidth = 5;
            context.strokeStyle = "black";

            // Draw lines
            for (let p = -this.highest_index; p <= this.highest_index; p++) {

                const [x, y] = this.#translate(p, p);

                context.beginPath();
                context.moveTo(x, BUFFER)
                context.lineTo(x, CANVAS_HEIGHT - BUFFER)
                context.closePath();
                context.stroke();

                context.beginPath();
                context.moveTo(BUFFER, y)
                context.lineTo(CANVAS_WIDTH - BUFFER, y)
                context.closePath();
                context.stroke();
            }
        }
    }

    #drawStones() {
        for (let i = 0; i < this.num_planes; i++) {
            const context = this.contexts[i]
            context.strokeStyle = "black";
            context.lineWidth = 2;
            for (const point of this.state.getAllPoints()) {
                if (this.mode_3d && point.z() != i - this.highest_index) {
                    continue;
                }

                const color = this.state.get(point);
                if (!color) {
                    continue;
                } else if (color == WHITE) {
                    context.fillStyle = "white";
                } else if (color == BLACK) {
                    context.fillStyle = "black";
                } else {
                    throw new Error("Impossible color")
                }

                const [x, y] = this.#translate(point.x(), point.y());

                context.beginPath();
                context.ellipse(x, y, CHECKER_RADIUS, CHECKER_RADIUS, 0, 0, Math.PI * 2);
                context.fill();
                context.stroke();

                if (color == WHITE) {
                    context.fillStyle = "black";
                } else if (color == BLACK) {
                    context.fillStyle = "white";
                }

                context.font = `${FONT_SIZE}px Ariel`;
                const string = "" + this.state.countLiberties(point);
                context.fillText(string, x - (CHECKER_RADIUS / 4) * string.length, y + CHECKER_RADIUS / 4);

            }
        }
    }

    #nextTurn() {
        this.#drawStones();
        if (this.state.gameOver()) {
            alert("Game over!");
            return;
        }

        if (this.turn) {
            this.turn = opposingColor(this.turn);
        } else {
            this.turn = BLACK;
        }


        const player = {
            [BLACK]: this.black_player,
            [WHITE]: this.white_player,
        } [this.turn];
        if (player) {
            player.nextMove(this.state, this.turn, (value) => {
                setTimeout(() => {
                    this.state.place(value, this.turn);
                    this.#nextTurn();
                }, AI_SLEEP_TIME * player.useTimer());
            })
        } else {
            throw new Error("No player on team");
        }
    }

    #scrollToCurrent() {
        const scroll_options = {
            behavior: "smooth",
            block: "center",
            inline: "center"
        }
        this.canvases[this.current_plane].scrollIntoView(scroll_options);
    }
}
