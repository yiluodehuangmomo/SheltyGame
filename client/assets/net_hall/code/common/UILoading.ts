import { _decorator, Node, Component, game, PageView, EventTouch, Tween, tween, v3, UIOpacity } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';
import { UIMgr } from 'db://assets/net_framework/manager/UIMgr';

const C_LoadingPointStr = ['', '.', '..', '...'];

const { ccclass, property } = _decorator;

@ccclass('UILoading')
export class UILoading extends BaseNode {
    /** 显示剩余时间 */
    private nShowLastTime: number = 0;
    /** 显示的文本 */
    private sTip: string = '';
    /** 当前显示的点点数量 */
    private nShowPointCount: number = 0;
    /** 切换点点的间隔时间 */
    private nCutPointSpace: number = 0;

    onShow(tip?: string): void {
        this.oNodes.lab_tip.node.active = tip != null;
        this.oNodes.lab_tip.string = tip || '';
        this.sTip = tip;
        this.nShowPointCount = 0;
        this.nCutPointSpace = 0;
        this.nShowLastTime = 30;
    }

    update(dt: number): void {
        this.nShowLastTime -= dt;
        if (this.nShowLastTime <= 0) {
            UIMgr.Ins.CloseLoading();
            return;
        }
        if (!this.oNodes.lab_tip.node.active) return;
        // 切换点点点
        this.nCutPointSpace -= dt;
        if (this.nCutPointSpace > 0) return;
        this.nCutPointSpace = 0.5;
        this.nShowPointCount++;
        if (this.nShowPointCount >= C_LoadingPointStr.length) this.nShowPointCount = 0;
        this.oNodes.lab_tip.string = `${this.sTip}${C_LoadingPointStr[this.nShowPointCount]}`;
    }
}
