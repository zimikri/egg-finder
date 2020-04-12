'use strict'

import LevelSatus from './LevelSatus';
import GameSettings from './GameSettings'
import Playground from './Playground'

export default class Level {
    private static NEXT_LEVEL: number = 1;
    private _levelCounter: number;
    // private _levelScore: number;
    // private _canvas: HTMLCanvasElement;
    // private _ctx: CanvasRenderingContext2D;
    // private _maxCanvasSize: number;
    private _playground: Playground;
    private _gameSettings: GameSettings;
    // private _gameScore: number;

    constructor(gameSettings: GameSettings) {
        this._gameSettings = gameSettings;
        // this._gameScore = gameScore;

// console.log(`Level.NEXT_LEVEL: ${Level.NEXT_LEVEL}`);

        this._levelCounter = this._gameSettings.levelCounter;
        Level.NEXT_LEVEL = this._levelCounter;
        Level.NEXT_LEVEL++;
// console.log('Level created');

        // this.initCanvas();
        this.startLevel();
    }

    startLevel() {
        this._playground = new Playground(this._gameSettings);
        this._playground.render();
    }

    resize() {
        this._gameSettings.initCanvas();
        this._gameSettings.initSizes();
        this._playground.render();
    }

    click(x: number, y: number): LevelSatus {
        
        return this._playground.click(x, y);
    }

    getLevelCounter(): number {
        return this._levelCounter;
    }
}