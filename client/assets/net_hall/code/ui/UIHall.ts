import { _decorator, Node, Component, game, PageView, EventTouch, Tween, tween, v3, UIOpacity } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';
import { EConfig } from 'db://assets/net_framework/const/ConfigEnum';
import { GameEvent } from 'db://assets/net_framework/const/GameEvent';
import { ConfigMgr } from 'db://assets/net_framework/manager/ConfigMgr';

const { ccclass, property } = _decorator;

@ccclass('UIHall')
export class UIHall extends BaseNode {
    private bLoaded: boolean = false;

    afteronLoad(): void {
        this.oNodes.page_menu.node.on(PageView.EventType.SCROLL_ENDED, this.onPageChanged, this);
    }

    onShow(oParms?: any): void {}

    start(): void {
        // 禁止pageview触摸事件
        this.oNodes.page_menu._unregisterEvent();
        // 切换到默认页面
        this.onClick_btn_chapter();
    }

    onClick_btn_card() {
        this.CutoverPage(0, this.oNodes.btn_card.node);
    }
    onClick_btn_soldier() {
        this.CutoverPage(1, this.oNodes.btn_soldier.node);
    }
    onClick_btn_chapter() {
        this.CutoverPage(2, this.oNodes.btn_chapter.node);
    }
    onClick_btn_copy() {
        this.CutoverPage(3, this.oNodes.btn_copy.node);
    }

    CutoverPage(idx: number, toNode: Node) {
        let tempNode = this.oNodes.content.children[idx];
        tempNode.getComponent(UIOpacity).opacity = 255;
        tempNode.getComponent(tempNode.name)?.onShow();
        Tween.stopAllByTarget(this.oNodes.node_choice);
        tween(this.oNodes.node_choice)
            .to(0.1, { position: v3(toNode.position.x, this.oNodes.node_choice.position.y, 0) })
            .start();
        this.oNodes.page_menu.scrollToPage(idx, 0.3);
    }

    private onPageChanged() {
        if (!this.bLoaded) {
            this.bLoaded = true;
            game.emit(GameEvent.HallLoaded);
        }
        for (let i = 0; i < this.oNodes.content.children.length; i++) {
            this.oNodes.content.children[i].getComponent(UIOpacity).opacity = i == this.oNodes.page_menu.curPageIdx ? 255 : 0;
        }
    }
}
