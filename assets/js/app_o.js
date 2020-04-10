(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Tile_1 = require("./Tile");
const Sweetie_1 = require("./Sweetie");
class Playground {
    constructor(size, countOfTiles, ctx, sweetiesCount = 10, withFox = false) {
        this._size = size;
        this._countOfTiles = countOfTiles;
        this._tileSize = this._size / this._countOfTiles;
        this._ctx = ctx;
        this._sweetiesCount = sweetiesCount;
        this._withFox = withFox;
        this._talesVisible = 0;
        this._background = document.getElementById('field');
        this.initTiles();
        this.addSweeties();
        this.neighbourSweetiesCount();
    }
    set size(size) {
        this._size = size;
        this._tileSize = this._size / this._countOfTiles;
        this.render();
    }
    render() {
        this._ctx.clearRect(0, 0, this._size, this._size);
        //    this._ctx.fillStyle = 'rgba(0,0,0,0.2)';
        //    this._ctx.fillRect(0, 0, this._size, this._size);
        //    this._ctx.drawImage(this._background, 0, 0, this._size, this._size);
        const sweetiesCount = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        this._tiles.forEach((tilesRow, rowIndex) => {
            tilesRow.forEach((tile, colIndex) => {
                tile.size = this._tileSize;
                if (this.isWin()) {
                    if (tile.hasSweetie())
                        tile.setSweetieType('egg');
                    tile.setVisible();
                }
                tile.render(this._ctx, this._tileSize * rowIndex, this._tileSize * colIndex);
            });
        });
    }
    click(x, y) {
        const xPos = Math.floor(x / this._tileSize) % this._countOfTiles;
        const yPos = Math.floor(y / this._tileSize) % this._countOfTiles;
        if (this._tiles[xPos][yPos].visible == false && this._tiles[xPos][yPos].hasSweetie() == false) {
            this._talesVisible++;
        }
        this._tiles[xPos][yPos].click();
        if (this._tiles[xPos][yPos].neighbourSweetiesCount == 0) {
            this.showTilesAround(xPos, yPos);
        }
        this.render();
    }
    isWin() {
        const sweetiesCount = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        return this._countOfTiles ** 2 == (sweetiesCount + this._talesVisible);
    }
    initTiles() {
        this._tiles = [];
        let rowTmp;
        for (let rowIndex = 0; rowIndex < this._countOfTiles; rowIndex++) {
            rowTmp = [];
            for (let colIndex = 0; colIndex < this._countOfTiles; colIndex++) {
                rowTmp.push(new Tile_1.default(this._tileSize, this._tileSize * rowIndex, this._tileSize * colIndex));
            }
            this._tiles.push(rowTmp);
        }
    }
    addSweeties() {
        let addedSweeties = 0;
        let randomRowIndex;
        let randomColumnIndex;
        if (this._withFox) {
            randomRowIndex = this.getRandomIndex();
            randomColumnIndex = this.getRandomIndex();
            this._tiles[randomColumnIndex][randomRowIndex].sweetie = new Sweetie_1.default('fox');
            this._tiles[randomColumnIndex][randomRowIndex].neighbourSweetiesCount = 9;
        }
        while (addedSweeties < this._sweetiesCount) {
            randomRowIndex = this.getRandomIndex();
            randomColumnIndex = this.getRandomIndex();
            if (this._tiles[randomColumnIndex][randomRowIndex].hasSweetie() == false) {
                this._tiles[randomColumnIndex][randomRowIndex].sweetie = new Sweetie_1.default('egg');
                this._tiles[randomColumnIndex][randomRowIndex].neighbourSweetiesCount = 9;
                addedSweeties++;
            }
        }
    }
    neighbourSweetiesCount() {
        this._tiles.forEach((tileRow, x) => {
            tileRow.forEach((tile, y) => {
                if (tile.hasSweetie() == false && tile.neighbourSweetiesCount < 9) {
                    tile.neighbourSweetiesCount = this.findNeighbourIndexes(x, y)
                        .filter((indexes) => { return this._tiles[indexes[0]][indexes[1]].hasSweetie(); })
                        .length;
                }
            });
        });
    }
    findNeighbourIndexes(x, y) {
        const neighbourIndexes = [];
        for (let deltaX = -1; deltaX <= 1; deltaX++) {
            for (let deltaY = -1; deltaY <= 1; deltaY++) {
                if (deltaX == 0 && deltaY == 0)
                    continue;
                if (this.isValidIndexes(x + deltaX, y + deltaY)) {
                    neighbourIndexes.push([x + deltaX, y + deltaY]);
                }
            }
        }
        return neighbourIndexes;
    }
    showTilesAround(xPos, yPos) {
        const neighbourIndexes = this.findNeighbourIndexes(xPos, yPos);
        for (let i = 0; i < neighbourIndexes.length; i++) {
            const tile = this._tiles[neighbourIndexes[i][0]][neighbourIndexes[i][1]];
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
    getRandomIndex() {
        return Math.floor(Math.random() * this._countOfTiles);
    }
    isValidIndexes(x, y) {
        return x >= 0 && x < this._countOfTiles && y >= 0 && y < this._countOfTiles;
    }
}
exports.default = Playground;

},{"./Sweetie":2,"./Tile":3}],2:[function(require,module,exports){
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
        if (this._type != 'fox' && this._crashed == false) {
            this._eaten = true;
            this._img = document.getElementById(`empty`);
        }
    }
    get img() {
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
    toString() {
        return '\t' + [this._type, this._img, this._crashed, this._eaten].join('\t\n') + '\n';
    }
}
exports.default = Sweetie;

},{}],3:[function(require,module,exports){
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
            return this._sweetie.img;
        return document.getElementById('empty');
    }
    renderNeighbourSweetiesCount(ctx) {
        if (this._visible && this._neighbourSweetiesCount < 9 && this._neighbourSweetiesCount > 0) {
            // Draw small flowers later
            ctx.fillStyle = "blue";
            ctx.font = "bold 30px Arial";
            ctx.fillText(this._neighbourSweetiesCount.toString(), (this._left + this._size / 2) - 15, (this._top + this._size / 2) + 15);
        }
    }
    click() {
        if (this._sweetie != undefined) {
            if (this._visible == false)
                this._sweetie.crash();
            if (this._visible == true)
                this._sweetie.eat();
        }
        else {
        }
        this._visible = true;
        // this.render(ctx);
        // ctx.fillStyle = 'red';
        // ctx.fillRect(this._left, this._top, this._size, this._size);
    }
    getCoverImage() {
        const colors = ['red', 'white', 'blue'];
        const imgID = colors[Math.floor(Math.random() * 3)];
        return document.getElementById(imgID);
    }
    toString() {
        return this._sweetie.toString();
    }
}
exports.default = Tile;

},{}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Playground_1 = require("./Playground");
const canvas = document.querySelector('#canvas1');
const ctx = canvas.getContext('2d');
const MAX_SIZE = 800;
// const egg = document.getElementById('egg') as HTMLImageElement;
let playground;
window.onload = (event) => {
    startApp();
};
function startApp() {
    initCanvas();
    playground = new Playground_1.default(canvas.width, 8, ctx, 7, true);
    playground.render();
}
function initCanvas() {
    const clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    document.querySelector('#center-container').setAttribute("style", `height:${clientHeight}px`);
    canvas.width = Math.min(clientWidth - 10, clientHeight - 10, MAX_SIZE);
    canvas.height = canvas.width;
    canvas.setAttribute('style', 'border: 0.5px solid #cccccc;');
    ctx.lineWidth = 0.3;
}
window.addEventListener('resize', () => {
    initCanvas();
    playground.size = canvas.width;
});
canvas.addEventListener('click', (event) => {
    // console.log(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    playground.click(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
});

},{"./Playground":1}]},{},[4]);
