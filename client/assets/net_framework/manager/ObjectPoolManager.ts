import { _decorator, Node, isValid, instantiate, Prefab } from 'cc';
import { Singleton } from '../base/Singleton';
import { EBundle } from '../const/GameEnum';
import { GameResMgr } from './GameResMgr';
const { ccclass } = _decorator;

@ccclass('ObjectPoolManager')
export class ObjectPoolManager extends Singleton<ObjectPoolManager>() {
    private pools: Map<string, Node[]> = new Map();
    private _prefabRefs: Map<string, { prefab: Prefab | null; refCount: number }> = new Map();
    private poolPathMap: Map<string, string> = new Map();
    private defaultMaxPoolSize: number = 20;
    private loadingLocks: Map<string, Promise<Prefab>> = new Map();

    private cleanIntervalId: number | null = null;

    protected onInit(): void {
        this.cleanIntervalId = setInterval(() => this._cleanAllPools(), 30000);
    }

    public Init() {
        this.pools = new Map();
        this._prefabRefs = new Map();
        this.poolPathMap = new Map();
        this.loadingLocks = new Map();
    }

    public async getNodeByPath(bundleName: EBundle, poolName: string, path: string, parent: Node, bShow: boolean = true): Promise<Node | null> {
        if (!isValid(parent)) {
            console.warn(`[Pool] Invalid parent node for pool: ${poolName}`);
            return null;
        }

        try {
            // 清理失效节点
            // this.clearPool(poolName);

            // 更新路径映射并获取最终路径
            const finalPath = await this._updatePathMapping(poolName, path);
            if (!finalPath) return null;

            // 安全获取预制体
            const prefab = await this._safeGetPrefab(bundleName, finalPath);
            if (!prefab) return null;

            // 获取或创建节点
            const node = await this._getOrCreateNode(poolName, prefab);
            if (!node) return null;

            // 配置节点
            this._setupNode(node, parent, bShow);
            return node;
        } catch (error) {
            console.error(`[Pool] Error getting node ${poolName}:`, error);
            return null;
        }
    }

    public recycleNode(poolName: string, node: Node): void {
        if (!isValid(node)) {
            // console.warn(`[Pool] Trying to recycle invalid node: ${poolName}`);
            return;
        }

        const currentPath = this.poolPathMap.get(poolName);
        if (!currentPath) {
            // console.warn(`[Pool] Path mapping not found for: ${poolName}`);
            node.destroy();
            return;
        }

        // 减少引用计数
        this._decreaseRefCount(currentPath);

        // 回收或销毁节点
        this._recycleOrDestroyNode(poolName, node);
    }

    public clearPool(poolName: string): void {
        if (this.pools.has(poolName)) {
            this.pools.get(poolName)?.forEach((n) => isValid(n) && n.destroy());
            this.pools.delete(poolName);
            this._cleanupResource(poolName);
        }
    }

    public clearAllPools(): void {
        this.pools.forEach((_, name) => this.clearPool(name));
    }

    // 私有方法
    private async _updatePathMapping(poolName: string, path: string): Promise<string | null> {
        if (!this.poolPathMap.has(poolName)) {
            this.poolPathMap.set(poolName, path);
        }
        return this.poolPathMap.get(poolName) || null;
    }

    private async _safeGetPrefab(bundleName: EBundle, path: string): Promise<Prefab | null> {
        // 检查现有缓存
        const cached = this._prefabRefs.get(path);
        if (cached?.prefab && isValid(cached.prefab)) {
            cached.refCount++;
            return cached.prefab;
        }

        // 处理重复加载请求
        if (this.loadingLocks.has(path)) {
            return this.loadingLocks.get(path)!;
        }

        try {
            const loadPromise = GameResMgr.Ins.LoadPrefab(bundleName, path);
            this.loadingLocks.set(path, loadPromise);

            const prefab = await loadPromise;
            if (!prefab) {
                throw new Error(`Failed to load prefab: ${path}`);
            }

            this._prefabRefs.set(path, {
                prefab: prefab,
                refCount: 1,
            });
            return prefab;
        } catch (error) {
            console.error(`[Pool] Prefab load failed: ${path}`, error);
            return null;
        } finally {
            this.loadingLocks.delete(path);
        }
    }

    private async _getOrCreateNode(poolName: string, prefab: Prefab): Promise<Node | null> {
        const pool = this.pools.get(poolName) || [];
        if (pool.length > 0) {
            const node = pool.pop()!;
            if (isValid(node)) return node;
            return this._getOrCreateNode(poolName, prefab); // 递归获取有效节点
        }
        return instantiate(prefab);
    }

    private _setupNode(node: Node, parent: Node, active: boolean): void {
        node.parent = parent;
        node.active = active;
        if (!node.isValid) {
            throw new Error('Created invalid node!');
        }
    }

    private _decreaseRefCount(path: string): void {
        const entry = this._prefabRefs.get(path);
        if (entry) {
            entry.refCount = Math.max(0, entry.refCount - 1);

            if (entry.refCount <= 0) {
                this._releaseResource(path);
            }
        }
    }

    private _releaseResource(path: string): void {
        const bundleName = this._findBundleNameByPath(path);
        if (bundleName) {
            GameResMgr.Ins.ReleasePrefab(bundleName, path);
        }
        this._prefabRefs.delete(path);

        // 清理关联的路径映射
        this.poolPathMap.forEach((value, key) => {
            if (value === path) {
                this.poolPathMap.delete(key);
                this.pools.delete(key);
            }
        });
    }

    private _findBundleNameByPath(path: string): EBundle | null {
        // 这里假设你有某种方式可以根据路径找到对应的 bundleName
        // 目前简单返回 null，你需要根据实际情况实现
        return null;
    }

    private _recycleOrDestroyNode(poolName: string, node: Node): void {
        const pool = this.pools.get(poolName) || [];
        if (pool.length < this.defaultMaxPoolSize) {
            node.parent = null;
            node.active = false;
            pool.push(node);
            this.pools.set(poolName, pool);
        } else {
            node.destroy();
        }
    }

    private _cleanAllPools(): void {
        this.pools.forEach((nodes, poolName) => {
            // 清理无效节点
            const validNodes = nodes.filter((n) => isValid(n));
            this.pools.set(poolName, validNodes);

            // 清理空池
            if (validNodes.length === 0) {
                this.pools.delete(poolName);
                this.poolPathMap.delete(poolName);
            }
        });
    }

    private _cleanupResource(poolName: string): void {
        const path = this.poolPathMap.get(poolName);
        if (path) {
            const entry = this._prefabRefs.get(path);
            if (entry && entry.refCount <= 0) {
                this._releaseResource(path);
            }
        }
    }

    public ReleaseAll() {
        if (this.cleanIntervalId) {
            clearInterval(this.cleanIntervalId);
            this.cleanIntervalId = null;
        }
        this.clearAllPools();
        ObjectPoolManager.clearInstance();
    }

    // 调试方法
    public debugMemoryStatus(): void {
        console.log('=== Memory Status ===');
        console.log('Active Pools:', this.pools.size);
        console.log('Cached Prefabs:', this._prefabRefs.size);

        let totalNodes = 0;
        this.pools.forEach((pool) => (totalNodes += pool.length));
        console.log('Total Cached Nodes:', totalNodes);

        console.log('Path Mappings:', this.poolPathMap.size);
        console.log('=====================');
    }
}
