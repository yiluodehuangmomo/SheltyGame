import { _decorator, AssetManager, assetManager, Component, director, instantiate, Label, Prefab, Sprite } from 'cc';

const NeedLoadBundles = [
    { name: 'net_framework', prog: 0.3 },
    { name: 'net_hall', prog: 0.45 },
];

const { ccclass, property } = _decorator;
/**
 * 加载资源
 */
@ccclass('UIWelcome')
export class UIWelcome extends Component {
    @property({ type: Sprite, displayName: '加载进度条' })
    sp_prog;
    @property({ type: Label, displayName: '当前资源加载进度' })
    lab_prog;

    private nProg: number = 0;

    protected onLoad(): void {
        this.sp_prog.fillRange = 0;
        this.lab_prog.string = '0%';
        this.nProg = 0;
    }

    protected start(): void {
        this.LoadBundle(0);
    }

    LoadBundle(idx: number) {
        if (idx >= NeedLoadBundles.length) {
            this.PreloadUI();
            return;
        }
        let info = NeedLoadBundles[idx];
        this.nProg = info.prog;
        var self = this;
        assetManager.loadBundle(info.name, (err, bundle) => {
            if (err) {
                console.error(err);
                return;
            }
            console.warn(`分包加载成功: ${bundle.name}`);
            self.LoadBundle(idx + 1);
        });
    }

    PreloadUI() {
        // this.nProg = 1;
        // assetManager.loadBundle('net_hall', (err, bundle: AssetManager.Bundle) => {
        //     bundle.load('main', (err: Error, sceneAsset: any) => {
        //         director.loadScene('main', (error) => {});
        //     });
        // });
        var self = this;
        assetManager.loadBundle('net_hall', (err, bundle: AssetManager.Bundle) => {
            bundle.load('prefab/comp/PreloadHall', Prefab, (err, prefab) => {
                let node = instantiate(prefab);
                (node.getComponent('PreloadHall') as any).Init(this.nProg);
                node.setPosition(self.node.position.x, self.node.position.y);
                node.parent = self.node.parent;
                self.node.destroy();
            });
        });
    }

    protected update(dt: number): void {
        if (this.nProg <= this.sp_prog.fillRange) return;
        this.sp_prog.fillRange = Math.min(this.sp_prog.fillRange + dt, this.nProg);
        this.lab_prog.string = `${Math.ceil(this.sp_prog.fillRange * 100)}%`;
    }
}
