const { ccclass, property } = cc._decorator;
@ccclass
export class picRescaler extends cc.Component {
    @property({ type: cc.Node, tooltip: '要调整大小的Node，留空则调整this.node' })
    adjustNode = null;

    @property({ type: cc.SpriteFrame, tooltip: '' })
    pic = null;

    @property({ tooltip: "false:fitwidth  true:fitheight" })
    fitheight = false;

    @property({ type: cc.Node, tooltip: '需要同步调整的node（可选）' })
    adjustRelatedNode = null;

    @property({ type: cc.SpriteFrame, tooltip: '' })
    relatedNodePic = null;


    @property({ type: cc.Node, tooltip: '' })
    parent = null;



    @property({ type: cc.Float, tooltip: '缩放倍数' })
    multiple = 1;

    _wg = null;

    onLoad() {

        var nd;
        var parent;
        if (!this.adjustNode) { nd = this.node } else { nd = this.adjustNode };
        if (!this.parent) { parent = this.node.parent } else { parent = this.parent };
        var sp = nd.getComponent(cc.Sprite);

        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sp.trim = false;

        var picSize = this.pic.getOriginalSize();
        var parentSize = { height: parent.height, width: parent.width };

        var h;
        var w;

        var rnd = this.adjustRelatedNode; //如有需要同步调整的node
        var rpic = this.relatedNodePic;
        if (rnd && rpic) {
            var sp2 = rnd.getComponent(cc.Sprite);
            sp2.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sp2.trim = false;
            var picSize2 = rpic.getOriginalSize();
            var h2;
            var w2;
        };

        if (this.fitheight) {
            let scaleH = picSize.height / parentSize.height;
            h = parentSize.height;
            w = picSize.width / scaleH;

            if (rnd && rpic) {
                h2 = picSize2.height / scaleH;
                w2 = picSize2.width / scaleH;
            }

        } else {
            let scaleW = picSize.width / parentSize.width;
            w = parentSize.width;
            h = picSize.height / scaleW;

            if (rnd && rpic) {
                w2 = picSize2.width / scaleW;
                h2 = picSize2.height / scaleW;
            }
        };

        nd.height = h * this.multiple;
        nd.width = w * this.multiple;

        if (rnd && rpic) {
            rnd.width = w2 * this.multiple;
            rnd.height = h2 * this.multiple;
        };

    };

    start() {

    };

};