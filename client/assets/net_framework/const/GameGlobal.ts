import { UILoading } from '../../net_hall/code/common/UILoading';

/** 游戏常量 */
export const GameGlobal = {
    // 是否使用plist图集
    UsePlist: true,
    // 提示文本间隔
    TipNodeSpaceY: 70,
    // 提示文本初始Y轴位置
    TipNodeInitialPosY: 200,

    Debug: {
        // 是否显示碰撞盒
        CanShowCollisionBox: false,
    },
};

/** UI路径 */
export const UIPath = {
    UILoading: 'prefab/common/UILoading',

    UIHall: 'prefab/ui/UIHall',
    /** 战场加载页 */
    UIBattleLoading: 'prefab/ui/UIBattleLoading',
    /** 战斗页面 */
    UIBattle: 'prefab/ui/UIBattle',
};
