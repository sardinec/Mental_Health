cc.Class({
    extends: cc.Component,

    properties: {
        pannel: cc.Node,
        resumePannel: cc.Node, //需要resume Events的pannel
        _canvasNode: cc.Node,
        _slotsPannel: cc.Node,
        _shopPannel: cc.Node,
    },

    onLoad() {
        this._canvasNode = cc.find('Canvas');

    },
    exitSlotsPannel() {
        //用于退出整个SlotsPannel
        if (!this.resumePannel)
            this.resumePannel = this._canvasNode;
        cc.tween(this.pannel)
            .to(0.15, { opacity: 0, scale: 0.85 }, { easing: "sineIn" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                this.resumePannel.resumeSystemEvents(true);
                this.pannel.destroy();
            })
            .start(this.pannel)

    },

    disableShopPop() {

        cc.tween(this.pannel)
            .to(0.1, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                this.resumePannel.resumeSystemEvents(true);
                this.pannel.active = false;
                this.pannel.opacity = 255;
            })

        .start(this.pannel)
    },

    exitShopPannel() {
        if (!this.resumePannel)
            this.resumePannel = this._canvasNode;
        cc.tween(this.pannel)
            .to(0.1, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                this.resumePannel.resumeSystemEvents(true);
                this.pannel.destroy();
            })
            .start(this.pannel)


    },

    exitSolePannel_small() {
        if (!this.resumePannel)
            this.resumePannel = this._canvasNode;

        cc.tween(this.pannel)
            .to(0.1, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                this.resumePannel.resumeSystemEvents(true);
                this.pannel.destroy();
            })
            .start(this.pannel)
    },


    onExitClicked(event, val) {

        console.log(val);
        if (val == 'SlotsPannel') {
            console.log('收到SlotsPannel Exit点击事件');
            this._slotsPannel = this._canvasNode.getChildByName('theSlots');
            this.resumePannel = this._slotsPannel;

            let mask = this._slotsPannel.getChildByName('Mask');
            mask.active = false;

            //this.enableButtons(this);
            this.exitSolePannel_small();

        } else if (val == 'Shop') {
            console.log('收到Shop Exit点击事件');
            this.scheduleOnce(function() {
                this.pannel.active = false;

            }.bind(this), 0.4)

        } else {
            this.pannel.destroy();
        };

        if (this.resumePannel) {
            this.resumePannel.resumeSystemEvents(true);
        };


    },

    destroySelf(self, type) {
        self.pannel.destroy();
        if (type == 1) { // 需要resume的是整个canvas
            self._canvasNode.resumeSystemEvents(true);
        } else if (type == 2) { //需要resume slots pannel
            self._slotsPannel.resumeSystemEvents(true);

        }
    },

    enableButtons(self, callback) {
        var b1 = cc.find('Canvas/Slots/Slots View/Slot1').getComponent(cc.Button);
        var b2 = cc.find('Canvas/Slots/Slots View/Slot2').getComponent(cc.Button);
        var b3 = cc.find('Canvas/Slots/Slots View/Slot3').getComponent(cc.Button);
        var b4 = cc.find('Canvas/Slots/Slots View/Slot4').getComponent(cc.Button);
        var b5 = cc.find('Canvas/Slots/Slots View/Slot5').getComponent(cc.Button);
        var b6 = cc.find('Canvas/Slots/Slots View/Slot6').getComponent(cc.Button);
        var b7 = cc.find('Canvas/Slots/Slots View/Slot7').getComponent(cc.Button);
        var b8 = cc.find('Canvas/Slots/Slots View/Slot8').getComponent(cc.Button);
        b1.interactable = true;
        b2.interactable = true;
        b3.interactable = true;
        b4.interactable = true;
        b5.interactable = true;
        b6.interactable = true;
        b7.interactable = true;
        b8.interactable = true;

        if (callback) {
            self.scheduleOnce(function() {
                callback(self, 2);
            }, 0.1)
        };
    },
});