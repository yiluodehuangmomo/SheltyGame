// 游戏枚举
/** 分包枚举 */
export enum EBundle {
    // 公共代码包
    FrameWork = 'net_framework',
    // 配置文件
    Config = 'net_config',
    // 大厅
    Hall = 'net_hall',
    // 战场
    Battle = 'net_battle',
}
/** 视图层枚举 */
export enum UIParent {
    /** 背景 */
    BG = 'node_bg',
    /** 战斗场景 */
    Battle = 'node_battle',
    /** UI场景 */
    UI = 'node_ui',
    /** 弹窗层 */
    PopUp = 'node_popup',
    /** 加载中 */
    Loading = 'node_loading',
    /** 提示 */
    Tip = 'node_tip',
}
