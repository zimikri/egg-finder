'use strict'

export default class LevelSettings {
    private _level: number;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    private _sweetiesCount: number;
    private _withFox: boolean;

    private _colCount: number;
    private _rowCount: number;
    private _tilesMatrix: number[][] = [
        [4, 6],
        [4, 7],
        [5, 8],
        [5, 9],
        [6, 10],
        [6, 11],
        [7, 12],
        [7, 13]
    ];
    private _tileSize: number;
    private _playgroundWidth: number;
    private _playgroundHeigth: number;
    private _playgroundXOffset: number;
    private _playgroundYOffset: number;

    constructor (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, level: number) {
        this._level = level;
        this._canvas = canvas;
        this._ctx = ctx;

        this._colCount = this.getColCount();
        this._rowCount = this.getRowCount();
        this.initSizes();

        this._sweetiesCount = this.getSweetiesCount();
        this._withFox = this.getWithFox();
    }

    initSizes() {
        this._tileSize = this.getTileSize();
        this._playgroundWidth = this.getPlaygroundWidth();
        this._playgroundHeigth = this.getPlaygroundHeigth();
        this._playgroundXOffset = this.getPlaygroundXOffset();
        this._playgroundYOffset = this.getPlaygroundYOffset();
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }

    get sweetiesCount(): number {
        return this._sweetiesCount;
    }

    get withFox(): boolean {
        return this._withFox;
    }

	get colCount(): number {
		return this._colCount;
	}

	get rowCount(): number {
		return this._rowCount;
	}

	get tileSize(): number {
		return this._tileSize;
	}

	get playgroundWidth(): number {
		return this._playgroundWidth;
	}

	get playgroundHeigth(): number {
		return this._playgroundHeigth;
	}

	get playgroundXOffset(): number {
		return this._playgroundXOffset;
	}

	get playgroundYOffset(): number {
		return this._playgroundYOffset;
	}

    getSweetiesCount(): number {
        return Math.floor(this._level ** 1.2) + 3;
    }

    getWithFox(): boolean {
        return this._level > 2;
    }

    getColCount(): number {
        return this._tilesMatrix[this._level - 1][0];
    }

    getRowCount(): number {
        return this._tilesMatrix[this._level - 1][1];
    }

    getTileSize(): number {
        const maxPlaygroundWidth: number = Math.floor(this._canvas.width * 0.85);
        const maxPlaygroundHeigth: number = Math.floor(this._canvas.height - this._canvas.width * 0.5);

        return Math.floor(Math.min(maxPlaygroundWidth / this._colCount, maxPlaygroundHeigth / this._rowCount));
    }

    getPlaygroundWidth(): number {
        return Math.round(this._colCount * this._tileSize);
    }

    getPlaygroundHeigth(): number {
        return Math.round(this._rowCount * this._tileSize);
    }

    getPlaygroundXOffset(): number {
        return Math.floor((this._canvas.width - this._playgroundWidth) / 2);
    }

    getPlaygroundYOffset(): number {
        return Math.round(this._canvas.width * 0.345);
    }
}
