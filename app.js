import {
    GreedyPlayer
} from "./ai.js";

import Game from './game.js'

function restoreValuesFromLocalStorage(ids) {
    for (const id of ids) {
        const value = localStorage[`.capture-go.save-element-id.${id}`];
        if (value) {
            document.getElementById(id).value = value;
        }
    }
}

function saveValuesFromLocalStorage(ids) {
    for (const id of ids) {
        localStorage[`.capture-go.save-element-id.${id}`] = document.getElementById(id).value;
    }
}

function initialize_menu() {
    const all_config_ids = ["config-mode", "config-grid-size", "config-player-1", "config-player-2"];

    // Restore previous selections
    restoreValuesFromLocalStorage(all_config_ids);

    // Initialize all number input buttons
    for (const arrowbox of document.querySelectorAll(".number-input-arrowbox")) {
        const input = arrowbox.parentElement.parentElement.querySelector("input");
        arrowbox.querySelector(".number-input-up").onclick = () => {
            input.stepUp();
        }
        arrowbox.querySelector(".number-input-down").onclick = () => {
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

        // Save current selections
        saveValuesFromLocalStorage(all_config_ids);

        new Game(black_player, white_player, grid_size, mode_3d);
    }
}

function main() {
    initialize_menu();
}

main();
