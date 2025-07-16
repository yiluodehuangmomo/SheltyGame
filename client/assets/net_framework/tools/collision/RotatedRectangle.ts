export default class RotatedRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;

    constructor(x: number, y: number, width: number, height: number, angle: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = (angle * Math.PI) / 180;
    }
}
