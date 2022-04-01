cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {
        //this.node.on(cc.Node.EventType.TOUCH_START, this.onExitClicked.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.onExitClicked.bind(this), true);

    },

    //由於我們打算動態新增Prefab來進行使用，所以我們在這個點擊事件中進行載入


    onExitClicked: function() {
        var root = cc.find("Canvas/theSetting");
        console.log(root.name);

        cc.tween(root)
            .hide(1, { easing: "easeOut" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                root.destroy();
            })
            .start(root)


    },

});