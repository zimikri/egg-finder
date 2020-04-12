(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const LevelSatus_1 = require("./LevelSatus");
const GameSettings_1 = require("./GameSettings");
const Level_1 = require("./Level");
class Game {
    constructor(canvasID, maxLevelCount) {
        this._settings = new GameSettings_1.default(canvasID, maxLevelCount);
        this._actualLevelSatus = new LevelSatus_1.default();
        this._replayButton = document.querySelector(`#replay`);
        this._nextLevelButton = document.querySelector(`#next-level`);
        this._newGameButton = document.querySelector(`#new-game`);
        this.createListeners();
        this.startGame();
    }
    startGame() {
        this.startNewLevel();
        this.setButtons();
    }
    restartGame() {
        this._settings.initSettings();
        this._actualLevelSatus = new LevelSatus_1.default();
        this.startGame();
    }
    startNewLevel() {
        this._nextLevelButton.disabled = true;
        this._actualLevel = new Level_1.default(this._settings);
    }
    setButtons() {
        this._nextLevelButton.disabled = (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount)
            || (this._actualLevelSatus.win == undefined)
            || (this._actualLevelSatus.win == false)
            || (this._actualLevelSatus.points == 0);
        this._replayButton.disabled = false;
    }
    createListeners() {
        this._settings.canvas.addEventListener('click', (event) => {
            this._actualLevelSatus = this._actualLevel.click(event.pageX - this._settings.canvas.offsetLeft, event.pageY - this._settings.canvas.offsetTop);
            if (this._actualLevelSatus.win) {
                if (this._actualLevelSatus.points == 0) {
                    setTimeout(() => {
                        alert(`Ez most nem sikerült, minden tojást összetörtél!\nPróbáld újra ezt a szintet!`);
                    }, 300);
                }
                else {
                    this._settings.addGamescore(this._actualLevelSatus.points);
                    setTimeout(() => {
                        if (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount) {
                            if (confirm('A játéknak vége, ha tetszett kezdd előről :)\n\nBoldog Húsvétot!')) {
                                this.restartGame();
                            }
                        }
                        else {
                            alert(`Ügyes vagy, sikeresen begyűjtöttél ${this._actualLevelSatus.points} tojást!`);
                        }
                    }, 300);
                }
            }
            else if (this._actualLevelSatus.lost) {
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
            if (this._replayButton.disabled)
                return;
            if (this._actualLevelSatus.win) {
                this._settings.addGamescore(-this._actualLevelSatus.points);
            }
            this.startNewLevel();
        });
        this._nextLevelButton.addEventListener('click', (event) => {
            if (this._nextLevelButton.disabled)
                return;
            if (this._actualLevel.getLevelCounter() == this._settings.maxLevelCount) {
                alert('A játéknak vége, ha tetszett kezdd előről :)');
            }
            else if (this._actualLevelSatus.win != undefined && this._actualLevelSatus.win) {
                this._settings.incrementLevel();
                this.startNewLevel();
            }
        });
        this._newGameButton.addEventListener('click', (event) => {
            this.restartGame();
        });
    }
}
exports.default = Game;

},{"./GameSettings":2,"./Level":3,"./LevelSatus":4}],2:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class GameSettings {
    constructor(canvasID = 'main-canvas', maxLevelCount = 7) {
        this._canvas = document.querySelector(`#main-canvas`);
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
        this._titleMaxWidthInpx = 500;
        this.initCanvas();
        this.initSettings();
    }
    setTileMatrix() {
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
    setImages() {
        this._images = new Map([
            ['canvas-background', './assets/images/canvas-background.png'],
            ['empty', './assets/images/empty.png'],
            ['fox', './assets/images/fox.png'],
            ['flowers', './assets/images/flowers.png'],
            ['egg', './assets/images/egg.png'],
            ['egg-crashed', './assets/images/egg-crashed.png'],
            ['cbg-header-right-bottom', './assets/images/cbg-header-right-bottom.png'],
            ['cbg-head-left-top', './assets/images/cbg-head-left-top.png'],
            ['title', './assets/images/title.png'],
            ['red', './assets/images/red.png']
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
        }
        else {
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
    drawBackground() {
        this._ctx.drawImage(this.getImage('cbg-empty-head'), 0, 0, this._canvas.width, this._canvas.height);
        this.drawCanvasHeader();
        this.setButtonsWrapper('button-wrapper');
    }
    drawCanvasHeader() {
        // Clear cavas header for changing only score
        this._ctx.fillStyle = "rgb(126, 177, 95)";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvasHeadHeight);
        // Rabbit
        const imageSize = 386; // 386 is the original size of rightBottom image
        const imageScale = this._canvasHeadHeight / imageSize;
        this._ctx.drawImage(this.getImage('cbg-header-right-bottom'), this._canvas.width - this._canvasHeadHeight, 0, this._canvasHeadHeight, this._canvasHeadHeight);
        // Topleft corner
        const topLeftCornerImageSize = 103 * imageScale;
        this._ctx.drawImage(this.getImage('cbg-head-left-top'), 0, 0, topLeftCornerImageSize, topLeftCornerImageSize);
        // Texts
        let textHeight;
        this._ctx.fillStyle = "white";
        // Level text
        textHeight = this.setHeaderSmallTextSize() * 1.1;
        const topOfSmallText = this._canvasHeadHeight - 2.4 * textHeight;
        this._ctx.fillText(`Szint: ${this._actualLevel}`, this._playgroundXOffset, topOfSmallText);
        this._ctx.fillText(`Megtalált tojások: ${this._gameScore}`, this._playgroundXOffset, this._canvasHeadHeight - textHeight);
        // Title text
        const titleWidth = Math.min(this._titleMaxWidthInpx * this._canvasScale, this._canvas.width - this._canvasSidePadding - this._canvasHeadHeight * 0.6);
        const titleHeight = titleWidth / 1622 * 200;
        const titleOffsetX = (this._canvas.width - titleWidth - this._canvasHeadHeight * 0.4) / 2;
        const titleOffsetY = (topOfSmallText - titleHeight) / 2;
        this._ctx.drawImage(this.getImage('title'), titleOffsetX, titleOffsetY, titleWidth, titleHeight);
    }
    setHeaderSmallTextSize() {
        const newSize = Math.round(this._smallFontSizeInPx * this._canvasHeadHeight / this._canvasMaxHeaderHightInPx);
        const fontText = `${newSize}px Krungthep`;
        this._ctx.font = fontText;
        return newSize;
    }
    setButtonsWrapper(wrapperID) {
        const wrapper = document.getElementById(wrapperID);
        wrapper.style.width = (this._playgroundWidth / this._canvasScale) + 'px';
        wrapper.style.height = (this._canvasBottomPadding / this._canvasScale) + 'px';
        wrapper.style.left = (this._canvas.offsetLeft + this._playgroundXOffset / this._canvasScale) + 'px';
    }
    getImage(imageID) {
        return document.getElementById(imageID);
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
        const maxPlaygroundWidth = Math.floor(this._canvas.width - this._canvasSidePadding * 2);
        const maxPlaygroundHeigth = Math.floor(this._canvas.height - this._canvasHeadHeight - this._canvasBottomPadding);
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
    getSweetiesCount() {
        return Math.floor(this._actualLevel ** 1.2) + 3;
    }
    getWithFox() {
        return this._actualLevel > 2;
    }
    getColCount() {
        return this._tilesMatrix[this._actualLevel - 1][0];
    }
    getRowCount() {
        return this._tilesMatrix[this._actualLevel - 1][1];
    }
    addGamescore(num) {
        this._gameScore += num;
        this.drawCanvasHeader();
    }
    get canvas() {
        return this._canvas;
    }
    get ctx() {
        return this._ctx;
    }
    get canvasScale() {
        return this._canvasScale;
    }
    get gameScore() {
        return this._gameScore;
    }
    get levelCounter() {
        return this._actualLevel;
    }
    get maxLevelCount() {
        return this._maxLevelCount;
    }
    get sweetiesCount() {
        return this._sweetiesCount;
    }
    get withFox() {
        return this._withFox;
    }
    get colCount() {
        return this._colCount;
    }
    get rowCount() {
        return this._rowCount;
    }
    get tileSize() {
        return this._tileSize;
    }
    get playgroundWidth() {
        return this._playgroundWidth;
    }
    get playgroundHeigth() {
        return this._playgroundHeigth;
    }
    get playgroundXOffset() {
        return this._playgroundXOffset;
    }
    get playgroundYOffset() {
        return this._playgroundYOffset;
    }
}
exports.default = GameSettings;

},{}],3:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Playground_1 = require("./Playground");
class Level {
    // private _gameScore: number;
    constructor(gameSettings) {
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
        this._playground = new Playground_1.default(this._gameSettings);
        this._playground.render();
    }
    resize() {
        this._gameSettings.initCanvas();
        this._gameSettings.initSizes();
        this._playground.render();
    }
    click(x, y) {
        return this._playground.click(x, y);
    }
    getLevelCounter() {
        return this._levelCounter;
    }
}
exports.default = Level;
Level.NEXT_LEVEL = 1;

},{"./Playground":5}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class LevelSatus {
    constructor(win = false, lost = false, points = 0) {
        this.win = win;
        this.lost = lost;
        this.points = points;
    }
}
exports.default = LevelSatus;

},{}],5:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const LevelSatus_1 = require("./LevelSatus");
const Tile_1 = require("./Tile");
const Sweetie_1 = require("./Sweetie");
class Playground {
    constructor(settings) {
        this._gameSettings = settings;
        this._ctx = this._gameSettings.ctx;
        this._tileSize = this._gameSettings.tileSize;
        this._sweetiesCount = this._gameSettings.sweetiesCount;
        this._withFox = this._gameSettings.withFox;
        this._talesVisible = 0;
        this._isLostLevel = false;
        this.initTiles();
        this.addSweeties();
        this.neighbourSweetiesCount();
    }
    render() {
        this._ctx.clearRect(this._gameSettings.playgroundXOffset, this._gameSettings.playgroundYOffset, this._gameSettings.playgroundWidth, this._gameSettings.playgroundHeigth);
        this._ctx.fillStyle = '#7EB25F';
        this._ctx.fillRect(this._gameSettings.playgroundXOffset, this._gameSettings.playgroundYOffset, this._gameSettings.playgroundWidth, this._gameSettings.playgroundHeigth);
        this._tileSize = this._gameSettings.tileSize;
        this._tiles.forEach((tilesRow, rowIndex) => {
            tilesRow.forEach((tile, colIndex) => {
                tile.size = this._gameSettings.tileSize;
                if (this.isWin()) {
                    if (tile.hasSweetie())
                        tile.setSweetieType('egg');
                    tile.setVisible();
                }
                tile.render(this._tileSize * colIndex, this._tileSize * rowIndex);
            });
        });
    }
    initTiles() {
        this._tiles = [];
        let rowTmp;
        for (let rowIndex = 0; rowIndex < this._gameSettings.rowCount; rowIndex++) {
            rowTmp = [];
            for (let colIndex = 0; colIndex < this._gameSettings.colCount; colIndex++) {
                rowTmp.push(new Tile_1.default(this._gameSettings, this._tileSize * colIndex, this._tileSize * rowIndex));
            }
            this._tiles.push(rowTmp);
        }
    }
    addSweeties() {
        let addedSweeties = 0;
        let randomRowIndex;
        let randomColIndex;
        if (this._withFox) {
            randomRowIndex = this.getRandomRowIndex();
            randomColIndex = this.getRandomColIndex();
            this._tiles[randomRowIndex][randomColIndex].sweetie = new Sweetie_1.default('fox');
            this._tiles[randomRowIndex][randomColIndex].neighbourSweetiesCount = 9;
        }
        while (addedSweeties < this._sweetiesCount) {
            randomRowIndex = this.getRandomRowIndex();
            randomColIndex = this.getRandomColIndex();
            if (this._tiles[randomRowIndex][randomColIndex].hasSweetie() == false) {
                this._tiles[randomRowIndex][randomColIndex].sweetie = new Sweetie_1.default('egg');
                this._tiles[randomRowIndex][randomColIndex].neighbourSweetiesCount = 9;
                addedSweeties++;
            }
        }
    }
    neighbourSweetiesCount() {
        this._tiles.forEach((tileRow, rowPos) => {
            tileRow.forEach((tile, colPos) => {
                if (tile.hasSweetie() == false && tile.neighbourSweetiesCount < 9) {
                    tile.neighbourSweetiesCount = this.findNeighbourIndexes(colPos, rowPos)
                        .filter((indexes) => {
                        return this._tiles[indexes[1]][indexes[0]].hasSweetie();
                    })
                        .length;
                }
            });
        });
    }
    findNeighbourIndexes(colPos, rowPos) {
        const neighbourIndexes = [];
        for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                if (deltaCol == 0 && deltaRow == 0)
                    continue;
                if (this.isValidIndexes(colPos + deltaCol, rowPos + deltaRow)) {
                    neighbourIndexes.push([colPos + deltaCol, rowPos + deltaRow]);
                }
            }
        }
        return neighbourIndexes;
    }
    showTilesAround(colPos, rowPos) {
        const neighbourIndexes = this.findNeighbourIndexes(colPos, rowPos);
        for (let i = 0; i < neighbourIndexes.length; i++) {
            const tile = this._tiles[neighbourIndexes[i][1]][neighbourIndexes[i][0]];
            if (tile.visible)
                continue;
            if (tile.neighbourSweetiesCount < 9) {
                tile.setVisible();
                this._talesVisible++;
            }
            if (tile.neighbourSweetiesCount == 0)
                this.showTilesAround(neighbourIndexes[i][0], neighbourIndexes[i][1]);
        }
    }
    getRandomColIndex() {
        return Math.floor(Math.random() * this._gameSettings.colCount);
    }
    getRandomRowIndex() {
        return Math.floor(Math.random() * this._gameSettings.rowCount);
    }
    isValidIndexes(x, y) {
        return x >= 0 && x < this._gameSettings.colCount && y >= 0 && y < this._gameSettings.rowCount;
    }
    click(x, y) {
        if (this._isLostLevel == false) {
            x = this._gameSettings.canvasScale * x;
            y = this._gameSettings.canvasScale * y;
            const colPos = Math.floor((x - this._gameSettings.playgroundXOffset) / this._tileSize) % this._gameSettings.colCount;
            const rowPos = Math.floor((y - this._gameSettings.playgroundYOffset) / this._tileSize) % this._gameSettings.rowCount;
            if (this._tiles[rowPos][colPos].visible == false && this._tiles[rowPos][colPos].hasSweetie() == false) {
                this._talesVisible++;
            }
            this._isLostLevel = this._tiles[rowPos][colPos].click();
            if (this._tiles[rowPos][colPos].neighbourSweetiesCount == 0) {
                this.showTilesAround(colPos, rowPos);
            }
            this.render();
        }
        return this.winProcess();
    }
    countPoints() {
        let points = 0;
        this._tiles.forEach((tilesRow) => {
            points += tilesRow.filter((tile) => {
                if (tile.sweetie == undefined)
                    return false;
                return tile.sweetie.getCrashed() == false && tile.sweetie.getEaten() == false;
            })
                .length;
        });
        return points;
    }
    isWin() {
        const sweetiesCount = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        return this._gameSettings.colCount * this._gameSettings.rowCount == (sweetiesCount + this._talesVisible);
    }
    winProcess() {
        return new LevelSatus_1.default(this.isWin(), this._isLostLevel, ((this.isWin()) ? this.countPoints() : 0));
    }
}
exports.default = Playground;

},{"./LevelSatus":4,"./Sweetie":6,"./Tile":7}],6:[function(require,module,exports){
'use scrict';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sweetie {
    constructor(type = 'egg') {
        this._type = type;
        this._img = document.getElementById(this._type);
        this._crashed = false;
        this._eaten = false;
    }
    crash() {
        if (this._type != 'fox' && this._crashed == false) {
            this._crashed = true;
            this._img = document.getElementById(`${this._type}-crashed`);
        }
    }
    eat() {
        return;
        if (this._type != 'fox' && this._crashed == false) {
            this._eaten = true;
            this._img = document.getElementById(`empty`);
        }
    }
    get img() {
        return this._img;
    }
    getImage() {
        return this._img;
    }
    get type() {
        return this._type;
    }
    set type(toType) {
        if (this._type == 'fox') {
            this._type = toType;
            this._img = document.getElementById(this._type);
        }
    }
    getCrashed() {
        return this._crashed;
    }
    getEaten() {
        return this._eaten;
    }
    toString() {
        return '\t' + [this._type, this._img, this._crashed, this._eaten].join('\t\n') + '\n';
    }
}
exports.default = Sweetie;

},{}],7:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Tile {
    constructor(gameSettings, top = 0, left = 0) {
        this._gameSettings = gameSettings;
        this._ctx = this._gameSettings.ctx;
        this._size = this._gameSettings.tileSize;
        this._posY = top + this._gameSettings.playgroundYOffset;
        this._posX = left + this._gameSettings.playgroundXOffset;
        this._coverImage = this.getCoverImage();
        this._visible = false;
        this._neighbourSweetiesCount = 0;
    }
    get visible() {
        return this._visible;
    }
    setVisible() {
        this._visible = true;
    }
    set size(size) {
        this._size = size;
    }
    get sweetie() {
        return this._sweetie;
    }
    set sweetie(sweetie) {
        this._sweetie = sweetie;
    }
    get neighbourSweetiesCount() {
        return this._neighbourSweetiesCount;
    }
    set neighbourSweetiesCount(num) {
        this._neighbourSweetiesCount = num;
    }
    render(x, y) {
        this._posX = x + this._gameSettings.playgroundXOffset;
        this._posY = y + this._gameSettings.playgroundYOffset;
        let scaleTitleImage = (this._sweetie != undefined && this._sweetie.type == 'fox') ? 1 : 0.8;
        this._ctx.drawImage(this.getImage(), this._posX + this._size * 0.1, this._posY + this._size * 0.1, this._size * 0.8, this._size * 0.8);
        this.renderNeighbourSweetiesCount();
        if (this._visible == false) {
            this._ctx.fillStyle = 'rgba(76, 154, 42, 0.3)';
            this._ctx.fillRect(this._posX, this._posY, this._size, this._size);
        }
        this._ctx.strokeStyle = '#cccccc';
        this._ctx.strokeRect(this._posX, this._posY, this._size, this._size);
    }
    hasSweetie() {
        if (this._sweetie == undefined)
            return false;
        return true;
    }
    setSweetieType(type) {
        this._sweetie.type = type;
    }
    getImageName() {
        if (this._visible == false)
            return 'empty';
        if (this._sweetie != undefined) {
            return this._sweetie._type + ((this._sweetie.getCrashed()) ? '-crashed' : '');
        }
        return 'empty';
    }
    getImage() {
        // if (this._sweetie != undefined) {
        //     if (this._sweetie._type == 'fox'){
        //         this.setVisible;
        //         return  this._gameSettings.getImage('fox');
        //     }
        // }
        if (this._visible == false)
            return this._coverImage;
        if (this._sweetie != undefined) {
            const imageID = this._sweetie._type + ((this._sweetie.getCrashed()) ? '-crashed' : '');
            return this._gameSettings.getImage(imageID);
        }
        return this._gameSettings.getImage('empty');
    }
    renderNeighbourSweetiesCount() {
        if (this._visible && this._neighbourSweetiesCount < 9 && this._neighbourSweetiesCount > 0) {
            this._ctx.drawImage(this._gameSettings.getImage('flowers'), 0, (this._neighbourSweetiesCount - 1) * 500, 500, 500, this._posX + this._size * 0.1, this._posY + this._size * 0.1, this._size * 0.8, this._size * 0.8);
        }
    }
    click() {
        if (this._sweetie != undefined) {
            if (this._sweetie.type == 'fox') {
                this.setVisible();
                return true; // lost level
            }
            if (this._visible == false)
                this._sweetie.crash();
            if (this._visible == true)
                this._sweetie.eat();
        }
        this.setVisible();
        return false;
    }
    getCoverImage() {
        return this._gameSettings.getImage('empty');
    }
    toString() {
        return this._sweetie.toString();
    }
}
exports.default = Tile;

},{}],8:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./Game");
const CANVAS_ID = 'main-canvas';
window.onload = (event) => {
    const game = new Game_1.default(CANVAS_ID);
    window.moveTo(0, 0);
    if (document.all) {
        top.window.resizeTo(screen.availWidth, screen.availHeight);
    }
    // else if (document.layers || document.getElementById) {
    //     if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
    //         top.window.outerHeight = screen.availHeight;
    //         top.window.outerWidth = screen.availWidth;
    //     }
    // }
};

},{"./Game":1}]},{},[8]);
