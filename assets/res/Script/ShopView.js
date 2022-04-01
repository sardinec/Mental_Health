import { VM } from './modelView/ViewModel';
import { LoadGameData, SaveGameData, LoadMeta, SaveMeta, } from './Module/GameData';
import { constEggInfo, constShopList, PurchaseItem } from './Module/ShopConfig';

export let ItemInfo = {
    serial: 0,
    name: '',
    price: 0,
    price_original: 0,
    icon: '0',
    desc: '',
    suffix: '',
    sale: 0,
    sum: 0,
    multiBuy: false, //是否允许一次购买多个（礼包类为false）
    quant: 1, // 在购买交互界面实时更新的数量
    owned: 0, // 已经拥有的该物品数量
    //owned属性： list中，0-4有效，5-6废
};

export let EggInfo = {
    eggUnlocked: 0, // 已经拥有的彩蛋总和
    chanceHeld: 0, // 还可以用来开启彩蛋的机会（游戏、购买获得）
};

VM.add(ItemInfo, 'item');
VM.add(EggInfo, 'egg');

cc.Class({
    extends: cc.Component,

    properties: {
        PopupNode: cc.Node,
        DefaultLabel: cc.Node,
        EggsLabel: cc.Node,
        NumAdjustNode: cc.Node,
        _shopList: [],

    },

    onLoad() {
        this.PopupNode.active = false;

    },

    start() {
        this._shopList = constShopList();
        EggInfo = constEggInfo();
    },

    onPopClick(event, n) {
        console.log('customEvent : ' + n);
        //根据N，从list中确认一个
        ItemInfo = this._shopList[n];
        console.log('Item信息为： ' + ItemInfo.name);

        this.PopupNode.active = true;
        this.PopupNode.opacity = 255;


        if (n == 0) { console.log('n == 0'); };

        if ((n == 3) || (n == 6)) {
            this.EggsLabel.active = true;
            this.DefaultLabel.active = false;
        } else {
            this.EggsLabel.active = false;
            this.DefaultLabel.active = true;
        };
        this.NumAdjustNode.active = ItemInfo.multiBuy;
    },


});