// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    onEnable() {
        console.log('Game_End Enabled');
        let canvas = cc.find('Canvas');
        //canvas.off(cc.Node.EventType.TOUCH_END);
        canvas.pauseSystemEvents(false);

        this.node.on(cc.Node.EventType.TOUCH_END, this.toLaunch, this);

        this.scheduleOnce(() => {
            this.toLaunch();
        }, 5)

    },

    toLaunch() {
        console.log('调用tolaunch');

        let mask;
        mask = cc.find('Canvas/Mask');
        mask.active = true;
        mask.opacity = 0;
        //cc.director.pause();

        cc.tween(mask)
            .to(0.6, { opacity: 250 }, { easing: "sineOut" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                this.scheduleOnce(() => {
                    cc.director.loadScene("Launch", () => {
                        cc.sys.garbageCollect();
                    })
                }, 0.1)
            })
            .start(mask)

        cc.tween()

    },

    // update (dt) {},
});