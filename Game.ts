'use strict'

import LevelSatus from './LevelSatus';
import Level from './Level'

export default class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _actualLevel: Level;
    private _maxLevelCount: number;
    private _gameScore: number;
    private _actualLevelSatus: LevelSatus;
    private _replayButton: HTMLButtonElement;
    private _nextLevelButton: HTMLButtonElement;

    constructor(canvasID: string = 'canvas1') {
        this._canvas = document.querySelector(`#${canvasID}`) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext('2d');
        this._maxLevelCount = 5;
        this._gameScore = 0;
        this._actualLevelSatus = new LevelSatus();
        this._replayButton = document.querySelector(`#replay`);
        this._nextLevelButton = document.querySelector(`#next-level`);

        this.initCanvas();
        this.createListeners();
        this.startGame();
    }

    private startGame(firstLevel: number = 1) {
        this.startNewLevel(firstLevel);
        this.setButtons();
    }

    private restartGame() {
        this._gameScore = 0;
        this._actualLevelSatus = new LevelSatus();
        this.startGame();
    }

    private startNewLevel(levelCount?: number) {
        this._actualLevel = (levelCount == undefined) ? new Level(this._canvas, this._ctx) : new Level(this._canvas, this._ctx, levelCount);
    }

    setButtons() {
        this._nextLevelButton.textContent = (this._actualLevel.getLevelCounter() == this._maxLevelCount && this._actualLevelSatus.win) ? 'Új játék' : 'Következő';
        this._replayButton.disabled = false;
        this._nextLevelButton.disabled = !this._actualLevelSatus.win;

    }

    initCanvas() {
        const clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
        document.querySelector('#center-container').setAttribute("style", `height:${clientHeight}px`);
        this._canvas.parentElement.setAttribute("style", `height:${clientHeight}px`);
        
        if (clientWidth <= clientHeight) {
            this._canvas.width = clientWidth;
            this._canvas.height = clientHeight;
        } else {
            this._canvas.height = clientHeight;
            this._canvas.width = Math.round(this._canvas.height * 0.56);
        }
        
        this._ctx.lineWidth = 1;
    }

    private createListeners() {
        this._canvas.addEventListener('click', (event) => {
            this._actualLevelSatus = this._actualLevel.click(event.pageX - this._canvas.offsetLeft, event.pageY - this._canvas.offsetTop);

            if (this._actualLevelSatus.win) {
                this._gameScore += this._actualLevelSatus.points;
                console.log(`Total score: ${this._gameScore}`);
            }

            this.setButtons();
        });

        window.addEventListener('resize', () => {
            this.initCanvas();
            this._actualLevel.resize();
        });
    
        this._replayButton.addEventListener('click', (event) => {
            if (this._replayButton.disabled) return;

            if (this._actualLevelSatus.win) {
                this._gameScore -= this._actualLevelSatus.points;
                console.log(`Total score: ${this._gameScore}`);
            }

            this.startNewLevel(this._actualLevel.getLevelCounter());
        });

        this._nextLevelButton.addEventListener('click', (event) => {
            if (this._nextLevelButton.disabled) return;
            this._actualLevel.resize();
            if (this._nextLevelButton.textContent == 'Új játék') {
                this.restartGame();
            } else {
                this.startNewLevel();
            }
        });
    }
}