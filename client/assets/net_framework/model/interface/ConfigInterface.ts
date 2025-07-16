export interface IKnives {
 /** 主键 */
 id: number;
 /** - */
 knivesId: number;
 /** - */
 baseAttr: any;
 /** 武器旋转半径（像素） */
 knivesLength: number;
 /** 碰撞区域大小 */
 colliderSize: any;
 /** 武器资源文件名 */
 knivesResPath: string;
 /** 武器图标 */
 knivesIconResPath: string;
 /** 稀有度备注 */
 des: string;
 /** 武器名 */
 des1: string;
 /** 耐久 */
 des2: string;
 /** 攻击 */
 des3: string;
}
export interface IKnivesAttribute {
 /** 主键 */
 id: number;
 /** 图标 */
 attrIcon: string;
 /** 引用时的名称 */
 define: string;
 /** 初始值 */
 initValue: number;
 /** 最大值 */
 maxValue: number;
 /** - */
 proName: string;
 /** 类型 */
 numType: number;
 /** - */
 des1: string;
 /** - */
 des2: string;
}
export interface IKnivesChapter {
 /** 主键 */
 id: number;
 /** 前置关卡 */
 PreLvDungeon: number;
 /** 名字 */
 name: string;
 /** 主地图素材ID */
 map: string;
 /** 主地图构成（像素） */
 mapMade: any;
 /** 隐藏地图入口坐标 */
 hideMapDoor: any;
 /** 隐藏地图 */
 hideMap: string;
 /** 隐藏地图构成（像素） */
 hideMapMade: any;
 /** 通关奖励 */
 awards: any;
 /** 消耗体力 */
 power: any;
 /** 初始武器 */
 weapon: number;
 /** 掉落物数量上限 */
 dropLimit: number;
 /** 掉落物添加间隔(毫秒) */
 dropAddSpace: number;
 /** 掉落物数量(A到B之间随机) */
 dropCount: any;
 /** 固定掉落物位置 */
 drops: any;
 /** BOSS的ID（44个） */
 monster_id: any;
 /** BOSS对应出场初始坐标（44个） */
 monster_pos: any;
 /** BOSS对应的武器以及数量 */
 monster_weapon: any;
 /** 障碍物贴图 */
 obstaclePic: any;
 /** 障碍物血量 */
 obstacleHp: any;
 /** 障碍物坐标 */
 obstaclePos: any;
 /** 小怪ID,每批随机 */
 monsterIds: any;
 /** 战斗开始多少秒后开始出小怪 */
 startShowMonsterTime: number;
 /** 出小怪间隔 */
 sendMonsterSpace: any;
 /** 一批小怪数量 */
 sendMonsterCount: any;
}
export interface IKnivesCommon {
 /** 主键 */
 id: number;
 /** 数据 */
 Value: any;
}
export interface IKnivesDrop {
 /** 主键 */
 id: number;
 /** 名字 */
 name: string;
 /** 类型（1=武器,2=属性） */
 type: number;
 /** 增加属性 */
 addAttr: any;
 /** 资源名称 */
 res: string;
}
export interface IKnivesEnemy {
 /** 主键 */
 id: number;
 /** 名字 */
 name: string;
 /** 类型（1=小怪，2=精英，3=Boss） */
 type: number;
 /** 基础属性 */
 baseAttr: any;
 /** 动画ID */
 animation: number;
 /** 资源名称 */
 defaultAvatar: string;
 /** 动作名&总帧数（从第0帧开始） */
 action: any;
 /** 移动速度（一秒60帧移动多少像素） */
 moveSpeed: number;
 /** 放缩系数 */
 bodyScale: number;
 /** 场景掉落(id,数量，概率万分比)，id999=攻速+100；id998=攻击+100；id997=转速+20% */
 sceneDrop: any;
 /** 初始拥有的刀与数量下限，数量上限 */
 knives: any;
 /** 稀有度 */
 des1: string;
 /** - */
 des2: string;
 /** 武器id */
 des3: string;
}
export interface IKnivesFrameAnimation {
 /** 主键 */
 id: number;
 /** 目录 */
 dir: string;
 /** 资源命名 */
 Prefix: string;
 /** 拖尾类型（颜色，透明度，宽度，高度） */
 TrailSource: any;
 /** X轴锚点 */
 AnchorX: number;
 /** Y轴锚点 */
 AnchorY: number;
 /** 缩放级别X */
 ScaleX: number;
 /** 缩放级别Y */
 ScaleY: number;
 /** 帧率 */
 Framerate: number;
 /** 播放序列（[[播放帧序列]，循环次数]）， 为空则为静态 */
 Seq: any;
 /** 说明 */
 msg: string;
}
export interface IKnivesRole {
 /** 主键 */
 id: number;
 /** - */
 baseAttr: any;
 /** - */
 name: string;
 /** - */
 quality: number;
 /** - */
 resPath: string;
 /** 帧动画ID */
 frameAnimation: number;
 /** 动作名&总帧数（从第0帧开始） */
 action: string;
 /** 移动速度（一秒:60帧移动多少像素） */
 moveSpeed: number;
 /** 索敌距离 */
 findEnemyRange: number;
 /** 拼刀玩法中的刀ID，数量 */
 knives: any;
}
export interface IKnivesStage {
 /** 主键 */
 id: number;
 /** 剩余数量 */
 name: number;
 /** 小怪出场ID&数量&间隔(秒) */
 monster_ids: any;
 /** 刀的刷新ID&数量&权重 */
 Knives_id_weight: any;
 /** 刀的刷新坐标(有160个坐标,坐标在屏幕内的刷新一次，走进屏幕内的坐标用当前数据刷新一次) */
 Knives_pos: any;
}
