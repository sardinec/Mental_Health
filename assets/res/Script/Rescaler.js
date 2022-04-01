// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html


const { ccclass, property } = cc._decorator;
@ccclass
export class Rescaler extends cc.Component {
    @property({ type: cc.SpriteFrame, tooltip: '' })
    pic = null;

    @property({ type: cc.Node, tooltip: '要调整大小的Node，留空则调整this.node' })
    adjustNode = null;

    @property({ type: cc.Node, tooltip: '' })
    parent = null;

    @property({ tooltip: "false:fitwidth  true:fitheight" })
    fitheight = false;

    @property({ type: cc.Float, tooltip: '缩放倍数' })
    multiple = 1;

    _initW = null;
    _initH = null;
    _wg = null;

    onLoad() {
        var sp = this.node.getComponent(cc.Sprite);
        var nd;
        var parent;
        if (!this.adjustNode) { nd = this.node } else { nd = this.adjustNode };
        if (!this.parent) { parent = this.node.parent } else { parent = this.parent };

        this._initW = nd.width;
        this._initH = nd.height;


        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.trim = false;


        var picSize = this.pic.getOriginalSize();
        var parentSize = { height: parent.height, width: parent.width };
        var scale = picSize.height / parentSize.height;
        var h;
        var w;

        if (this.fitheight) {

            h = parentSize.height;
            w = picSize.width / scale;

        } else {
            w = parentSize.width;
            h = picSize.height * scale;
        };

        nd.height = h * this.multiple;
        nd.width = w * this.multiple;


    };

    start() {

    };

};