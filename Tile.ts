'use strict';

import GameSettings from './GameSettings';
import Sweetie from './Sweetie';

export default class Tile {
    private _gameSettings: GameSettings;
    private _ctx: CanvasRenderingContext2D;
    private _posY: number;
    private _posX: number;
    private _size: number;
    private _coverImage: HTMLImageElement;
    private _sweetie: Sweetie;
    private _visible: boolean;
    private _neighbourSweetiesCount: number;

    constructor(gameSettings: GameSettings, top: number = 0, left: number = 0) {
        this._gameSettings = gameSettings;
        this._ctx = this._gameSettings.ctx;

        this._size = this._gameSettings.tileSize;
        this._posY = top + this._gameSettings.playgroundYOffset;
        this._posX = left + this._gameSettings.playgroundXOffset;

        this._coverImage = this.getCoverImage();
        this._visible = false;
        this._neighbourSweetiesCount = 0;
    }

    get visible(): boolean {
        return this._visible;
    }

    setVisible() {
        this._visible = true;
    }

    set size(size: number) {
        this._size = size;
    }

    get sweetie(): Sweetie {
        return this._sweetie; 
    }

    set sweetie(sweetie: Sweetie) {
        this._sweetie = sweetie; 
    }

    get neighbourSweetiesCount(): number {
        return this._neighbourSweetiesCount;
    }

    set neighbourSweetiesCount(num: number) {
        this._neighbourSweetiesCount = num;
    }

    render(x: number, y: number) {
        this._posX = x + this._gameSettings.playgroundXOffset;
        this._posY = y + this._gameSettings.playgroundYOffset;
        let scaleTitleImage: number = (this._sweetie != undefined && this._sweetie.type == 'fox') ? 1 : 0.8;

        this._ctx.drawImage(this.getImage(), this._posX + this._size * 0.1, this._posY + this._size * 0.1, this._size * 0.8, this._size * 0.8);

        this.renderNeighbourSweetiesCount();

        if (this._visible == false) {
            this._ctx.fillStyle = 'rgba(76, 154, 42, 0.3)';
            this._ctx.fillRect(this._posX, this._posY, this._size, this._size);
        }
        this._ctx.strokeStyle = '#cccccc';
        this._ctx.strokeRect(this._posX, this._posY, this._size, this._size);
    }

    hasSweetie(): boolean {
        if (this._sweetie == undefined) return false;
        return true;
    }

    setSweetieType(type: string) {
        this._sweetie.type = type;
    }

    getImageName() {
        if (this._visible == false) return 'empty';
        if (this._sweetie != undefined) {
            return  this._sweetie._type + ((this._sweetie.getCrashed()) ? '-crashed' : '');
        }
        return 'empty';
    }

    private getImage(): HTMLImageElement {
        if (this._visible == false) return this._coverImage;
        if (this._sweetie != undefined) {
            const imageID: string = this._sweetie._type + ((this._sweetie.getCrashed()) ? '-crashed' : '');
            return  this._gameSettings.getImage(imageID);
        }
        return this._gameSettings.getImage('empty');
    }

    private renderNeighbourSweetiesCount() {
        if (this._visible && this._neighbourSweetiesCount < 9 && this._neighbourSweetiesCount > 0) {
            this._ctx.drawImage(this._gameSettings.getImage('flowers'), 
                0, (this._neighbourSweetiesCount - 1) * 500,
                500, 500,
                this._posX + this._size * 0.1, this._posY + this._size * 0.1,
                this._size * 0.8, this._size * 0.8
            );
        }
    }

    click() {
        if (this._sweetie != undefined) {
            if (this._sweetie.type == 'fox') {
                this.setVisible();
                return true; // lost level
            }
            if (this._visible == false) this._sweetie.crash();
            if (this._visible == true) this._sweetie.eat();
        }
        this.setVisible();

        return false;
    }

    private getCoverImage(): HTMLImageElement {
        return this._gameSettings.getImage('empty');
    }

    toString():string {
        return this._sweetie.toString();
    }
}
 