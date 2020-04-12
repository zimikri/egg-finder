(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const LevelSatus_1 = require("./LevelSatus");
const Level_1 = require("./Level");
class Game {
    constructor(canvasID = 'canvas1') {
        this._canvas = document.querySelector(`#${canvasID}`);
        this._ctx = this._canvas.getContext('2d');
        this._maxLevelCount = 5;
        this._gameScore = 0;
        this._actualLevelSatus = new LevelSatus_1.default();
        this._replayButton = document.querySelector(`#replay`);
        this._nextLevelButton = document.querySelector(`#next-level`);
        this._backgroundImage = document.getElementById('canvas-background');
        this.initCanvas();
        this.createListeners();
        this.startGame();
    }
    startGame(firstLevel = 1) {
        this.startNewLevel(firstLevel);
        this.setButtons();
    }
    restartGame() {
        this._gameScore = 0;
        this._actualLevelSatus = new LevelSatus_1.default();
        this.startGame();
    }
    startNewLevel(levelCount) {
        this.drawBackground();
        this._actualLevel = (levelCount == undefined) ? new Level_1.default(this._canvas, this._ctx, this._gameScore) : new Level_1.default(this._canvas, this._ctx, this._gameScore, levelCount);
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
        }
        else {
            this._canvas.height = clientHeight;
            this._canvas.width = Math.round(this._canvas.height * 0.56);
        }
        this.drawBackground();
    }
    drawBackground() {
        this._ctx.lineWidth = 1;
        this._ctx.drawImage(this._backgroundImage, 0, 0, this._canvas.width, this._canvas.height);
    }
    createListeners() {
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
            if (this._replayButton.disabled)
                return;
            if (this._actualLevelSatus.win) {
                this._gameScore -= this._actualLevelSatus.points;
                console.log(`Total score: ${this._gameScore}`);
            }
            this.startNewLevel(this._actualLevel.getLevelCounter());
        });
        this._nextLevelButton.addEventListener('click', (event) => {
            if (this._nextLevelButton.disabled)
                return;
            if (this._nextLevelButton.textContent == 'Új játék') {
                this.restartGame();
            }
            else {
                this.startNewLevel();
            }
        });
    }
}
exports.default = Game;

},{"./Level":2,"./LevelSatus":3}],2:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const GameSettings_1 = require("./GameSettings");
const Playground_1 = require("./Playground");
class Level {
    constructor(canvas, ctx, gameScore = 0, levelCounter = Level.NEXT_LEVEL) {
        this._canvas = canvas;
        this._ctx = ctx;
        this._gameScore = gameScore;
        console.log(`Level.NEXT_LEVEL: ${Level.NEXT_LEVEL}`);
        this._levelCounter = levelCounter;
        Level.NEXT_LEVEL = levelCounter;
        Level.NEXT_LEVEL++;
        // this.initCanvas();
        this.initLevel();
    }
    initLevel() {
        this._settings = new GameSettings_1.default(this._canvas, this._ctx, this._levelCounter);
        // this.renderCanvasBackground();
        this._playground = new Playground_1.default(this._settings);
        this._playground.render();
    }
    renderCanvasBackground() {
        this._ctx.fillStyle = '#7EB25F';
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    // getGameSettings(): GameSettings {
    //     const settings = new GameSettings(this._canvas, this._ctx, this._levelCounter);
    //     return settings;
    // }
    resize() {
        // this.initCanvas();
        this._settings.initSizes();
        this._playground.render();
    }
    click(x, y) {
        // TODO: what return value we need?
        // console.log(x, y);
        return this._playground.click(x, y);
        // TODO: step next level upon returned values or end game
    }
    setButtons(levelStatus) {
    }
    getLevelCounter() {
        return this._levelCounter;
    }
}
exports.default = Level;
Level.NEXT_LEVEL = 1;

},{"./GameSettings":4,"./Playground":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class GameSettings {
    constructor(canvas, ctx, level) {
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
    get canvas() {
        return this._canvas;
    }
    get ctx() {
        return this._ctx;
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
    getSweetiesCount() {
        return Math.floor(this._level ** 1.2) + 3;
    }
    getWithFox() {
        return this._level > 2;
    }
    getColCount() {
        return this._tilesMatrix[this._level - 1][0];
    }
    getRowCount() {
        return this._tilesMatrix[this._level - 1][1];
    }
    getTileSize() {
        const maxPlaygroundWidth = Math.floor(this._canvas.width * 0.85);
        const maxPlaygroundHeigth = Math.floor(this._canvas.height - this._canvas.width * 0.5);
        return Math.floor(Math.min(maxPlaygroundWidth / this._colCount, maxPlaygroundHeigth / this._rowCount));
    }
    getPlaygroundWidth() {
        return Math.round(this._colCount * this._tileSize);
    }
    getPlaygroundHeigth() {
        return Math.round(this._rowCount * this._tileSize);
    }
    getPlaygroundXOffset() {
        return Math.floor((this._canvas.width - this._playgroundWidth) / 2);
    }
    getPlaygroundYOffset() {
        return Math.round(this._canvas.width * 0.345);
    }
}
exports.default = GameSettings;

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
        // this._background = document.getElementById('field') as HTMLImageElement;
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
                tile.render(this._ctx, this._tileSize * colIndex + this._gameSettings.playgroundXOffset, this._tileSize * rowIndex + this._gameSettings.playgroundYOffset);
            });
        });
    }
    initTiles() {
        this._tiles = [];
        let rowTmp;
        for (let rowIndex = 0; rowIndex < this._gameSettings.rowCount; rowIndex++) {
            rowTmp = [];
            for (let colIndex = 0; colIndex < this._gameSettings.colCount; colIndex++) {
                rowTmp.push(new Tile_1.default(this._tileSize, this._tileSize * colIndex + this._gameSettings.playgroundXOffset, this._tileSize * rowIndex + this._gameSettings.playgroundYOffset));
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
            const colPos = Math.floor((x - this._gameSettings.playgroundXOffset) / this._tileSize) % this._gameSettings.colCount;
            const rowPos = Math.floor((y - this._gameSettings.playgroundYOffset) / this._tileSize) % this._gameSettings.rowCount;
            console.log(colPos, rowPos, this.isValidIndexes(colPos, rowPos));
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

},{"./LevelSatus":3,"./Sweetie":6,"./Tile":7}],6:[function(require,module,exports){
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
    constructor(size, top = 0, left = 0) {
        this._size = size;
        this._top = top;
        this._left = left;
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
    render(ctx, x = this._left, y = this._top) {
        this._left = x;
        this._top = y;
        ctx.drawImage(this.getImage(), x, y, this._size, this._size);
        this.renderNeighbourSweetiesCount(ctx);
        if (this._visible == false) {
            ctx.fillStyle = 'rgba(76, 154, 42, 0.3)';
            ctx.fillRect(x, y, this._size, this._size);
        }
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(x, y, this._size, this._size);
    }
    hasSweetie() {
        if (this._sweetie == undefined)
            return false;
        return true;
    }
    setSweetieType(type) {
        this._sweetie.type = type;
    }
    getImage() {
        if (this._visible == false)
            return this._coverImage;
        if (this._sweetie != undefined)
            return this._sweetie.getImage();
        return document.getElementById('empty');
    }
    renderNeighbourSweetiesCount(ctx) {
        if (this._visible && this._neighbourSweetiesCount < 9 && this._neighbourSweetiesCount > 0) {
            // Draw small flowers later
            ctx.fillStyle = "blue";
            ctx.font = "30px Krungthep";
            ctx.fillText(this._neighbourSweetiesCount.toString(), (this._left + this._size / 2) - 15, (this._top + this._size / 2) + 15);
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
        return document.getElementById('empty');
        const colors = ['red', 'white', 'blue'];
        const imgID = colors[Math.floor(Math.random() * 3)];
        return document.getElementById(imgID);
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
const CANVAS_ID = 'canvas1';
window.onload = (event) => {
    const game = new Game_1.default(CANVAS_ID);
};

},{"./Game":1}]},{},[8]);
