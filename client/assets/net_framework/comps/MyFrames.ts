import { _decorator, Color, Component, Rect, Sprite, SpriteAtlas, SpriteFrame, UITransform, v3 } from 'cc';
import { ObjectPoolManager } from '../manager/ObjectPoolManager';
import { ConfigMgr } from '../manager/ConfigMgr';
import { EConfig } from '../const/ConfigEnum';
import { GameGlobal } from '../const/GameGlobal';
import { GameResMgr } from '../manager/GameResMgr';
import { EBundle } from '../const/GameEnum';
import { IKnivesFrameAnimation } from '../model/interface/ConfigInterface';

const { ccclass, property } = _decorator;
@ccclass('MyFrames')
export default class MyFrames extends Component {
    @property({ type: Sprite, displayName: '精灵' })
    sp;
    /** 运行中 */
    private Running: boolean = false;
    /** 当前帧下标 */
    private FrameIdx: number = 0;
    /** 是否需要删除 */
    public NeedRemoveOnEnd: boolean = true;

    /** 帧动画集合 */
    private oFrames: Map<string, SpriteFrame>;
    /** 当前plist资源 */
    private oFrameAtlas: SpriteAtlas;
    /** 初始化的回调 */
    private oInitCallFunc: any;
    /** 播放结束的回调 */
    private oPlayendCallFunc: any;

    /** 动画播放时间间隔 */
    private nTimeSpace: number = 0;
    private nNowTimeSpace: number = 0;

    public Config: IKnivesFrameAnimation;
    // 默认的帧序列
    private oFrameSeq: any;

    // 变色颜色
    private oChangeColor: Color = new Color(255, 48, 48, 255);
    // 剩余帧数
    private nChangeColorLastF: number = -1;

    protected onEnable(): void {
        this.sp.color = Color.WHITE;
    }

    InitById(frameId: number, callFunc?: any) {
        let cfg = ConfigMgr.Ins.GetLine(EConfig.KnivesFrameAnimation, frameId);
        if (cfg) this.Init(cfg, callFunc);
    }

    Init(frameConfig: any, callFunc?: any) {
        this.oInitCallFunc = callFunc;
        this.Config = JSON.parse(JSON.stringify(frameConfig));
        this.oFrameSeq = JSON.parse(JSON.stringify(this.Config.Seq));
        this.sp.spriteFrame = null;
        // 初始化节点锚点
        this.node.getComponent(UITransform).anchorX = this.Config.AnchorX;
        this.node.getComponent(UITransform).anchorY = this.Config.AnchorY;
        this.sp.node.getComponent(UITransform).anchorX = this.Config.AnchorX;
        this.sp.node.getComponent(UITransform).anchorY = this.Config.AnchorY;
        this.sp.node.setPosition(0, 0);
        // 初始化缩放级别
        this.sp.type = frameConfig.isTiled == 1 ? Sprite.Type.TILED : Sprite.Type.SLICED;
        if (frameConfig.isTiled != 1) {
            // 非平铺类型
            this.sp.type = Sprite.Type.SIMPLE;
            this.sp.node.scale = v3(this.Config.ScaleX, this.Config.ScaleY, 1);
        }
        this.FrameIdx = 0;
        this.nTimeSpace = this.nNowTimeSpace = 1 / this.Config.Framerate;

        if (GameGlobal.UsePlist) {
            this.InitAtlas();
        } else {
            this.InitFrame();
        }
        // 是否显示碰撞盒
        let maskNode = this.node.getChildByName('mask');
        if (maskNode) maskNode.active = GameGlobal.Debug.CanShowCollisionBox;
    }
    /** 更新碰撞盒大小 */
    UpdateSize(size: number[]) {
        this.node.getComponent(UITransform).width = size[0];
        this.node.getComponent(UITransform).height = size[1] || size[0];
    }
    UpdateScale(scaleX: number, scaleY: number) {
        this.sp.node.scale = v3(scaleX, scaleX, 1);
    }
    /** 重新播放 */
    ResPlay(playCallFunc?: any) {
        if (playCallFunc) this.oPlayendCallFunc = playCallFunc;
        this.Running = true;
        this.nNowTimeSpace = this.nTimeSpace;
        this.FrameIdx = 0;
        this.changeFrame();
    }
    /** 重置到第一帧 */
    Reset() {
        this.Config.Seq = JSON.parse(JSON.stringify(this.oFrameSeq));
        this.nNowTimeSpace = this.nTimeSpace;
        this.FrameIdx = 0;
        this.changeFrame();
        this.Running = false;
    }

    onInited() {
        this.Running = true;
        if (this.oInitCallFunc) {
            this.oInitCallFunc();
            this.oInitCallFunc = null;
        }
    }

    InitAtlas = async () => {
        this.oFrameAtlas = await GameResMgr.Ins.LoadPlist(EBundle.Battle, `imgs/plist/${this.Config.dir}`);
        if (!this.oFrameAtlas) return;
        this.Running = true;
        this.onInited();
    };

    InitFrame = async () => {
        // if ((this.oFrames?.size ?? 0) > 0) {
        //     this.onInited();
        //     return;
        // }
        // this.oFrames = new Map<string, SpriteFrame>();
        // var dirPath = `${BattleGlobal.FrameDir}${this.Config.dir}`;
        // let bundle = await BattleResMgr.Ins.GetBundle();
        // var asserts = await new Promise<any>((resolve, reject) => {
        //     bundle.loadDir(dirPath, (err, asserts) => {
        //         if (err) {
        //             console.error(`文件夹失败: ${dirPath}`);
        //             reject(err);
        //         } else {
        //             resolve(asserts);
        //         }
        //     });
        // });
        // if (!asserts) {
        //     console.error('------->> 找不到图集', this.Config.dir);
        //     return;
        // }
        // for (let i = 0; i < asserts.length; i++) {
        //     if (asserts[i] instanceof SpriteFrame) {
        //         this.oFrames.set(asserts[i].name, asserts[i] as SpriteFrame);
        //     }
        // }
        // this.onInited();
    };

    private changeFrame() {
        if (!this.oFrameAtlas) return;
        let frameGroup = this.Config.Seq[0][0];
        let frameName = `${this.Config.Prefix}_${frameGroup[this.FrameIdx]}`;
        let frame = GameGlobal.UsePlist ? this.oFrameAtlas.getSpriteFrame(frameName) : this.oFrames.get(frameName);
        if (frame) {
            this.sp.spriteFrame = frame;
            this.sp.node.getComponent(UITransform).setContentSize(frame.rect.width, frame.rect.height);
        } else {
            console.error('帧图片不存在: ', frameName);
        }
    }
    /**
     * 变色
     * @param duration 持续时间 - 帧数
     * @param color 颜色
     */
    public Discolor(duration: number, color?: Color) {
        if (this.nChangeColorLastF >= 0) return;
        this.nChangeColorLastF = duration;
        if (color) this.oChangeColor = color;
    }
    /** 获取第一帧大小 */
    public get FrameSize(): Rect {
        if (GameGlobal.UsePlist) {
            return this.oFrameAtlas.spriteFrames[0]?.rect;
        }
        let frame = this.oFrames.size > 0 ? this.oFrames.values().next().value : null;
        return frame?.rect;
    }

    update(deltaTime: number): void {
        if (this.nChangeColorLastF >= 0) {
            if (this.nChangeColorLastF <= 0) {
                this.sp.color = Color.WHITE;
            } else {
                this.sp.color = this.oChangeColor;
            }
            this.nChangeColorLastF--;
        }

        if (!this.Running) return;
        this.nNowTimeSpace -= deltaTime;
        if (this.nNowTimeSpace > 0) return;

        let frameGroup = this.Config.Seq[0];
        this.nNowTimeSpace = this.nTimeSpace;
        this.FrameIdx++;
        if (frameGroup && this.FrameIdx >= frameGroup[0].length) {
            if (frameGroup[1] >= 0) frameGroup[1]--;
            this.FrameIdx = 0;
            if (frameGroup[1] == 0) {
                // 切换到下一组
                this.Config.Seq.shift();
                if (this.Config.Seq.length < 1) {
                    // 已经结束
                    this.onEnd();
                    return;
                }
            }
        }
        this.changeFrame();
    }

    public onEnd() {
        this.Running = false;
        if (this.NeedRemoveOnEnd) {
            this.Remove();
        } else {
            if (this.oPlayendCallFunc) this.oPlayendCallFunc();
            this.oPlayendCallFunc = null;
            this.Reset();
        }
    }

    Remove() {
        this.sp.spriteFrame = null;
        ObjectPoolManager.Ins.recycleNode(this.node.name, this.node);
    }
}
