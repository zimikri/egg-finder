'use scrict'

export default class Sweetie {
    private _type: string;
    private _img: HTMLImageElement;
    private _crashed: boolean;
    private _eaten: boolean;

    constructor(type: string = 'egg') {
        this._type = type;
        this._img = document.getElementById(this._type) as HTMLImageElement;
        this._crashed = false;
        this._eaten = false;

        // this.toString();
    }

    crash() {
        if (this._type != 'fox' && this._crashed == false)
        {
            this._crashed = true;
            this._img = document.getElementById(`${this._type}-crashed`) as HTMLImageElement;
        }
    }

    eat() {
        if (this._type != 'fox' && this._crashed == false)
        {
            this._eaten = true;
            this._img = document.getElementById(`empty`) as HTMLImageElement;
        }
    }

    get img(): HTMLImageElement {
        return this._img;
    }

    get type(): string {
        return this._type;
    }

    set type(toType: string) {
        if (this._type == 'fox') {
            this._type = toType;
            this._img = document.getElementById(this._type) as HTMLImageElement;
        }
    }

    toString(): string {
        return '\t' + [this._type, this._img, this._crashed, this._eaten].join('\t\n') + '\n';
        
    }

    // get crashed (): boolean {
    //     return this._crashed;
    // }

    // get eaten (): boolean {
    //     return this._eaten;
    // }

    // set type(type: string) {
    //     if (this._type == undefined) {
    //         this._type = type;
    //         this._img = document.getElementById(type) as HTMLImageElement;
    //     }
    // }
}