import {
    NaivePlayer,
    SimplePlayer
} from "./ai.js";

import Game from './game.js'


function main() {
    const game = new Game(null, new SimplePlayer());
}

main();
