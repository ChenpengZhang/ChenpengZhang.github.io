import { vec2 } from "gl-matrix";
import { Vehicle } from "./vehicle";

class Car extends Vehicle {

    // #region fields

    private _carType: CarType;

    // #endregion

    // #region constructors

    constructor(location: Point, carType: CarType){
        super(location);
        this._carType = carType
    }

    // #endregion

    // #region public methods

    /**
     * let the car move for a specified length
     * @param deltaX 
     * @param deltaY 
     */
    moveSpecified(deltaX: number, deltaY: number){
        this.location.x += deltaX;
        this.location.y += deltaY;
    }

    /**
     * let the car move based on its own speed
     */
    moveSpeed(){
        this.location.x += this.speed[0];
        this.location.y += this.speed[1];
    }

    /**
     * let the car accelerate based on its own acceleration
     */
    accelerate(){
        this.speed[0] += this.acceleration[0];
        this.speed[1] += this.acceleration[1];
    }

    public drawSelf(ctx: CanvasRenderingContext2D){
        
    }

    // #endregion
}