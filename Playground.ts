'use strict';

import LevelSatus from './LevelSatus';
import GameSettings from './GameSettings';
import Tile from './Tile';
import Sweetie from './Sweetie';

export default class Playground {
    private _tileSize: number;
    private _tiles: Tile[][];
    private _ctx: CanvasRenderingContext2D;
    private _sweetiesCount: number;
    private _withFox: boolean;
    private _talesVisible: number;
    private _gameSettings: GameSettings;
    private _isLostLevel: boolean;

    constructor(settings: GameSettings) {
        
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
                    if (tile.hasSweetie()) tile.setSweetieType('egg');
                    tile.setVisible();
                }
                tile.render(this._tileSize * colIndex, this._tileSize * rowIndex);
            });
        });
    }

    private initTiles() {
        this._tiles = [];
        let rowTmp: Tile[];
        
        for (let rowIndex = 0; rowIndex < this._gameSettings.rowCount; rowIndex++) {
            rowTmp = [];

            for (let colIndex = 0; colIndex < this._gameSettings.colCount; colIndex++) {
                rowTmp.push(new Tile(this._gameSettings, this._tileSize * colIndex, this._tileSize * rowIndex));
            }

            this._tiles.push(rowTmp);
        }
    }

    private addSweeties() {
        let addedSweeties: number = 0;
        let randomRowIndex: number;
        let randomColIndex: number;

        if (this._withFox) {
            randomRowIndex = this.getRandomRowIndex();
            randomColIndex = this.getRandomColIndex();
            this._tiles[randomRowIndex][randomColIndex].sweetie = new Sweetie('fox');
            this._tiles[randomRowIndex][randomColIndex].neighbourSweetiesCount = 9;
        }
            
        while (addedSweeties < this._sweetiesCount) {
            randomRowIndex = this.getRandomRowIndex();
            randomColIndex = this.getRandomColIndex();
            
            if (this._tiles[randomRowIndex][randomColIndex].hasSweetie() == false) {
                this._tiles[randomRowIndex][randomColIndex].sweetie = new Sweetie('egg');
                this._tiles[randomRowIndex][randomColIndex].neighbourSweetiesCount = 9;
                
                addedSweeties++;
            }
        }
    }

    private neighbourSweetiesCount() {
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

    private findNeighbourIndexes(colPos:number, rowPos: number): number[][] {
        const neighbourIndexes: number[][] = [];
    
        for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
            for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
                if (deltaCol == 0 && deltaRow == 0) continue;
                if (this.isValidIndexes(colPos + deltaCol, rowPos + deltaRow)) {
                    neighbourIndexes.push([colPos + deltaCol, rowPos + deltaRow])
                }
            }
        }
        
        return neighbourIndexes;
    }
    
    showTilesAround(colPos: number, rowPos: number): void {
        const neighbourIndexes: number[][] = this.findNeighbourIndexes(colPos, rowPos);

        for (let i = 0; i < neighbourIndexes.length; i++) {
            const tile: Tile = this._tiles[neighbourIndexes[i][1]][neighbourIndexes[i][0]];

            if (tile.visible) continue;
            if (tile.neighbourSweetiesCount < 9) {
                tile.setVisible();
                this._talesVisible++;
            }
            if (tile.neighbourSweetiesCount == 0) this.showTilesAround(neighbourIndexes[i][0], neighbourIndexes[i][1]);
        }
    }

    private getRandomColIndex(): number {
        return Math.floor(Math.random() * this._gameSettings.colCount);
    }

    private getRandomRowIndex(): number {
        return Math.floor(Math.random() * this._gameSettings.rowCount);
    }

    private isValidIndexes(x: number, y: number) {
        return x >= 0 && x < this._gameSettings.colCount && y >= 0 && y < this._gameSettings.rowCount;
    }

    click(x: number, y: number) {
        if (this._isLostLevel == false) {
            x = this._gameSettings.canvasScale * x;
            y = this._gameSettings.canvasScale *  y;
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
        
        return this._gameSettings.colCount * this._gameSettings.rowCount == (sweetiesCount + this._talesVisible);
    }

    winProcess() {
        return new LevelSatus(this.isWin(), this._isLostLevel, ((this.isWin()) ? this.countPoints() : 0));
    }
}
 