import {
    NaivePlayer,
    GreedyPlayer
} from "./ai.js";

import Game from './game.js'

function initialize_menu() {

    // Initialize all number input buttons
    for (const arrowbox of document.querySelectorAll(".number-input-arrowbox")) {
        const input = arrowbox.parentElement.parentElement.querySelector("input");
        arrowbox.querySelector(".number-input-up").onclick = (e) => {
            input.stepUp();
        }
        arrowbox.querySelector(".number-input-down").onclick = (e) => {
            input.stepDown();
        }
    }

    const menu = document.querySelector("#main-menu");
    menu.querySelector("#play-button").onclick = (e) => {
        e.preventDefault();

        function asPlayer(player) {
            if (player == "human") {
                return null;
            } else if (player == "ai") {
                return new GreedyPlayer();
            }
            throw new Error("Invalid option");
        }
        const black_player = asPlayer(menu.querySelector("#config-player-1").value);
        const white_player = asPlayer(menu.querySelector("#config-player-2").value);
        const grid_size = menu.querySelector("#config-grid-size").value;
        const mode_3d = menu.querySelector("#config-mode").value == "3D";

        document.querySelector("#boards").style = "";
        document.querySelector("#main-menu").style = "display:none;";
        const game = new Game(black_player, white_player, grid_size, mode_3d);
    }
}

function main() {
    initialize_menu();
}

main();
