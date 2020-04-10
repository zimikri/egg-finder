'use strict'

export default class LevelSettings {
    private _level: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _size: number;
    private _countOfTiles: number;
    private _sweetiesCount: number;
    private _withFox: boolean;

    constructor (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, level: number) {
        this._level = level - 1;
        this._canvas = canvas;
        this._ctx = ctx;
        this._size = this.getSize();
        this._countOfTiles = this.getCountOfTiles();
        this._sweetiesCount = this.getSweetiesCount();
        this._withFox = this.getWithFox();
    }

    get ctx() {
        return this._ctx;
    }

    get size() {
        return this._size;
    }

    get countOfTiles() {
        return this._countOfTiles;
    }

    get sweetiesCount() {
        return this._sweetiesCount;
    }

    get withFox() {
        return this._withFox;
    }

    getSize() {
        return this._canvas.width;
    }

    getCountOfTiles(): number {
        return (this._level + 5);
    }

    getSweetiesCount(): number {
        return Math.floor(this._level ** 1.5) + 4;
    }

    getWithFox(): boolean {
        return this._level > 2;
    }
}
