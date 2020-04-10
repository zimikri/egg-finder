'use strict';

import LevelSatus from './LevelSatus';
import LevelSettings from './LevelSettings';
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
    private _levelSettings: LevelSettings;
    private _isLostLevel: boolean;

    constructor(settings: LevelSettings) {
        
        this._levelSettings = settings;
        this._size = this._levelSettings.size;
        this._countOfTiles = this._levelSettings.countOfTiles;
        this._tileSize = this._size / this._countOfTiles;
        this._ctx = this._levelSettings.ctx;
        this._sweetiesCount = this._levelSettings.sweetiesCount;
        this._withFox = this._levelSettings.withFox;
        this._talesVisible = 0;
        this._isLostLevel = false;

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
       this._ctx.fillStyle = '#7EB25F';
       this._ctx.fillRect(0, 0, this._size, this._size);
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
            this._tiles[randomRowIndex][randomColumnIndex].sweetie = new Sweetie('fox');
            this._tiles[randomRowIndex][randomColumnIndex].neighbourSweetiesCount = 9;
        }
            
        while (addedSweeties < this._sweetiesCount) {
            randomRowIndex = this.getRandomIndex();
            randomColumnIndex = this.getRandomIndex();
            
            if (this._tiles[randomRowIndex][randomColumnIndex].hasSweetie() == false) {
                this._tiles[randomRowIndex][randomColumnIndex].sweetie = new Sweetie('egg');
                this._tiles[randomRowIndex][randomColumnIndex].neighbourSweetiesCount = 9;

                // console.log(randomRowIndex, randomColumnIndex, this._tiles[randomRowIndex][randomColumnIndex]);
                
                addedSweeties++;
            }
        }
    }

    private neighbourSweetiesCount() {
        this._tiles.forEach((tileRow, rowPos) => {
            tileRow.forEach((tile, colPos) => {
                if (tile.hasSweetie() == false && tile.neighbourSweetiesCount < 9) {
                    tile.neighbourSweetiesCount = this.findNeighbourIndexes(colPos, rowPos)
                    .filter((indexes) => {return this._tiles[indexes[0]][indexes[1]].hasSweetie();})
                    .length;
                }
            });
        });
    }

    private findNeighbourIndexes(colPos:number, rowPos: number): number[][] {
        const neighbourIndexes: number[][] = [];
    
        for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                if (deltaCol == 0 && deltaRow == 0) continue;
                if (this.isValidIndexes(rowPos + deltaCol, colPos + deltaRow)) {
                    neighbourIndexes.push([rowPos + deltaCol, colPos + deltaRow])
                }
            }
        }
    
        return neighbourIndexes;
    }
    
    showTilesAround(rowPos: number, colPos: number): void {
        const neighbourIndexes: number[][] = this.findNeighbourIndexes(colPos, rowPos);

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

    click(x: number, y: number) {
        if (this._isLostLevel == false) {
            const colPos = Math.floor(x / this._tileSize) % this._countOfTiles;
            const rowPos = Math.floor(y / this._tileSize) % this._countOfTiles;
            // console.log(colPos, rowPos);
            
    
            if (this._tiles[colPos][rowPos].visible == false && this._tiles[colPos][rowPos].hasSweetie() == false) {
                this._talesVisible++;
            }
    
            this._isLostLevel = this._tiles[colPos][rowPos].click();
    
            if (this._tiles[colPos][rowPos].neighbourSweetiesCount == 0) {
                this.showTilesAround(colPos, rowPos);
            }
    
            this.render();
        }

        return this.winProcess();
    }

    countPoints(): number {
        let points: number = 0;

        this._tiles.forEach((tilesRow) => {
            points += tilesRow.filter((tile) => {
                if (tile.sweetie == undefined) return false;
                return tile.sweetie.getCrashed() == false && tile.sweetie.getEaten() == false;
            })
            .length;
        });

        return points;
    }

    isWin(): boolean {
        const sweetiesCount: number = this._sweetiesCount + ((this._withFox) ? 1 : 0);
        
        return this._countOfTiles ** 2 == (sweetiesCount + this._talesVisible);
    }

    winProcess() {
        return new LevelSatus(this.isWin(), this._isLostLevel, ((this.isWin()) ? this.countPoints() : 0));
    }
}
 