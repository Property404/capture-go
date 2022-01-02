"use strict";
import {
    BoardState,
    WHITE,
    BLACK,
    Coordinate,
    opposingColor
} from "./board_state.js";

import {
    NaivePlayer,
    SimplePlayer
} from "./ai.js";

const GRID_SIZE = 5;
const MIN = -(GRID_SIZE - 1) / 2;
const MAX = +(GRID_SIZE - 1) / 2;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const CHECKER_RADIUS = CANVAS_WIDTH / 40;
const BUFFER = CHECKER_RADIUS * 1.1;
const BOARD_WIDTH = CANVAS_WIDTH - 2 * BUFFER;
const BOARD_HEIGHT = CANVAS_HEIGHT - 2 * BUFFER;
const FONT_SIZE = 30;

let turn = null;
let current_plane = 0;
let black_ai = null;
let white_ai = new SimplePlayer();

let canvases = [];
let contexts = [];
let board_state = null;

function translate(x, y) {
    x += MAX;
    y += MAX;
    return [x * BOARD_WIDTH / (GRID_SIZE - 1) + BUFFER, y * BOARD_HEIGHT / (GRID_SIZE - 1) + BUFFER]
}

function revTranslate(x, y) {
    x -= BUFFER;
    y -= BUFFER;
    x = (x * (GRID_SIZE - 1)) / BOARD_WIDTH;
    y = (y * (GRID_SIZE - 1)) / BOARD_HEIGHT;
    x -= MAX;
    y -= MAX;
    return [x, y]
}

function clear(context) {
    context.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
    context.rect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
    context.fillStyle = "lightgrey";
    context.fill();
}

function redraw() {
    for (let i = 0; i < GRID_SIZE; i++) {
        let context = contexts[i]
        clear(context);
        context.lineWidth = 5;
        context.strokeStyle = "black";

        // Draw lines
        for (let p = MIN; p <= MAX; p++) {

            let [x, y] = translate(p, p);

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

        context.strokeStyle = "black";
        context.lineWidth = 2;
        for (let coord of board_state.getAllCoordinates()) {
            if (coord.z != i - MAX) {
                continue;
            }

            let color = board_state.get(coord);
            if (!color) {
                continue;
            } else if (color == WHITE) {
                context.fillStyle = "white";
            } else if (color == BLACK) {
                context.fillStyle = "black";
            } else {
                throw new Error("Impossible color")
            }

            const [x, y] = translate(coord.x, coord.y);

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
            context.fillText("" + board_state.countLiberties(coord), x - FONT_SIZE / 4, y + FONT_SIZE / 4);

        }
    }
}

function init() {
    const container = document.querySelector("#main-container");
    for (let i = 0; i < GRID_SIZE; i++) {
        let canvas = document.createElement("canvas");

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        canvas.onclick = handleClick(i);

        container.appendChild(canvas);
        canvases.push(canvas);

        let context = canvas.getContext('2d');
        clear(context);
        contexts.push(context);
    }
    board_state = new BoardState(GRID_SIZE);
    nextTurn();
}

function absoluteToCanvas(canvas, absolute_x, absolute_y) {
    const bbox = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bbox.width;
    const scaleY = canvas.height / bbox.height;
    let [x, y] = [(absolute_x - bbox.left) * scaleX, (absolute_y - bbox.top) * scaleY];
    return [x, y];
}

function inDelta(value) {
    const diff = Math.abs(value % 1);
    return diff < .3 || diff > .7;
}

function nextTurn() {
    redraw();
    if (board_state.gameOver()) {
        alert("Game over!");
        return;
    }

    if (turn) {
        turn = opposingColor(turn);
    } else {
        turn = BLACK;
    }

    function setCanvasesClickable(yes) {
        for (let i = 0; i < GRID_SIZE; i++) {
            if (yes) {
                canvases[i].onclick = handleClick(i);
            } else {
                canvases[i].onclick = null;
            }
        }
    }

    const ai = {
        [BLACK]: black_ai,
        [WHITE]: white_ai,
    } [turn];
    if (ai) {
        setCanvasesClickable(false);
        ai.nextMove(board_state, turn, (value) => {
            board_state.place(value, turn);
            nextTurn();
        })
    } else {
        setCanvasesClickable(true);
    }
}

function handleClick(num) {
    return function(e) {
        let [_x, _y] = absoluteToCanvas(e.target, e.clientX, e.clientY)
        let [x, y] = revTranslate(_x, _y)

        if (inDelta(x) && inDelta(y)) {
            x = Math.round(x);
            y = Math.round(y);

            // Rotate for portrait
            if (window.innerHeight > window.innerWidth) {
                let t = x;
                x = y
                y = -t;
            }

            if (!board_state.place(new Coordinate(x, y, num - MAX), turn)) {
                console.log("Can't move here!");
                return;
            }

            nextTurn();
        }
    }
}

function scrollTo(plane) {
    let scroll_options = {
        behavior: "smooth",
        block: "center",
        inline: "center"
    }
    canvases[current_plane].scrollIntoView(scroll_options);
}

function main() {
    init();
    scrollTo(current_plane);

    document.onkeydown = function(e) {
        if (e.keyCode == 37) {
            if (current_plane > 0) {
                current_plane -= 1;
            }
            scrollTo(current_plane);
        }
        if (e.keyCode == 39) {
            if (current_plane < GRID_SIZE - 1) {
                current_plane += 1;
            }
            scrollTo(current_plane);
        }
    }
}

main();
