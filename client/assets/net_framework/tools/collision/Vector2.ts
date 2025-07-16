export default class Vector2 {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}
