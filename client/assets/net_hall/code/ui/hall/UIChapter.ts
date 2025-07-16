import { _decorator, Node, Component } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';
import { EBundle, UIParent } from 'db://assets/net_framework/const/GameEnum';
import { UIPath } from 'db://assets/net_framework/const/GameGlobal';
import { UIMgr } from 'db://assets/net_framework/manager/UIMgr';

const { ccclass, property } = _decorator;

@ccclass('UIChapter')
export class UIChapter extends BaseNode {
    onShow(oParms?: any): void {
        console.warn('显示章节');
    }

    onClick_btn_game_start() {
        // 加载战场
        // UIMgr.Ins.Open(UIPath.UIBattleLoading, EBundle.Battle, UIParent.Loading, 2001);
        UIMgr.Ins.ShowTip('进入章节');
    }
}
