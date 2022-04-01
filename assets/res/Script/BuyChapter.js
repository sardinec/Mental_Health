import { RequireChapter, LoadGameData, SaveGameData } from './Module/GameData';
import { ShopConfig } from './Module/ShopConfig'
import { PurchaseChap } from './PlotManager';

cc.Class({
    extends: cc.Component,

    properties: {
        canvasNode: cc.Node,
        root: cc.Node,
    },

    onLoad: function() {
        this.canvasNode = cc.find('Canvas');
        PurchaseChap.price = ShopConfig[8].price;
    },

    buyChapter(serial, callback_success, callback_fail) {
        // @param serial 章节序号 

        // 购买  
        let gd = LoadGameData('GlobalData');
        let sum = ShopConfig[8].price;

        if (gd.diamond < sum) {
            console.log('购买失败，钻石不足');
        } else {
            console.log('购买成功.(逻辑待写)');
            gd.diamond -= sum; //钻石减少
            gd.chapterUnlocked.push(serial);
            SaveGameData(gd, 2);
            this.canvasNode.emit('buyChapterSuccess');

            //购买成功后
            if (callback_success) {
                this.scheduleOnce(() => { callback_success(this) }, 0.2)
            }

        };

    },

    onConfirm() {
        this.buyChapter(PurchaseChap.serial, this.onPurchaseSuccess);
    },

    onPurchaseSuccess(self) {
        console.log('购买完成销毁节点');
        self.node.destroy();

    },

});