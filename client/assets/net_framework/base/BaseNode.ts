import {
    _decorator,
    Button,
    CacheMode,
    Component,
    EditBox,
    EventHandler,
    game,
    isValid,
    js,
    Label,
    Node,
    PageView,
    RichText,
    ScrollView,
    sp,
    Sprite,
    tween,
    Tween,
    v3,
    view,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseNode')
export class BaseNode extends Component {
    // 所有子节点
    public oNodes: any = {};

    private addEventHandlerButtons: Button[] = [];
    // private nodeEventHandlers: { node: Node; handler: Function }[] = [];
    private addEventHandlerNodes: Node[] = [];

    protected onLoad(): void {
        this.RegisterNode(this.node);
        this.afteronLoad();
    }
    /**第一次load处理回调，一般用于添加消息监听等*/
    afteronLoad() {}
    onShow(oParms?: any) {}
    start() {}
    onDestroy() {
        // 解除按钮事件
        this.addEventHandlerButtons.forEach((oBtn: Button) => {
            oBtn.clickEvents = [];
        });
        // 解除节点事件
        for (let i = 0; i < this.addEventHandlerNodes.length; i++) {
            if (isValid(this.addEventHandlerNodes[i])) this.addEventHandlerNodes[i].off(Node.EventType.TOUCH_END, this.onClick, this);
        }

        game.targetOff(this);
        game.removeAll(this);
        this.oNodes = null;
        Tween.stopAllByTarget(this.node);
    }
    update(dt: number) {}
    /** 注册所有节点 */
    RegisterNode(oNode: Node) {
        if (oNode.name.indexOf('_') != 0) {
            let bindObj = null;
            if (oNode.getComponent(Button)) {
                // 按钮
                bindObj = oNode.getComponent(Button);
                this.InitBtnEvent(bindObj);
            } else {
                if (oNode.name.indexOf('sp_') == 0) {
                    // 精灵
                    bindObj = oNode.getComponent(Sprite);
                } else if (oNode.getComponent(Label)) {
                    // TODO::文本，替换多语言
                    bindObj = oNode.getComponent(Label);
                    bindObj.cacheMode = CacheMode.BITMAP;
                } else if (oNode.name.indexOf('edit_') == 0) {
                    //输入框
                    bindObj = oNode.getComponent(EditBox);
                } else if (oNode.name.indexOf('list_') == 0) {
                    bindObj = oNode.getComponent(ScrollView);
                } else if (oNode.name.indexOf('rich_') == 0) {
                    bindObj = oNode.getComponent(RichText);
                } else if (oNode.name.indexOf('page_') == 0) {
                    bindObj = oNode.getComponent(PageView);
                } else if (oNode.name.indexOf('sk_') == 0) {
                    bindObj = oNode.getComponent(sp.Skeleton);
                } else {
                    bindObj = oNode;
                }
                if (oNode.name.indexOf('btn_') == 0) {
                    // 添加点击事件
                    this.InitNodeEvent(oNode);
                }
            }
            this.oNodes[oNode.name] = bindObj;
        }
        for (let i = 0; i < oNode.children.length; i++) {
            this.RegisterNode(oNode.children[i]);
        }
    }

    /** 获取类名 */
    public get ClassName(): string {
        return js.getClassName(this);
    }

    /** 初始化按钮事件 */
    InitBtnEvent(oBtn: Button, customData?: any) {
        if (!oBtn) return;

        let clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = this.ClassName;
        clickEventHandler.handler = 'onBtnClick';
        if (customData != null) clickEventHandler.customEventData = customData;

        oBtn.clickEvents = [];
        oBtn.clickEvents.push(clickEventHandler);

        this.addEventHandlerButtons.push(oBtn); // 保存事件处理程序
    }

    /** 初始化节点点击事件 */
    InitNodeEvent(oNode: Node) {
        oNode.on(Node.EventType.TOUCH_END, this.onClick, this);
        // this.nodeEventHandlers.push({ node: oNode, handler: this.onClick }); // 保存节点和处理程序
        this.addEventHandlerNodes.push(oNode);
    }

    /** 节点点击事件分发 */
    onClick(target) {
        let funcName = 'onClick_' + target.currentTarget.name;
        if (this[funcName]) this[funcName]();
    }

    /** 点击事件分发 */
    onBtnClick(event: Event, customEventData: any) {
        let funcName = 'onClick_' + (event.target as any).name;
        if (this[funcName]) this[funcName](event, customEventData);
    }

    RunShowAction(runNode: Node, offsetY: number = 0, callFunc: any = null) {
        Tween.stopAllByTarget(runNode);
        runNode.setPosition(v3(0, -view.getVisibleSize().height / 2, 0));
        tween(runNode)
            .to(0.3, { position: v3(0, offsetY, 0) }, { easing: 'backOut' })
            .call(() => {
                if (callFunc) callFunc();
            })
            .start();
    }
    /**添加按钮事件 */
    addClick(oBtn, fun?, customData?) {
        if (!oBtn) return;
        let clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = this.ClassName;
        clickEventHandler.handler = fun || 'onBtnClick';
        if (customData) clickEventHandler.customEventData = customData;
        oBtn.clickEvents.length = 0; //这里把重复添加的按钮事件删除
        oBtn.clickEvents.push(clickEventHandler);
    }
    /**递归查找节点 */
    findInChildren(node: Node, name): Node {
        var n = node.getChildByName(name);
        if (n) return n;
        var l = node.children.length;
        if (0 >= l) return null;
        for (var o = 0; o < l; ++o) {
            var a = this.findInChildren(node.children[o], name);
            if (a) return a;
        }
        return null;
    }
    /**节点置灰
     * @param node 节点
     * @param boo 是否置灰
     * @param isRecursion 是否递归子节点
     */
    setGrayscale(node, boo, isRecursion = false) {
        var that = this;
        var sprite = node.getComponent(Sprite);
        if (sprite) sprite.grayscale = boo;
        if (isRecursion) {
            if (node.children.length) {
                node.children.forEach((v) => {
                    that.setGrayscale(v, boo, isRecursion);
                });
            }
        }
    }
    CloseMe(release: boolean) {
        if (release) {
            this.node.removeFromParent();
            this.node.destroy();
        } else {
            this.node.active = false;
        }
    }
}
