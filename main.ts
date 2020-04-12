'use strict';

import Game from './Game'

const CANVAS_ID = 'main-canvas';

window.onload = (event) => {
    const game: Game = new Game(CANVAS_ID);

    window.moveTo(0, 0);

    if (document.all) {
        top.window.resizeTo(screen.availWidth, screen.availHeight);
    }

    // else if (document.layers || document.getElementById) {
    //     if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
    //         top.window.outerHeight = screen.availHeight;
    //         top.window.outerWidth = screen.availWidth;
    //     }
    // }
};
