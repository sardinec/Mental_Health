cc.Class({
    extends: cc.Component,

    properties: {
        set: cc.Node,
        slots: cc.Node,
        gallery: cc.Node,
        shop: cc.Node,
        canvasNode: cc.Node,

        _currPannel: null,
    },

    onLoad() {
        this.canvasNode = cc.find('Canvas');

    },

    start() {

    },

    callSet() {
        var onResLoad = function(err, res) {
            var root = cc.instantiate(res);
            console.log('instantiated');
            this.canvasNode.addChild(root, 0, "theSettings");
            this.canvasNode.pauseSystemEvents(false);
            this._currPannel = 'Settings';
        };

        cc.resources.load('Prefab/Layout_Settings', cc.Prefab, onResLoad.bind(this));
    },

    callSlots() {
        var onResLoad = function(err, res) {
            var root = cc.instantiate(res);
            console.log('instantiated');
            this.canvasNode.addChild(root, 0, "theSlots");
            //var Exit = root.getChildByName("Exit").getChildByName("Exit Button");
            this.canvasNode.pauseSystemEvents(false);
            //this.slots.pauseSystemEvents(false);
            this._currPannel = 'Slots';

        };

        cc.resources.load('Prefab/Slots', cc.Prefab, onResLoad.bind(this));
    },

    callGallery() {

        this.scheduleOnce(() => {
            cc.director.loadScene('Gallery');
        }, 0.05)
    },

    callShop() {
        var onResLoad = function(err, res) {
            var root = cc.instantiate(res);
            console.log('instantiated');
            this.canvasNode.addChild(root, 0, "theShop");
            this.canvasNode.pauseSystemEvents(false);
            this.slots.pauseSystemEvents(false);
            this._currPannel = 'Shop';
        };

        cc.resources.load('Prefab/Shop', cc.Prefab, onResLoad.bind(this));
    },


});