import {
    BoardState,
    WHITE,
    BLACK,
    Coordinate,
    opposingColor
} from "./board_state.js"


// Tests to be run in NodeJs
function test() {
    let state = new BoardState();

    assert(state.countLiberties(new Coordinate(4, 4, 4), BLACK) == 3);

    assert(state.place(new Coordinate(0, 0, 0), BLACK));
    assert(state.countLiberties(new Coordinate(0, 0, 0)) == 6);

    assert(state.place(new Coordinate(1, 0, 0), WHITE));
    assert(state.countLiberties(new Coordinate(0, 0, 0)) == 5);
    assert(state.countLiberties(new Coordinate(1, 0, 0)) == 5);
    assert(state.place(new Coordinate(0, 1, 0), BLACK));
    assert(state.countLiberties(new Coordinate(0, 1, 0)) == 9);

    assert(state.gameOver() == false);
}

function printFunctionAndLineNumber() {
    // https://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js
    let e = new Error();
    let frame = e.stack.split("\n")[3];
    let lineNumber = frame.split(":").reverse()[1];
    let functionName = frame.split(" ")[5];
    return functionName + ":" + lineNumber
}

function assert(condition) {
    if (condition) {
        return;
    }

    console.log("Assertion failed @ " + printFunctionAndLineNumber())
    process.exit(1)
}

test();
