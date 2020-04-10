'use strict';

import Sweetie from './Sweetie';

export default class Tile {
    private _top: number;
    private _left: number;
    private _size: number;
    private _coverImage: HTMLImageElement;
    private _sweetie: Sweetie;
    private _visible: boolean;
    private _neighbourSweetiesCount: number;

    constructor(size: number, top: number = 0, left: number = 0) {
        this._size = size;
        this._top = top;
        this._left = left;

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

    render(ctx: CanvasRenderingContext2D, x: number = this._left, y: number = this._top) {
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

    hasSweetie(): boolean {
        if (this._sweetie == undefined) return false;
        return true;
    }

    setSweetieType(type: string) {
        this._sweetie.type = type;
    }

    private getImage(): HTMLImageElement {
        if (this._visible == false) return this._coverImage;
        if (this._sweetie != undefined) return this._sweetie.getImage();
        return document.getElementById('empty') as HTMLImageElement;
    }

    private renderNeighbourSweetiesCount(ctx: CanvasRenderingContext2D) {
        if (this._visible && this._neighbourSweetiesCount < 9 && this._neighbourSweetiesCount > 0) {
            // Draw small flowers later
            ctx.fillStyle = "blue";
            ctx.font = "bold 30px Arial";
            ctx.fillText(this._neighbourSweetiesCount.toString(), (this._left + this._size / 2) - 15, (this._top + this._size / 2) + 15);
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
        return document.getElementById('empty') as HTMLImageElement;
        const colors: string[] = ['red', 'white', 'blue'];
        const imgID: string = colors[Math.floor(Math.random() * 3)];
        return document.getElementById(imgID) as HTMLImageElement;
    }

    toString():string {
        return this._sweetie.toString();
    }
}
 