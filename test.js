import {
    BoardState,
    WHITE,
    BLACK,
    Point,
    opposingColor
} from "./board_state.js"


function test_3d() {
    let state = new BoardState(9, true);
    assert_eq(state.countLiberties(new Point(0, 0, 0), BLACK), 6);

    assert_eq(state.countLiberties(new Point(4, 4, 4), BLACK), 3);

    assert(state.place(new Point(0, 0, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 0, 0), BLACK), 6);

    assert(state.place(new Point(1, 0, 0), WHITE));
    assert_eq(state.countLiberties(new Point(0, 0, 0)), 5);
    assert_eq(state.countLiberties(new Point(1, 0, 0)), 5);
    assert(state.place(new Point(0, 1, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 1, 0)), 9);

    assert(state.gameOver() == false);
}

function test_2d() {
    let state = new BoardState(9, false);
    assert_eq(state.countLiberties(new Point(0, 0), BLACK), 4);

    assert_eq(state.countLiberties(new Point(4, 4), BLACK), 2);

    assert(state.place(new Point(0, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 0)), 4);

    assert(state.place(new Point(1, 0), WHITE));
    assert_eq(state.countLiberties(new Point(0, 0)), 3);
    assert_eq(state.countLiberties(new Point(1, 0)), 3);

    assert(state.gameOver() == false);
}

function test() {
    test_3d();
    test_2d();
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

function assert_eq(a, b) {
    if (a == b) {
        return;
    }

    console.log(`Assertion failed @ ${printFunctionAndLineNumber()}: ${a} != ${b}`)
    process.exit(1)
}

test();
