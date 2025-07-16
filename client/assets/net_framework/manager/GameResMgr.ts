import {
    _decorator,
    Node,
    instantiate,
    AssetManager,
    Prefab,
    assetManager,
    Texture2D,
    Asset,
    SpriteAtlas,
    Sprite,
    director,
    Tween,
    isValid,
    SpriteFrame,
} from 'cc';
import { Singleton } from '../base/Singleton';
import { EBundle } from '../const/GameEnum';
const { ccclass } = _decorator;

@ccclass('GameResMgr')
export class GameResMgr extends Singleton<GameResMgr>() {
    // 当前bundle资源
    private oBundleMap: Map<EBundle, AssetManager.Bundle>;
    // 缓存的图片列表
    private oCacheSpriteFames: Map<string, SpriteFrame>;
    // 图集列表
    private oPlistMap: Map<string, { bundle: EBundle; path: string; atlas: SpriteAtlas }>;

    constructor() {
        super();
        this.oPlistMap = new Map();
        this.oBundleMap = new Map<EBundle, AssetManager.Bundle>();
        this.oCacheSpriteFames = new Map();
    }
    /**
     * 获取bundle
     * @param bunleName 分包名称
     * @returns
     */
    async LoadBundle(bunleName: EBundle) {
        if (!this.oBundleMap.has(bunleName)) {
            try {
                let bunle = await new Promise<any>((resolve, reject) => {
                    assetManager.loadBundle(bunleName, (err, bundle) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(bundle);
                        }
                    });
                });
                this.oBundleMap.set(bunleName, bunle);
            } catch (error) {
                console.error('bundle加载失败: ', bunleName);
                return null;
            }
        }
        return this.oBundleMap.get(bunleName);
    }
    /**
     * 预加载
     * @param bundleName 所属分包
     * @param path 路径
     */
    async PreloadPrefab(bundleName: EBundle, path: string) {
        let bundle = await this.LoadBundle(bundleName);
        if (!bundle) return false;
        var succ = await new Promise<any>((resolve, reject) => {
            bundle.preload(path, Prefab, (err) => {
                if (err) {
                    console.error(`预制体加载失败: ${bundleName} - ${path}`);
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        });
        return succ;
    }
    /**
     * 加载预制体
     * @param bundleName
     * @param path
     */
    async LoadPrefab(bundleName: EBundle, path: string) {
        try {
            let bundle = await this.LoadBundle(bundleName);
            if (!bundle) return null;
            var prefab = await new Promise<any>((resolve, reject) => {
                bundle.load(path, Prefab, (err, prefab: Prefab) => {
                    if (err) {
                        console.error(`预制体加载失败: ${bundleName} - ${path}`);
                        reject(err);
                    } else {
                        resolve(prefab);
                    }
                });
            });
            return prefab;
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * 加载节点
     * @param bundleName
     * @param path
     */
    async LoadNode(bundleName: EBundle, path: string) {
        let prefab = await this.LoadPrefab(bundleName, path);
        return prefab ? instantiate(prefab) : null;
    }
    /**
     *
     * 加载图集
     * @param bundleName 分包
     * @param path 图集路径
     * @returns
     */
    async LoadPlist(bundleName: EBundle, path: string) {
        let plistKey = `${bundleName}_${path}`;
        if (this.oPlistMap.has(plistKey)) return this.oPlistMap.get(plistKey)?.atlas;
        try {
            let bundle = await this.LoadBundle(bundleName);
            // 加载 plist 文本
            const plist: SpriteAtlas = await new Promise<any>((resolve, reject) => {
                bundle.load(`${path}`, SpriteAtlas, (err, data) => {
                    err ? reject(err) : resolve(data);
                });
            });
            if (plist) this.oPlistMap.set(plistKey, { bundle: bundleName, path: path, atlas: plist });
            return plist;
        } catch (error) {
            console.error('plist加载失败', error);
            return null;
        }
    }
    /**
     * 更新图片纹理
     * @param sp 精灵
     * @param bundleName 所属分包
     * @param path 资源路径
     */
    async UpdateSpriteFrame(sp: Sprite, bundleName: EBundle, path: string) {
        if (this.oCacheSpriteFames.has(path)) {
            sp.spriteFrame = null;
            sp.spriteFrame = this.oCacheSpriteFames.get(path);
            return;
        }
        try {
            let bundle = await this.LoadBundle(bundleName);
            // 加载 plist 文本
            const frame = await new Promise<any>((resolve, reject) => {
                bundle.load(`${path}/spriteFrame`, (err, data) => {
                    err ? reject(err) : resolve(data);
                });
            });
            if (frame) {
                this.oCacheSpriteFames.set(path, frame);
                if (isValid(sp.node)) {
                    sp.spriteFrame = null;
                    sp.spriteFrame = frame;
                }
            }
        } catch (error) {
            console.error('plist加载失败', path, error);
        }
    }
    /**
     * 根据类型读取资源
     * @param bundleName 所属分包
     * @param path 资源路径
     * @param assetType 资源类型
     * @returns
     */
    async LoadAssetByType(bundleName: EBundle, path: string, assetType: any) {
        try {
            // 获取资源包
            let bundle = await this.LoadBundle(bundleName);
            if (!bundle) {
                console.error(`资源包加载失败: ${path}`);
                return null;
            }
            // 加载资源
            const asset = await new Promise<any>((resolve, reject) => {
                bundle.load(path, assetType, (err, data) => {
                    if (err) {
                        console.error(`加载资源失败: ${path}, 错误: ${err.message}`);
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
            return asset;
        } catch (error) {
            console.error('asset加载失败', error);
            return null;
        }
    }

    public async ReleasePrefab(bundleName: EBundle, path: string) {
        let bundle = await this.LoadBundle(bundleName);
        bundle?.release(path);
    }

    public async ReleaseAllPlist() {
        for (const [key, obj] of this.oPlistMap) {
            let bundle = await this.LoadBundle(obj.bundle);
            bundle?.release(obj.path);
        }
        this.oPlistMap = new Map();
    }
    /**
     * 释放bundle
     * @param bundleName
     */
    ReleaseBundle(bundleName: EBundle) {
        if (!this.oBundleMap.has(bundleName)) return;
        let bundle = this.oBundleMap.get(bundleName);
        this.oBundleMap.delete(bundleName);
        bundle.releaseAll();
        assetManager.removeBundle(bundle);
    }
}
