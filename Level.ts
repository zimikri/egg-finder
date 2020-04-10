'use strict'

import LevelSatus from './LevelSatus';
import LevelSettings from './LevelSettings'
import Playground from './Playground'

export default class Level {
    private static NEXT_LEVEL: number = 1;
    private _levelCounter: number;
    private _levelScore: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _maxCanvasSize: number;
    private _playground: Playground;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, levelCounter: number = Level.NEXT_LEVEL) {
        this._canvas = canvas;
        this._ctx = ctx;
        this._maxCanvasSize = 800;

console.log(`Level.NEXT_LEVEL: ${Level.NEXT_LEVEL}`);

        this._levelCounter = levelCounter;
        Level.NEXT_LEVEL = levelCounter;
        Level.NEXT_LEVEL++;

        this.initCanvas();
        this.initLevel();
    }

    private initLevel() {
        const settings: LevelSettings = this.getLevelSettings();
        this._playground = new Playground(settings);
        this._playground.render();
    }

    getLevelSettings(): LevelSettings {
        const settings = new LevelSettings(this._canvas, this._ctx, Level.NEXT_LEVEL);

        return settings;
    }

    initCanvas() {
        const clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
        document.querySelector('#center-container').setAttribute("style", `height:${clientHeight}px`);
        // this._canvas.parentElement.setAttribute("style", `height:${clientHeight}px`);
        
        this._canvas.width = Math.min(clientWidth - 10, clientHeight - 10, this._maxCanvasSize);
        this._canvas.height = this._canvas.width;
        // this._canvas.setAttribute('style', 'border: 1px solid #cccccc;');
    
        this._ctx.lineWidth = 0.3;
    }

    resize() {
        this.initCanvas();
        this._playground.size = this._canvas.width;
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