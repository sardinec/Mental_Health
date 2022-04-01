cc.Class({
    extends: cc.Component,

    properties: {
        canvasNode: cc.Node,
        shop: cc.Node,
    },

    onLoad() {
        this.canvasNode = cc.find('Canvas');
    },

    callShop() {
        var onResLoad = function(err, res) {
            var root = cc.instantiate(res);
            console.log('instantiated');
            this.canvasNode.addChild(root, 0, "theShop");

            this.canvasNode.pauseSystemEvents(false);
            this._currPannel = 'Shop';

        };

        cc.resources.load('Prefab/Shop', cc.Prefab, onResLoad.bind(this));
    },

});