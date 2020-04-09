'use strict';

import Tile from './Tile';
import Sweetie from './Sweetie';

export default class Playground {
    private _size: number;
    private _countOfTiles: number;
    private _tileSize: number;
    private _tiles: Tile[][];
    private _background: HTMLImageElement;
    private _ctx: CanvasRenderingContext2D;
    private _sweetiesCount: number;
    private _withFox: boolean;
    private _talesVisible: number;

    constructor(size: number, countOfTiles: number, ctx: CanvasRenderingContext2D, sweetiesCount: number = 10, withFox: boolean = false) {
        this._size = size;
        this._countOfTiles = countOfTiles;
        this._tileSize = this._size / this._countOfTiles;
        this._ctx = ctx;
        this._sweetiesCount = sweetiesCount;
        this._withFox = withFox;
        this._talesVisible = 0;

        this._background = document.getElementById('field') as HTMLImageElement;

        this.initTiles();
        this.addSweeties();
        this.neighbourSweetiesCount();
    }

    set size(size: number) {
        this._size = size;
        this._tileSize = this._size / this._countOfTiles;
        this.render();
    }

    render() {
       this._ctx.clearRect(0, 0, this._size, this._size);
    //    this._ctx.fillStyle = 'rgba(0,0,0,0.2)';
    //    this._ctx.fillRect(0, 0, this._size, this._size);
    //    this._ctx.drawImage(this._background, 0, 0, this._size, this._size);

       const sweetiesCount: number = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        
        this._tiles.forEach((tilesRow, rowIndex) => {
            tilesRow.forEach((tile, colIndex) => {
                tile.size = this._tileSize;
                if (this.isWin()) {
                    if (tile.hasSweetie()) tile.setSweetieType('egg');
                    tile.setVisible();
                }
                tile.render(this._ctx, this._tileSize * rowIndex, this._tileSize * colIndex);
            });
        });
    }

    click(x: number, y: number) {
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

    private isWin(): boolean {
        const sweetiesCount: number = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        
        return this._countOfTiles ** 2 == (sweetiesCount + this._talesVisible);
    }

    private initTiles() {
        this._tiles = [];
        let rowTmp: Tile[];
        
        for (let rowIndex = 0; rowIndex < this._countOfTiles; rowIndex++) {
            rowTmp = [];
            for (let colIndex = 0; colIndex < this._countOfTiles; colIndex++) {
                rowTmp.push(new Tile(this._tileSize, this._tileSize * rowIndex, this._tileSize * colIndex));
            }

            this._tiles.push(rowTmp);
        }
        
    }

    private addSweeties() {
        let addedSweeties: number = 0;
        let randomRowIndex: number;
        let randomColumnIndex: number;

        if (this._withFox) {
            randomRowIndex = this.getRandomIndex();
            randomColumnIndex = this.getRandomIndex();
            this._tiles[randomColumnIndex][randomRowIndex].sweetie = new Sweetie('fox');
            this._tiles[randomColumnIndex][randomRowIndex].neighbourSweetiesCount = 9;
        }
            
        while (addedSweeties < this._sweetiesCount) {
            randomRowIndex = this.getRandomIndex();
            randomColumnIndex = this.getRandomIndex();
            
            if (this._tiles[randomColumnIndex][randomRowIndex].hasSweetie() == false) {
                this._tiles[randomColumnIndex][randomRowIndex].sweetie = new Sweetie('egg');
                this._tiles[randomColumnIndex][randomRowIndex].neighbourSweetiesCount = 9;
                addedSweeties++;
            }
        }
    }

    private neighbourSweetiesCount() {
        this._tiles.forEach((tileRow, x) => {
            tileRow.forEach((tile, y) => {
                if (tile.hasSweetie() == false && tile.neighbourSweetiesCount < 9) {
                    tile.neighbourSweetiesCount = this.findNeighbourIndexes(x, y)
                    .filter((indexes) => {return this._tiles[indexes[0]][indexes[1]].hasSweetie();})
                    .length;
                }
            });
        });
    }

    private findNeighbourIndexes(x:number, y: number): number[][] {
        const neighbourIndexes: number[][] = [];

        for (let deltaX = -1; deltaX <= 1; deltaX++) {
            for (let deltaY = -1; deltaY <= 1; deltaY++) {
                if (deltaX == 0 && deltaY == 0) continue;
                if (this.isValidIndexes(x + deltaX, y + deltaY)) {
                    neighbourIndexes.push([x + deltaX, y + deltaY])
                }
            }
        }

        return neighbourIndexes;
    }

    showTilesAround(xPos: number, yPos: number): void {
        const neighbourIndexes: number[][] = this.findNeighbourIndexes(xPos, yPos);

        for (let i = 0; i < neighbourIndexes.length; i++) {
            const tile: Tile = this._tiles[neighbourIndexes[i][0]][neighbourIndexes[i][1]];

            if (tile.visible) continue;
            if (tile.neighbourSweetiesCount < 9) {
                tile.setVisible();
                this._talesVisible++;
            }
            if (tile.neighbourSweetiesCount == 0) this.showTilesAround(neighbourIndexes[i][0], neighbourIndexes[i][1]);
        }
    }

    private getRandomIndex(): number {
        return Math.floor(Math.random() * this._countOfTiles);
    }

    private isValidIndexes(x: number, y: number) {
        return x >= 0 && x < this._countOfTiles && y >= 0 && y < this._countOfTiles
    }
}
 