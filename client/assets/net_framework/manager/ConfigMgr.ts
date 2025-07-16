import { _decorator, Asset, BufferAsset, JsonAsset } from 'cc';
import { Singleton } from '../base/Singleton';
import { EBundle } from '../const/GameEnum';
import { GameResMgr } from './GameResMgr';
import { EConfig } from '../const/ConfigEnum';
import JSZip from 'jszip';
const { ccclass } = _decorator;

@ccclass('ConfigMgr')
export class ConfigMgr extends Singleton<ConfigMgr>() {
    private oDataMap: Map<string, any>;
    private oKeyMap: Map<string, string[]>;

    async Init() {
        try {
            let bundle = await GameResMgr.Ins.LoadBundle(EBundle.Config);
            var zipAsset = await new Promise<BufferAsset>((resolve, reject) => {
                bundle.load('data', (err, bufferAsset: BufferAsset) => {
                    if (err) {
                        console.error('加载文件夹失败:', err);
                        reject(err); // 报告错误
                        return;
                    }
                    resolve(bufferAsset); // 返回 assets
                });
            });
            let arrayBuffer = zipAsset.buffer();
            if (!arrayBuffer) {
                console.error('ZIP文件格式不支持');
                return;
            }
            console.log(Date.now());
            const zip = await JSZip.loadAsync(arrayBuffer);
            console.log(Date.now());
            this.oDataMap = new Map<string, any>();
            this.oKeyMap = new Map<string, string[]>();
            const loadPromises: Promise<void>[] = [];
            for (const filename in zip.files) {
                const file = zip.files[filename];
                const jsonName = file.name.substring(0, file.name.indexOf('.'));
                // console.log(jsonName);
                if (!file.dir && filename.endsWith('.json')) {
                    const promise = file.async('string').then((text) => {
                        try {
                            const jsonData = JSON.parse(text);
                            this.oKeyMap.set(jsonName, jsonData.key);
                            this.oDataMap.set(jsonName, jsonData.value);
                        } catch (e) {
                            console.warn(`解析 JSON 失败: ${filename}`, e);
                        }
                    });
                    loadPromises.push(promise);
                }
            }
            await Promise.all(loadPromises);
            console.log(Date.now());
        } catch (error) {}
    }
    /**
     * 是否存在
     * @param type
     */
    Exist(type: EConfig): boolean {
        return this.oKeyMap.has(type);
    }
    /**
     * 获取某一行配置
     * @param type 表
     * @param key 主键
     * @returns
     */
    GetLine<E>(type: EConfig, key: number): E {
        if (!this.oKeyMap.has(type) || !this.oDataMap.has(type)) return null;
        let data = this.oDataMap.get(type).find((obj) => {
            return obj[0] == key;
        });
        if (!data) return null;
        let keys = this.oKeyMap.get(type);
        let dataObj = {};
        for (let i = 0; i < keys.length; i++) {
            dataObj[keys[i]] = data[i];
        }
        return dataObj as E;
    }
    /**
     * 根据列名匹配值，获取一行配置
     * @param type
     * @param colName
     * @param colVal
     */
    GetLineByCol<E>(type: EConfig, colName: string, colVal: any) {
        if (!this.oKeyMap.has(type) || !this.oDataMap.has(type)) return null;
        // 列下标
        let colIdx = this.oKeyMap.get(type).findIndex((obj) => {
            return obj == colName;
        });
        let data = this.oDataMap.get(type).find((obj) => {
            return obj[colIdx] == colVal;
        });
        if (!data) return null;
        let keys = this.oKeyMap.get(type);
        let dataObj = {};
        for (let i = 0; i < keys.length; i++) {
            dataObj[keys[i]] = data[i];
        }
        return dataObj as E;
    }
}
