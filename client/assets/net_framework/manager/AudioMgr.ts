import { _decorator, Node, AudioSource, AudioClip, AssetManager, assetManager } from 'cc';
import { Singleton } from '../base/Singleton';
const { ccclass } = _decorator;

const AudioBundle = 'mainHall';
const AudioPath = 'Audio/Sound/battle/';
const BGMPath = 'Audio/Music/battle/';

enum SoundType {
    BGM = 'bgm',
    SFX = 'sfx',
}

@ccclass('AudioMgr')
export class AudioMgr extends Singleton<AudioMgr>() {
    private _audioCache = new Map<string, AudioClip>();
    private _assetBundle: AssetManager.Bundle | null = null;
    private _loadingQueue: string[] = [];
    private _maxConcurrentLoads = 5; // 减少并发加载数量
    private _currentLoads = 0;
    private _bgmAudioSource: AudioSource | null = null;
    private _currentBGMPath: string | null = null;

    async Init() {
        try {
            this._assetBundle = await new Promise<AssetManager.Bundle>((resolve, reject) => {
                assetManager.loadBundle(AudioBundle, (err, bundle) => {
                    err ? reject(err) : resolve(bundle!);
                });
            });
        } catch (error) {
            console.error('[Audio] Bundle加载失败:', error);
        }
    }

    async PreloadAllSounds() {
        try {
            const asserts = await new Promise<any>((resolve, reject) => {
                if (!this._assetBundle) {
                    reject(new Error('Asset bundle is not loaded.'));
                    return;
                }
                this._assetBundle.loadDir(`Audio/Sound/battle`, (err, asserts) => {
                    if (err) {
                        console.error(`音效文件加载失败`, err);
                        reject(null);
                    } else {
                        resolve(asserts);
                    }
                });
            });
            if (!asserts) return;
            for (let i = 0; i < asserts.length; i++) {
                if (asserts[i] instanceof AudioClip) {
                    let fullPath = `${AudioPath}${asserts[i].name}`;
                    console.log(fullPath);
                    this._audioCache.set(fullPath, asserts[i]);
                }
            }
        } catch (error) {
            console.error('PreloadAllSounds error:', error);
        }
    }

    private async _processLoadingQueue() {
        while (this._loadingQueue.length > 0 && this._currentLoads < this._maxConcurrentLoads) {
            const path = this._loadingQueue.shift()!;
            this._currentLoads++;
            try {
                await this._loadClip(path);
            } catch (error) {
                console.error(`Error loading audio from queue: ${path}`, error);
            } finally {
                this._currentLoads--;
                if (this._loadingQueue.length > 0) {
                    await this._processLoadingQueue();
                }
            }
        }
    }

    async playSFX(path: string, volume: number = 1.0) {
        if (!path || !this._assetBundle) return;
        if (volume <= 0) return;
        const fullPath = `${AudioPath}${path}`;
        const clip = await this._loadClip(fullPath);
        if (!clip) return;

        const audioNode = new Node('TempAudioSource');
        const audioSource = audioNode.addComponent(AudioSource);
        audioSource.playOneShot(clip, volume);

        // 音频播放结束后销毁节点
        const checkInterval = setInterval(() => {
            if (!audioSource.playing) {
                clearInterval(checkInterval);
                audioNode.destroy();
            }
        }, 100);
    }

    async playBGM(path: string, volume: number = 1.0) {
        if (!path || !this._assetBundle) return;
        if (volume <= 0) return;

        const fullPath = `${BGMPath}${path}`;
        const clip = await this._loadClip(fullPath);
        if (!clip) return;
        if (!this._bgmAudioSource) {
            const audioNode = new Node('BGMAudioSource');
            this._bgmAudioSource = audioNode.addComponent(AudioSource);
            this._bgmAudioSource.loop = true;
        }
        if (this._currentBGMPath !== fullPath) {
            this._bgmAudioSource.stop();
            this._bgmAudioSource.clip = clip;
            this._currentBGMPath = fullPath;
        }
        this._bgmAudioSource.volume = volume;
        this._bgmAudioSource.play();
    }

    stopBGM() {
        if (this._bgmAudioSource) {
            this._bgmAudioSource.stop();
            this._currentBGMPath = null;
        }
    }

    private async _loadClip(path: string): Promise<AudioClip | null> {
        if (this._audioCache.has(path)) {
            return this._audioCache.get(path)!;
        }

        try {
            const clip = await new Promise<AudioClip | null>((resolve) => {
                if (!this._assetBundle) {
                    resolve(null);
                    return;
                }
                console.log(`开始加载音频: ${path}`);
                this._assetBundle.load(path, AudioClip, (err, asset) => {
                    if (err) {
                        console.error(`音频加载失败: ${path}`, err);
                        resolve(null);
                    } else {
                        console.log(`成功加载音频: ${path}`);
                        this._audioCache.set(path, asset);
                        resolve(asset);
                    }
                });
            });
            return clip;
        } catch (error) {
            console.error(`加载音频时出现异常: ${path}`, error);
            return null;
        }
    }

    async releaseAll() {
        // 停止 BGM
        this.stopBGM();

        // 等待所有加载请求完成
        while (this._currentLoads > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // 释放音频资源
        this._audioCache.forEach((clip, path) => {
            if (this._assetBundle) {
                this._assetBundle.release(path);
            }
            clip.destroy();
        });
        this._audioCache.clear();

        // 释放 BGM AudioSource 节点
        if (this._bgmAudioSource) {
            this._bgmAudioSource.node.destroy();
            this._bgmAudioSource = null;
        }
    }
}
