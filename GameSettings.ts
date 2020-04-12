'use strict'

export default class GameSettings {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _canvasScale: number;
    private _images: Map<string, string>;

    private _maxLevelCount: number;
    private _actualLevel: number;
    private _gameScore: number;

    private _sweetiesCount: number;
    private _withFox: boolean;

    private _tilesMatrix: number[][];
    private _canvasSidePadding: number;
    private _canvasMaxSidePaddingPx: number;
    private _canvasBottomPadding: number;
    private _canvasMaxBottomPaddingPx: number;
    private _canvasMinBottomPaddingPx: number;
    private _canvasHeadHeight: number;
    private _canvasMaxHeaderHightInPx: number;
    private _smallFontSizeInPx: number;
    private _titleMaxWidthInpx: number;
    private _colCount: number;
    private _rowCount: number;
    private _tileSize: number;
    private _playgroundWidth: number;
    private _playgroundHeigth: number;
    private _playgroundXOffset: number;
    private _playgroundYOffset: number;

    constructor (canvasID: string = 'main-canvas', maxLevelCount: number = 7) {
        this._canvas = document.querySelector(`#main-canvas`) as HTMLCanvasElement;
        this._ctx = this._canvas.getContext('2d');
        this._maxLevelCount = maxLevelCount;

        this.setTileMatrix();
        this.setImages();

        this._canvasScale = 3;
        this._canvasMaxSidePaddingPx = 35;
        this._canvasMaxBottomPaddingPx = 100;
        this._canvasMinBottomPaddingPx = 60;
        this._canvasMaxHeaderHightInPx = 160;
        this._smallFontSizeInPx = 14;
        this._titleMaxWidthInpx= 500;
    
        this.initCanvas();
        this.initSettings();
    }

    private setTileMatrix() {
        this._tilesMatrix = [
            [4, 6],
            [4, 7],
            [5, 8],
            [5, 9],
            [6, 10],
            [6, 11],
            [7, 12],
            [7, 13]
        ];
    }
    
    private setImages() {
        this._images = new Map([
            ['canvas-background',  './assets/images/canvas-background.png'],
            ['empty',  './assets/images/empty.png'],
            ['fox',  './assets/images/fox.png'],
            ['flowers',  './assets/images/flowers.png'],
            ['egg',  './assets/images/egg.png'],
            ['egg-crashed',  './assets/images/egg-crashed.png'],
            ['cbg-header-right-bottom',  './assets/images/cbg-header-right-bottom.png'],
            ['cbg-head-left-top',  './assets/images/cbg-head-left-top.png'],
            ['title',  './assets/images/title.png'],
            ['red',  './assets/images/red.png']
        ]);
    }
    
    initSettings() {
        this._gameScore = 0;
        this._actualLevel = 1;
        this.calculateSettingsForActualLevel();
    }

    calculateSettingsForActualLevel() {
        this._colCount = this.getColCount();
        this._rowCount = this.getRowCount();
        this.initSizes();

        this._sweetiesCount = this.getSweetiesCount();
        this._withFox = this.getWithFox();

        this.drawBackground();

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

        this._canvas.style.width = this._canvas.width + 'px';
        this._canvas.style.height = this._canvas.height + 'px';

        this._canvas.width = this._canvasScale * this._canvas.width;
        this._canvas.height = this._canvasScale * this._canvas.height;

        this._ctx.lineWidth = this._canvasScale / 2;
        this.drawBackground();
    }

    private drawBackground() {
        this._ctx.drawImage(this.getImage('cbg-empty-head'), 0, 0, this._canvas.width, this._canvas.height);
        this.drawCanvasHeader();
        this.setButtonsWrapper('button-wrapper');
    }

    drawCanvasHeader() {
        // Clear cavas header for changing only score
        this._ctx.fillStyle = "rgb(126, 177, 95)";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvasHeadHeight);
        
        // Rabbit
        const imageSize: number = 386; // 386 is the original size of rightBottom image
        const imageScale: number = this._canvasHeadHeight / imageSize;
        this._ctx.drawImage(this.getImage('cbg-header-right-bottom'), this._canvas.width - this._canvasHeadHeight, 0, this._canvasHeadHeight, this._canvasHeadHeight);
        
        // Topleft corner
        const topLeftCornerImageSize = 103 * imageScale;
        this._ctx.drawImage(this.getImage('cbg-head-left-top'), 0, 0, topLeftCornerImageSize, topLeftCornerImageSize);

        // Texts
        let textHeight: number;
        this._ctx.fillStyle = "white";
        // Level text
        textHeight = this.setHeaderSmallTextSize() * 1.1;
        const topOfSmallText: number = this._canvasHeadHeight - 2.4 * textHeight;
        this._ctx.fillText(`Szint: ${this._actualLevel}`, this._playgroundXOffset, topOfSmallText);
        this._ctx.fillText(`Megtalált tojások: ${this._gameScore}`, this._playgroundXOffset, this._canvasHeadHeight - textHeight);

        // Title text
        const titleWidth: number = Math.min(this._titleMaxWidthInpx * this._canvasScale, this._canvas.width - this._canvasSidePadding - this._canvasHeadHeight * 0.6);
        const titleHeight: number = titleWidth / 1622 * 200;
        const titleOffsetX: number = (this._canvas.width - titleWidth - this._canvasHeadHeight * 0.4) / 2;
        const titleOffsetY: number = (topOfSmallText - titleHeight) / 2;

        this._ctx.drawImage(this.getImage('title'), titleOffsetX, titleOffsetY, titleWidth, titleHeight);
    }

    setHeaderSmallTextSize(): number {
        const newSize: number = Math.round(this._smallFontSizeInPx * this._canvasHeadHeight / this._canvasMaxHeaderHightInPx);
        const fontText:string =  `${newSize}px Krungthep`;
        this._ctx.font = fontText;

        return newSize;
    }

    setButtonsWrapper(wrapperID: string) {
        const wrapper = document.getElementById(wrapperID);
        wrapper.style.width = (this._playgroundWidth / this._canvasScale) + 'px';
        wrapper.style.height = (this._canvasBottomPadding / this._canvasScale) + 'px';
        wrapper.style.left = (this._canvas.offsetLeft + this._playgroundXOffset / this._canvasScale) + 'px';
    }

    getImage(imageID: string): HTMLImageElement {
        return document.getElementById(imageID) as HTMLImageElement
        // TODO: check why the below code not working
        // let img = new Image();
        // console.log(imageID, this._images.get(imageID));
        // img.src = (this._images.get(imageID) != undefined) ? this._images.get(imageID) : './assets/images/empty.png';
        // img.onload = function() {
        //     return img;
        // }
        // return img;
    }    

    initSizes() {
        this.calculateHeaderHeight();
        this.calculatePaddings();
        this.setTileSize();
        this._playgroundWidth = this._tileSize * this._colCount;
        this._playgroundHeigth = this._tileSize * this._rowCount;
        this._playgroundXOffset = (this._canvas.width - this._playgroundWidth) / 2;
        this._playgroundYOffset = this._canvasHeadHeight;
    }

    calculateHeaderHeight() {
        this._canvasHeadHeight = Math.round(this._canvas.width * 0.345);
        this._canvasHeadHeight = (this._canvasHeadHeight < this._canvasMaxHeaderHightInPx * this._canvasScale) ? this._canvasHeadHeight : this._canvasMaxHeaderHightInPx * this._canvasScale;
    }

    calculatePaddings() {
        this._canvasSidePadding = this._canvas.width * 0.075;
        this._canvasSidePadding = (this._canvasSidePadding > this._canvasMaxSidePaddingPx * this._canvasScale * this.canvasScale) ? this._canvasMaxSidePaddingPx * this._canvasScale * this.canvasScale : this._canvasSidePadding;

        this._canvasBottomPadding = this._canvasSidePadding * 2;
        this._canvasBottomPadding = (this._canvasBottomPadding > this._canvasMaxBottomPaddingPx * this._canvasScale) ? this._canvasMaxBottomPaddingPx * this._canvasScale : this._canvasBottomPadding;
        this._canvasBottomPadding = (this._canvasBottomPadding < this._canvasMinBottomPaddingPx * this._canvasScale) ? this._canvasMinBottomPaddingPx * this._canvasScale : this._canvasBottomPadding;
    }

    setTileSize() {
        const maxPlaygroundWidth: number = Math.floor(this._canvas.width - this._canvasSidePadding * 2);
        const maxPlaygroundHeigth: number = Math.floor(this._canvas.height - this._canvasHeadHeight - this._canvasBottomPadding);

        this._tileSize = Math.floor(Math.min(maxPlaygroundWidth / this._colCount, maxPlaygroundHeigth / this._rowCount));
    }

    // getPlaygroundWidth(): number {
    //     return Math.round(this._colCount * this._tileSize);
    // }

    // getPlaygroundHeigth(): number {
    //     return Math.round(this._rowCount * this._tileSize);
    // }

    // getPlaygroundXOffset(): number {
    //     return Math.floor((this._canvas.width - this._playgroundWidth) / 2);
    // }

    // getPlaygroundYOffset(): number {
    //     return Math.round(this._canvas.width * 0.345);
    // }

    incrementLevel() {
        this._actualLevel++;
        this.calculateSettingsForActualLevel();
    }

    getSweetiesCount(): number {
        return Math.floor(this._actualLevel ** 1.2) + 3;
    }

    getWithFox(): boolean {
        return this._actualLevel > 2;
    }

    getColCount(): number {
        return this._tilesMatrix[this._actualLevel - 1][0];
    }

    getRowCount(): number {
        return this._tilesMatrix[this._actualLevel - 1][1];
    }

    addGamescore(num: number) {
        this._gameScore += num;
        this.drawCanvasHeader();
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    get ctx(): CanvasRenderingContext2D {
        return this._ctx;
    }

    get canvasScale(): number {
        return this._canvasScale;
    }

    get gameScore(): number {
        return this._gameScore;
    }

    get levelCounter():number {
        return this._actualLevel;
    }

    get maxLevelCount(): number {
        return this._maxLevelCount;
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
}
