// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad() {

    },

    start() {

    },

    // update (dt) {},
    toMain: function(event, str) {

        if (str == 'Launch') {
            let mask;

            mask = cc.find('Canvas/Mask');
            mask.active = true;
            mask.opacity = 0;

            cc.tween(mask)
                .to(0.8, { opacity: 250 }, { easing: "sineOut" })
                // 当前面的动作都执行完毕后才会调用这个回调函数
                .call(() => {
                    this.scheduleOnce(() => {
                        cc.director.loadScene("Main", () => {
                            cc.sys.garbageCollect();
                        })
                    }, 0.2)
                })
                .start(mask)


        };

    }, //切换到场景
});