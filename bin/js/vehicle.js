"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vehicle = void 0;
const gl_matrix_1 = require("gl-matrix");
class Vehicle {
    // #endregion
    // #region constructors
    constructor(location) {
        this._location = location;
        this._speed = gl_matrix_1.vec2.create();
        gl_matrix_1.vec2.set(this._speed, 0, 0);
        this._acceleration = gl_matrix_1.vec2.create();
        gl_matrix_1.vec2.set(this._acceleration, 0, 0);
    }
    // #endregion
    // #region properties
    get location() {
        return this._location;
    }
    get speed() {
        return this._speed;
    }
    get acceleration() {
        return this._acceleration;
    }
}
exports.Vehicle = Vehicle;
