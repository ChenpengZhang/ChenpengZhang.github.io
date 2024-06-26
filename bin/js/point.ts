class Point{

    // #region fields
    private _x: number;
    private _y: number;
    // #endregion

    // #region constructors
    constructor(x: number, y: number){
        this._x = x;
        this._y = y;
    }
    // #endregion

    // #region properties

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }
    
    // #endregion

}