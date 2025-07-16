import { _decorator, Node, instantiate, Prefab, find, isValid, Tween, tween, v3, Layers } from 'cc';
import { Singleton } from '../base/Singleton';
import { EBundle, UIParent } from '../const/GameEnum';
import { GameResMgr } from './GameResMgr';
import { GameGlobal, UIPath } from '../const/GameGlobal';
import { ObjectPoolManager } from './ObjectPoolManager';
// import { NodeTip } from '../../net_hall/code/common/NodeTip';
const { ccclass } = _decorator;

@ccclass('UIMgr')
export class UIMgr extends Singleton<UIMgr>() {
    private oDisplayMap: Map<string, Node>;
    /** 当前显示的所有视图 */
    private oUIMap: Map<string, Node>;

    constructor() {
        super();
        this.oDisplayMap = new Map<string, Node>();
        this.oUIMap = new Map<string, Node>();
    }
    /**
     * 获取显示层级
     * @param type
     */
    GetDisplay(type: UIParent) {
        if (!this.oDisplayMap.has(type)) {
            let tempNode = find(`Canvas/node_container/${type}`);
            if (!tempNode) return null;
            this.oDisplayMap.set(type, tempNode);
        }
        return this.oDisplayMap.get(type);
    }

    /**
     * 打开视图
     * @param path 视图路径
     * @param bundle 所属分包
     * @param parent 显示层级
     * @param params 传递参数
     */
    async Open(path: string, bundle: EBundle, parent: UIParent, params?: any) {
        let key = `${bundle}_${path}`;
        if (this.oUIMap.has(key)) {
            if (isValid(this.oUIMap.get(key))) {
                let uiNode = this.oUIMap.get(key);
                uiNode.active = true;
                (uiNode.getComponent(uiNode.name) as any)?.onShow(params);
                return uiNode;
            } else {
                this.oUIMap.delete(key);
            }
        }

        let prefab = await GameResMgr.Ins.LoadPrefab(bundle, path);
        if (!prefab) return null;
        let node: Node = instantiate(prefab);
        node.parent = this.GetDisplay(parent);
        (node.getComponent(node.name) as any)?.onShow(params);
        this.oUIMap.set(key, node);
        return node;
    }
    /**
     * 隐藏视图
     * @param path 路径
     * @param bundle 分包
     * @returns
     */
    Hide(path: string, bundle: EBundle) {
        let key = `${bundle}_${path}`;
        if (!this.oUIMap.has(key)) return;
        this.oUIMap.get(key).active = false;
    }
    /**
     * 根据节点名称隐藏UI
     * @param nodeName
     */
    HideByName(nodeName: string) {
        for (const [key, node] of this.oUIMap) {
            if (node.name == nodeName) {
                node.active = false;
            }
        }
    }
    /**
     * 关闭视图（销毁）
     * @param path 路径
     * @param bundle 分包
     * @returns
     */
    Close(path: string, bundle: EBundle) {
        let key = `${bundle}_${path}`;
        if (!this.oUIMap.has(key)) return;
        this.oUIMap.get(key).destroy();
        this.oUIMap.delete(key);
    }
    /**
     * 根据节点名称关闭视图（销毁）
     * @param nodeName
     */
    CloseByName(nodeName: string) {
        for (const [key, node] of this.oUIMap) {
            if (node.name == nodeName) {
                node.destroy();
                this.oUIMap.delete(key);
                break;
            }
        }
    }
    /**
     * 关闭所有视图
     */
    CloseAll() {
        for (const [key, node] of this.oUIMap) {
            node.destroy();
        }
        this.oUIMap = new Map<string, Node>();
    }
    /**
     * 关闭所有视图（排除传入的,名称or节点）
     * @param excludeName
     */
    CloseAllExclude(exclude: string | Node) {
        for (const [key, node] of this.oUIMap) {
            if (exclude instanceof Node ? node != exclude : node.name != exclude) {
                node.destroy();
                this.oUIMap.delete(key);
            }
        }
    }
    /** 关闭某个层的所有视图 */
    CloseAllByUIParent(parent: UIParent) {
        let parentNode = this.GetDisplay(parent);
        for (const [key, node] of this.oUIMap) {
            if (node.parent == parentNode) {
                node.destroy();
                this.oUIMap.delete(key);
            }
        }
    }
    /**
     * 显示加载(避免卡死，最多30秒自动关闭)
     * @param tip
     */
    ShowLoading(tip?: string) {
        this.Open(UIPath.UILoading, EBundle.Hall, UIParent.Loading, tip);
    }
    /**
     * 关闭加载
     */
    CloseLoading() {
        this.Hide(UIPath.UILoading, EBundle.Hall);
    }
    /**
     * 显示提示信息
     * @param tip
     */
    async ShowTip(tip: string) {
        let parentNode = this.GetDisplay(UIParent.Tip);
        // 位移之前的
        for (let i = 0; i < parentNode.children.length; i++) {
            let node = parentNode.children[i];
            let posY = GameGlobal.TipNodeInitialPosY + (parentNode.children.length - i) * GameGlobal.TipNodeSpaceY;
            Tween.stopAllByTarget(node);
            tween(node)
                .to(0.3, { position: v3(0, posY, 0) })
                .start();
        }
        let tipNode = await ObjectPoolManager.Ins.getNodeByPath(EBundle.Hall, 'NodeTip', `prefab/common/NodeTip`, parentNode);
        tipNode.setPosition(0, GameGlobal.TipNodeInitialPosY);
        (tipNode.getComponent('NodeTip') as any).Init(tip);
    }

    /** 将某个节点以及子节点设置为某个layer */
    SetLayerRecursively(node: Node, layer: number) {
        node.layer = layer;
        for (const child of node.children) {
            this.SetLayerRecursively(child, layer);
        }
    }
    /** 根据名称获取layer */
    getLayerByName(layerName: string): number {
        const index = Layers.nameToLayer(layerName);
        if (index === -1) {
            console.warn(`找不到 Layer 名称: ${layerName}`);
            return Layers.Enum.DEFAULT; // 默认返回 DEFAULT 层
        }
        return 1 << index;
    }
}
