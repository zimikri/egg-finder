'use strict';

import Game from './Game'

const CANVAS_ID = 'canvas1';

window.onload = (event) => {
    const game: Game = new Game(CANVAS_ID);
};
