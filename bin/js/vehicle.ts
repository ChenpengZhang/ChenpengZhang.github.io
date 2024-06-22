import { vec2 } from 'gl-matrix'

export class Vehicle {

    // #region fields
    private _location: Point;
    private _speed: vec2;
    private _acceleration: vec2;
    // #endregion

    // #region constructors
    constructor(location: Point){
        this._location = location;
        this._speed = vec2.create();
        vec2.set(this._speed, 0, 0);
        this._acceleration = vec2.create();
        vec2.set(this._acceleration, 0, 0);
    }
    // #endregion

    // #region properties
    get location(): Point {
        return this._location;
    }

    get speed(): vec2 {
        return this._speed;
    }

    get acceleration(): vec2 {
        return this._acceleration;
    }
    // #endregion
}