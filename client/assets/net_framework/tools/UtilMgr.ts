import { game, v2, Vec2, Node, assetManager } from 'cc';

export default class UtilMgr {
    private static _instance: UtilMgr | null = null;

    private constructor() {
        console.log('UtilMgr 初始化');
    }

    static get Ins(): UtilMgr {
        if (!this._instance) {
            this._instance = new UtilMgr();
        }
        return this._instance;
    }

    public CloneObj(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    public getRandomNum(_min: number, _max: number): number {
        if (_min == null || _max == null) return -1;
        if (_min == _max) return _max;
        if (_min >= 1) {
            return Math.floor(Math.random() * (_max - _min + 1) + _min);
        }
        let t = 100000;
        _min = _min * t;
        _max = _max * t;
        let _val = Math.floor(Math.random() * (_max - _min + 1) + _min);
        return _val / t;
    }
    /**
     * 获取两个值之间的随机整数
     * @param _min 最小
     * @param _max 最大
     * @returns
     */
    public getRandomInt(_min: number, _max: number): number {
        if (_min == null || _max == null) return -1;
        if (_min == _max) return _max;
        return Math.floor(Math.random() * (_max - _min + 1) + _min);
    }

    /**
     * 获取两个值之间的随机数
     * @param _min 最小
     * @param _max 最大
     * @returns
     */
    public getRandomFloat(_min: number, _max: number): number {
        if (_min == null || _max == null) return -1;
        if (_min == _max) return _max;

        let t = 100000;
        _min = _min * t;
        _max = _max * t;
        let _val = Math.floor(Math.random() * (_max - _min + 1) + _min);
        return _val / t;
    }

    /**
     * 获取按固定角度移动后的位置
     * @param pos
     * @param ang
     * @param r
     * @returns
     */
    public getMovePosition(pos: Vec2, ang: number, r: number) {
        // ang += 90;
        let x = pos.x + Math.cos((ang * Math.PI) / 180) * r;
        let y = pos.y + Math.sin((ang * Math.PI) / 180) * r;
        return [x, y];
    }
    /**
     * 获取两点基于X轴夹角
     * @param start 开始坐标
     * @param end 结束坐标
     * @returns
     */
    public getAngle(start: any, end: any): number {
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        if (dx == 0 && dy == 0) return 0;
        var dir = v2(dx, dy);

        //根据朝向计算出夹角弧度
        var angle = dir.signAngle(v2(1, 0));
        //将弧度转换为欧拉角
        var degree = (angle / Math.PI) * 180;
        return -degree;
    }

    /**
     * 锁进程
     * @param time 时间 - 毫秒
     * @returns
     */
    async Sleep(time): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // 递归查找第一个名为指定名称的节点
    findFirstChildByName(root: Node, name: string): Node | null {
        // 遍历直接子节点
        for (const child of root.children) {
            // 如果子节点名称匹配，直接返回
            if (child.name === name) {
                return child;
            }
            // 递归查找子节点的子节点
            const target = this.findFirstChildByName(child, name);
            if (target) {
                return target;
            }
        }
        return null;
    }

    padStart(str: string | number, targetLength: number, padString: string): string {
        let currentStr = String(str);
        while (currentStr.length < targetLength) {
            currentStr = padString + currentStr;
        }
        return currentStr;
    }
    /**
     * 获取两点归一化向量
     * @param out 输出变量
     * @param pointA 起点
     * @param pointB 终点
     * @returns
     */
    getNormalizedDirection(pointA: Vec2, pointB: Vec2): Vec2 {
        let out = v2();
        Vec2.subtract(out, pointB, pointA);
        return Vec2.normalize(out, out);
    }
}
