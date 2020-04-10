'use strict'

export default class LevelSatus {
    win: boolean;
    lost: boolean;
    points: number;

    constructor (win: boolean = false, lost: boolean = false, points: number = 0) {
        this.win = win;
        this.lost = lost;
        this.points = points;
    }
}