'use strict'

import LevelSatus from './LevelSatus';
import LevelSettings from './LevelSettings'
import Playground from './Playground'

export default class Level {
    private static NEXT_LEVEL: number = 1;
    private _levelCounter: number;
    // private _levelScore: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    // private _maxCanvasSize: number;
    private _playground: Playground;
    private _settings: LevelSettings;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, levelCounter: number = Level.NEXT_LEVEL) {
        this._canvas = canvas;
        this._ctx = ctx;
        // this._maxCanvasSize = 800;

console.log(`Level.NEXT_LEVEL: ${Level.NEXT_LEVEL}`);

        this._levelCounter = levelCounter;
        Level.NEXT_LEVEL = levelCounter;
        Level.NEXT_LEVEL++;

        // this.initCanvas();
        this.initLevel();
    }

    private initLevel() {
        this._settings = new LevelSettings(this._canvas, this._ctx, this._levelCounter);
        this._playground = new Playground(this._settings);
        this._playground.render();
    }

    // getLevelSettings(): LevelSettings {
    //     const settings = new LevelSettings(this._canvas, this._ctx, this._levelCounter);

    //     return settings;
    // }

    resize() {
        // this.initCanvas();
        this._settings.initSizes();
        this._playground.render();
    }

    click(x: number, y: number): LevelSatus {
        // TODO: what return value we need?
        // console.log(x, y);
        
        return this._playground.click(x, y);
        // TODO: step next level upon returned values or end game
    }

    setButtons(levelStatus: LevelSatus) {
        
    }
    
    getLevelCounter(): number {
        return this._levelCounter;
    }
}