cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad: function() {},

    //由於我們打算動態新增Prefab來進行使用，所以我們在這個點擊事件中進行載入
    onBtnAddClicked: function() {
        var CanvasNode = cc.find('Canvas');
        if (!CanvasNode) { cc.log('找不到Canvas畫布，請確認你的場景裡有Canvas'); return; }
        var prefabPath = 'Prefab/Layout_Settings';

        var onResourceLoaded = function(errorMessage, loadedResource) {

            var newMyPrefab = cc.instantiate(loadedResource);
            CanvasNode.addChild(newMyPrefab, 0, "theSetting");
            var exitBtn = newMyPrefab.getChildByName("Layout").getChildByName("Exit_btn");
            console.log(exitBtn.name);
            exitBtn.on(cc.Node.EventType.TOUCH_END, this.onExitClicked.bind(this));
        };

        cc.resources.load(prefabPath, onResourceLoaded.bind(this));
    },


    onExitClicked: function() {
        var root = cc.find("Canvas/theSetting");
        //console.log(root.name);

        cc.tween(root)
            .hide(1, { easing: "easeOut" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                root.destroy();
            })
            .start(root)


    },

});