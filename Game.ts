'use strict'

import LevelSatus from './LevelSatus';
import GameSettings from './GameSettings'
import Level from './Level'

export default class Game {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _settings: GameSettings;
    private _actualLevel: Level;
    private _actualLevelSatus: LevelSatus;
    private _replayButton: HTMLButtonElement;
    private _nextLevelButton: HTMLButtonElement;
    private _newGameButton: HTMLButtonElement;

    constructor(canvasID?: string, maxLevelCount?: number) {
        this._settings = new GameSettings(canvasID, maxLevelCount)
        this._actualLevelSatus = new LevelSatus();
        this._replayButton = document.querySelector(`#replay`) as HTMLButtonElement;
        this._nextLevelButton = document.querySelector(`#next-level`) as HTMLButtonElement;
        this._newGameButton = document.querySelector(`#new-game`) as HTMLButtonElement;

        this.createListeners();
        this.startGame();
    }

    private startGame() {
        this.startNewLevel();
        this.setButtons();
    }

    private restartGame() {
        this._settings.initSettings();
        this._actualLevelSatus = new LevelSatus();
        this.startGame();
    }

    private startNewLevel() {
        this._nextLevelButton.disabled = true;
        
        this._actualLevel = new Level(this._settings);
    }

    setButtons() {
        this._nextLevelButton.disabled = (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount)
            || (this._actualLevelSatus.win == undefined)
            || (this._actualLevelSatus.win == false)
            || (this._actualLevelSatus.points == 0);
        this._replayButton.disabled = false;
    }



    private createListeners() {
        this._settings.canvas.addEventListener('click', (event) => {
            this._actualLevelSatus = this._actualLevel.click(event.pageX - this._settings.canvas.offsetLeft, event.pageY - this._settings.canvas.offsetTop);

            if (this._actualLevelSatus.win) {
                if (this._actualLevelSatus.points == 0) {
                    setTimeout(() => { 
                        alert(`Ez most nem sikerült, minden tojást összetörtél!\nPróbáld újra ezt a szintet!`);
                    }, 300);
                        
                } else {
                    this._settings.addGamescore(this._actualLevelSatus.points);
                    setTimeout(() => { 
                        if (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount) {
                            if (confirm('A játéknak vége, ha tetszett kezdd előről :)\n\nBoldog Húsvétot!')) {
                                this.restartGame();
                            }
                        } else {
                            alert(`Ügyes vagy, sikeresen begyűjtöttél ${this._actualLevelSatus.points} tojást!`);
                        }
                    }, 300);
                }

            } else if (this._actualLevelSatus.lost) {
                setTimeout(() => { 
                    alert(`Hűha, sajnos erre járt a róka és elűzte a nyuszit!\nÚjra kell játszanod ezt a szintet!`);
                }, 300);
            }

            this.setButtons();
        });

        window.addEventListener('resize', () => {
            this._actualLevel.resize();
        });
    
        this._replayButton.addEventListener('click', (event) => {
            if (this._replayButton.disabled) return;

            if (this._actualLevelSatus.win) {
                this._settings.addGamescore(-this._actualLevelSatus.points);
            }

            this.startNewLevel();
        });

        this._nextLevelButton.addEventListener('click', (event) => {
            if (this._nextLevelButton.disabled) return;
            if (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount) {
                alert('A játéknak vége, ha tetszett kezdd előről :)')
            } else if (this._actualLevelSatus.win != undefined && this._actualLevelSatus.win){
                this._settings.incrementLevel();
                this.startNewLevel();
            }
        });

        this._newGameButton.addEventListener('click', (event) => {
            this.restartGame();
        });
    }
}