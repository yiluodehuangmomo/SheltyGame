import { Vec2, v2 } from 'cc';
import Vector2 from './Vector2';

export default class OBB {
    public centerPoint: Vector2 = null;
    public extents: [number, number] = null;
    public axes: [Vector2, Vector2] = null;
    private _width: number = 0;
    private _height: number = 0;
    private _rotation: number = 0;

    constructor(centerPoint: Vec2, width: number, height: number, anchorX: number, anchorY: number, angle: number) {
        if (anchorX < 0.5) anchorX = 1 - anchorX;
        if (anchorY < 0.5) anchorY = 1 - anchorY;

        this.centerPoint = new Vector2(centerPoint.x, centerPoint.y);
        this.extents = [width * anchorX, height * anchorY];
        let rotation = (angle * Math.PI) / 180;
        this.axes = [new Vector2(Math.cos(rotation), Math.sin(rotation)), new Vector2(-1 * Math.sin(rotation), Math.cos(rotation))];
        this._width = width;
        this._height = height;
        this._rotation = rotation;
    }

    getProjectionRadius(axis) {
        return this.extents[0] * Math.abs(axis.dot(this.axes[0])) + this.extents[1] * Math.abs(axis.dot(this.axes[1]));
    }
}
