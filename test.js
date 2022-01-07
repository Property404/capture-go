import {
    BoardState,
    WHITE,
    BLACK,
    Point
} from "./board_state.js"


function test_3d() {
    const state = new BoardState(9, true);

    assert(state.place(new Point(0, 0, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 0, 0)), 6);

    assert(state.place(new Point(1, 0, 0), WHITE));
    assert_eq(state.countLiberties(new Point(0, 0, 0)), 5);
    assert_eq(state.countLiberties(new Point(1, 0, 0)), 5);

    assert(state.place(new Point(0, 1, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 1, 0)), 9);
    assert_eq(state.countLiberties(new Point(0, 0, 0)), 9);

    assert(state.gameOver() == false);
}

function test_2d() {
    const state = new BoardState(9, false);

    assert(state.place(new Point(0, 0), BLACK));
    assert_eq(state.countLiberties(new Point(0, 0)), 4);

    assert(state.place(new Point(1, 0), WHITE));
    assert_eq(state.countLiberties(new Point(0, 0)), 3);
    assert_eq(state.countLiberties(new Point(1, 0)), 3);

    assert(state.place(new Point(0, 1), BLACK));
    assert_eq(state.countLiberties(new Point(0, 1)), 5);
    assert_eq(state.countLiberties(new Point(0, 0)), 5);

    assert(state.gameOver() == false);
}

function test() {
    test_3d();
    test_2d();
}

function printFunctionAndLineNumber() {
    // https://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js
    const e = new Error();
    const frame = e.stack.split("\n")[3];
    const lineNumber = frame.split(":").reverse()[1];
    const functionName = frame.split(" ")[5];
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
