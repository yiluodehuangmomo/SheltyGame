import { _decorator, Component, game, Label, Sprite } from 'cc';
import { BaseNode } from 'db://assets/net_framework/base/BaseNode';
import { EBundle, UIParent } from 'db://assets/net_framework/const/GameEnum';
import { GameEvent } from 'db://assets/net_framework/const/GameEvent';
import { UIPath } from 'db://assets/net_framework/const/GameGlobal';
import { ConfigMgr } from 'db://assets/net_framework/manager/ConfigMgr';
import { GameResMgr } from 'db://assets/net_framework/manager/GameResMgr';
import { UIMgr } from 'db://assets/net_framework/manager/UIMgr';

const { ccclass, property } = _decorator;

@ccclass('PreloadHall')
export class PreloadHall extends BaseNode {
    @property({ type: Sprite, displayName: '加载进度条' })
    sp_prog;
    @property({ type: Label, displayName: '当前资源加载进度' })
    lab_prog;

    private nProg: number = 0;

    afteronLoad(): void {
        game.on(GameEvent.HallLoaded, this.onHallLoaded, this);
    }

    Init(prog: number) {
        this.nProg = prog;
        this.sp_prog.fillRange = prog;
        this.lab_prog.string = `${Math.ceil(prog * 100)}%`;
    }

    start(): void {
        this.PreloadRes();
    }

    async PreloadRes() {
        await ConfigMgr.Ins.Init();
        GameResMgr.Ins.ReleaseBundle(EBundle.Config);
        this.nProg = 0.65;
        await GameResMgr.Ins.LoadBundle(EBundle.Hall);
        this.nProg = 0.72;
        await GameResMgr.Ins.PreloadPrefab(EBundle.Hall, UIPath.UIHall);
        this.nProg = 0.9;
        UIMgr.Ins.Open(UIPath.UIHall, EBundle.Hall, UIParent.UI);
    }

    onHallLoaded() {
        this.nProg = 1;
    }

    update(dt: number): void {
        if (this.sp_prog.fillRange >= 1) {
            this.node.destroy();
            return;
        }
        if (this.nProg <= this.sp_prog.fillRange) return;
        this.sp_prog.fillRange = Math.min(this.sp_prog.fillRange + dt, this.nProg);
        this.lab_prog.string = `${Math.ceil(this.sp_prog.fillRange * 100)}%`;
    }
}
