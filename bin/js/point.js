"use strict";
class Point {
    // #endregion
    // #region constructors
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    // #endregion
    // #region properties
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
}
