import VMParent from "./modelView/VMParent";
import { VM } from './modelView/ViewModel';
import { ItemInfo, EggInfo } from "./ShopView"
import { constEggInfo, constShopList, PurchaseItem } from './Module/ShopConfig';

const { ccclass, property } = cc._decorator;


@ccclass
export class ShopParent extends VMParent {
    @property({ type: cc.Node })
    shopRoot = null;

    @property({ type: cc.Node })
    popNode = null;

    data = {
        item: {},
        egg: {},
    };


    start() {
        this.canvasNode = cc.find('Canvas');
    };


    onEnable() {
        console.log('onEnable 已经调用');
        this.data.item = ItemInfo;
        this.data.egg = EggInfo;
        this.data.item.sum = this.data.item.price * this.data.item.quant;
        console.log('name： ' + this.data.item.name);

        let btn = this.node.getChildByName('Purchase Button').getComponent(cc.Button);
        console.log('Button: ' + btn.name);
        btn.interactable = true;
        this.shopRoot.pauseSystemEvents(true);
        this.popNode.resumeSystemEvents(true);
    };

    calcSum() {

        this.data.item.sum = this.data.item.price * this.data.item.quant;
    };


    onBuyClick(event) {
        console.log('============收到onBUYClick');
        let serial = this.data.item.serial;
        let quant = this.data.item.quant;

        let rt = PurchaseItem(serial, quant);

        if (rt == 'FAIL') {
            console.log('Purchase FAIL');
        } else if (rt == 'SUCCESS') {


            cc.tween(this.popNode)
                .to(0.1, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
                // 当前面的动作都执行完毕后才会调用这个回调函数
                .call(() => {
                    this.shopRoot.resumeSystemEvents(true);
                    this.popNode.active = false;
                    //this.popNode.opacity = 255;
                })
                .start(this.popNode)
        };



    };
}