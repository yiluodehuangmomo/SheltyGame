import { _decorator, Node, Component } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';

const { ccclass, property } = _decorator;

@ccclass('UICopy')
export class UICopy extends BaseNode {
    onShow(oParms?: any): void {
        console.warn('显示副本');
    }
}
