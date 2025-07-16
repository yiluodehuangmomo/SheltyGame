import { _decorator, Node, Component, game, PageView, EventTouch, Tween, tween, v3, UIOpacity } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';
import { ObjectPoolManager } from 'db://assets/net_framework/manager/ObjectPoolManager';
import { UIMgr } from 'db://assets/net_framework/manager/UIMgr';

const { ccclass, property } = _decorator;

@ccclass('NodeTip')
export class NodeTip extends BaseNode {
    Init(tip: string) {
        this.oNodes.node_container.getComponent(UIOpacity).opacity = 255;
        this.oNodes.node_container.setPosition(0, 0);
        this.oNodes.node_container.scale = v3(0, 0, 0);
        tween(this.oNodes.node_container)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: 'backOut' })
            .start();
        this.oNodes.lab_tip.string = tip;
        this.scheduleOnce(() => {
            this.CloseSelf();
        }, 3);
    }

    CloseSelf() {
        let op = this.oNodes.node_container.getComponent(UIOpacity);
        tween(op).to(1, { opacity: 0 }).start();
        tween(this.oNodes.node_container)
            .by(1, { position: v3(0, 100, 0) })
            .call(() => {
                Tween.stopAllByTarget(this.node);
                ObjectPoolManager.Ins.recycleNode(this.node.name, this.node);
            })
            .start();
    }
}
