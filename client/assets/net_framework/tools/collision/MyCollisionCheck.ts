import { Node, UITransform, Vec2, isValid, v2 } from 'cc';
import OBB from './OBB';
import Circle from './Circle';
import RotatedRectangle from './RotatedRectangle';

export default class MyCollisionCheck {
    /**
     * 检测矩形与矩形碰撞（世界坐标）
     * @param nodeA 节点A
     * @param nodeB 节点B
     * @returns 是否碰撞
     */
    static CheckRectAndRect(nodeA: Node, nodeB: Node): boolean {
        if (!isValid(nodeA) || !isValid(nodeB)) return false;
        const uitA = nodeA.getComponent(UITransform);
        const uitB = nodeB.getComponent(UITransform);

        // 使用世界坐标和世界旋转角度
        const worldPosA = nodeA.worldPosition;
        const worldPosB = nodeB.worldPosition;
        const worldAngleA = nodeA.eulerAngles.z; // 2D 旋转角度（Z轴）
        const worldAngleB = nodeB.eulerAngles.z;

        const OBB1 = new OBB(v2(worldPosA.x, worldPosA.y), uitA.width, uitA.height, uitA.anchorX, uitA.anchorY, worldAngleA);
        const OBB2 = new OBB(v2(worldPosB.x, worldPosB.y), uitB.width, uitB.height, uitB.anchorX, uitB.anchorY, worldAngleB);

        const nv = OBB1.centerPoint.sub(OBB2.centerPoint);
        const axesToCheck = [...OBB1.axes, ...OBB2.axes];
        for (const axis of axesToCheck) {
            const proj1 = OBB1.getProjectionRadius(axis);
            const proj2 = OBB2.getProjectionRadius(axis);
            if (proj1 + proj2 <= Math.abs(nv.dot(axis))) {
                return false; // 分离轴存在，无碰撞
            }
        }
        return true;
    }

    /**
     * 获取矩形的世界坐标顶点（优化版）
     * @param node 节点
     * @param out 输出顶点数组（长度必须为4）
     */
    static getRectWorldVertices(node: Node, out: Vec2[]) {
        const transform = node.getComponent(UITransform);
        if (!transform) return;
        const anchor = transform.anchorPoint;
        const width = transform.width;
        const height = transform.height;
        const worldMatrix = node.worldMatrix;

        // 计算局部顶点（基于锚点）
        const x1 = -anchor.x * width,
            y1 = -anchor.y * height;
        const x2 = (1 - anchor.x) * width,
            y2 = (1 - anchor.y) * height;

        // 变换到世界坐标
        out[0].set(x1 * worldMatrix.m00 + y1 * worldMatrix.m04 + worldMatrix.m12, x1 * worldMatrix.m01 + y1 * worldMatrix.m05 + worldMatrix.m13);
        out[1].set(x2 * worldMatrix.m00 + y1 * worldMatrix.m04 + worldMatrix.m12, x2 * worldMatrix.m01 + y1 * worldMatrix.m05 + worldMatrix.m13);
        out[2].set(x2 * worldMatrix.m00 + y2 * worldMatrix.m04 + worldMatrix.m12, x2 * worldMatrix.m01 + y2 * worldMatrix.m05 + worldMatrix.m13);
        out[3].set(x1 * worldMatrix.m00 + y2 * worldMatrix.m04 + worldMatrix.m12, x1 * worldMatrix.m01 + y2 * worldMatrix.m05 + worldMatrix.m13);
    }

    /**
     * 快速AABB碰撞检测（世界坐标）
     */
    static FastAABBCollision(nodeA: Node, nodeB: Node): boolean {
        const aabb1 = nodeA.getComponent(UITransform).getBoundingBox();
        const aabb2 = nodeB.getComponent(UITransform).getBoundingBox();
        return aabb1.intersects(aabb2); // 使用引擎内置的AABB交集检测
    }

    /**
     * 旋转矩形碰撞检测（世界坐标）
     */
    static CheckRotatedRectCollision(nodeA: Node, nodeB: Node): boolean {
        // 先用AABB剔除
        if (!this.FastAABBCollision(nodeA, nodeB)) return false;

        const verticesA = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
        const verticesB = [new Vec2(), new Vec2(), new Vec2(), new Vec2()];
        this.getRectWorldVertices(nodeA, verticesA);
        this.getRectWorldVertices(nodeB, verticesB);

        // 合并分离轴（两个矩形的边法向量）
        const axes = [...this.getSeparatingAxes(verticesA), ...this.getSeparatingAxes(verticesB)];

        for (const axis of axes) {
            const [minA, maxA] = this.projectVertices(verticesA, axis);
            const [minB, maxB] = this.projectVertices(verticesB, axis);
            if (maxA < minB || maxB < minA) return false;
        }
        return true;
    }

    /**
     * 检测圆形与矩形碰撞（世界坐标）
     * @param circleX 圆心X（世界坐标）
     * @param circleY 圆心Y（世界坐标）
     * @param radius  圆半径
     * @param node    矩形节点
     */
    static CheckCircleAndRect(circleX: number, circleY: number, radius: number, node: Node): boolean {
        if (!isValid(node)) return false;
        const uit = node.getComponent(UITransform);
        const worldPos = node.worldPosition;
        const worldAngle = node.eulerAngles.z;

        const circle = new Circle(circleX, circleY, radius);
        const rect = new RotatedRectangle(worldPos.x, worldPos.y, uit.width, uit.height, worldAngle);
        return this.circleRotatedRectangleCollision(circle, rect);
    }

    /**
     * 检测圆形与圆形碰撞（世界坐标）
     * @param worldPosA 圆心A（世界坐标）
     * @param radiusA   圆A半径
     * @param worldPosB 圆心B（世界坐标）
     * @param radiusB   圆B半径
     */
    static CheckCircleAndCircle(worldPosA: Vec2, radiusA: number, worldPosB: Vec2, radiusB: number): boolean {
        const distance = worldPosA.subtract(worldPosB).length();
        return distance <= radiusA + radiusB;
    }

    // ----------- 以下工具方法无需修改 -----------
    static getSeparatingAxes(vertices: Vec2[]): Vec2[] {
        const axes: Vec2[] = [];
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const edge = v2(p2.x - p1.x, p2.y - p1.y);
            const normal = v2(-edge.y, edge.x).normalize();
            axes.push(normal);
        }
        return axes;
    }

    static projectVertices(vertices: Vec2[], axis: Vec2): [number, number] {
        let min = Infinity,
            max = -Infinity;
        for (const v of vertices) {
            const proj = v.x * axis.x + v.y * axis.y;
            min = Math.min(min, proj);
            max = Math.max(max, proj);
        }
        return [min, max];
    }

    static circleRotatedRectangleCollision(circle: Circle, rect: RotatedRectangle): boolean {
        // 旋转圆心到矩形局部坐标系
        const dx = circle.x - rect.x;
        const dy = circle.y - rect.y;
        const rotatedX = dx * Math.cos(-rect.angle) - dy * Math.sin(-rect.angle);
        const rotatedY = dx * Math.sin(-rect.angle) + dy * Math.cos(-rect.angle);

        // 找到矩形内最近点
        const closestX = Math.max(-rect.width / 2, Math.min(rotatedX, rect.width / 2));
        const closestY = Math.max(-rect.height / 2, Math.min(rotatedY, rect.height / 2));

        // 计算距离
        const distanceX = rotatedX - closestX;
        const distanceY = rotatedY - closestY;
        return distanceX * distanceX + distanceY * distanceY <= circle.radius * circle.radius;
    }
}
