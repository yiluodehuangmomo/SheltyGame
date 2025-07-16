import { _decorator, Node, Component } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';

const { ccclass, property } = _decorator;

@ccclass('UICard')
export class UICard extends BaseNode {
    onShow(oParms?: any): void {
        console.warn('显示卡牌');
    }
}
