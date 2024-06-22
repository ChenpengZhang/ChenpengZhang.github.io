"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vehicle_1 = require("./vehicle");
class Car extends vehicle_1.Vehicle {
    // #endregion
    // #region constructors
    constructor(location, carType) {
        super(location);
        this._carType = carType;
    }
    // #endregion
    // #region public methods
    /**
     * let the car move for a specified length
     * @param deltaX
     * @param deltaY
     */
    moveSpecified(deltaX, deltaY) {
        this.location.x += deltaX;
        this.location.y += deltaY;
    }
    /**
     * let the car move based on its own speed
     */
    moveSpeed() {
        this.location.x += this.speed[0];
        this.location.y += this.speed[1];
    }
    /**
     * let the car accelerate based on its own acceleration
     */
    accelerate() {
        this.speed[0] += this.acceleration[0];
        this.speed[1] += this.acceleration[1];
    }
    drawSelf(ctx) {
    }
}
