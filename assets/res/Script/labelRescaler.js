const { ccclass, property } = cc._decorator;
@ccclass
export class Rescaler extends cc.Component {
    @property({ type: cc.Node, tooltip: '要调整大小的Node，留空则调整this.node' })
    adjustLabel = null;

    @property({ tooltip: "false:fitwidth  true:fitheight" })
    fitheight = false;

    @property({ type: cc.Node, tooltip: '向谁对齐' })
    parent = null;

    @property({ type: cc.Float, tooltip: 'label行高与parent.height相比，的缩放倍数' })
    rowHeightRate = 1;

    @property({ type: cc.Float, tooltip: 'label宽与parent.width相比，的缩放倍数' })
    rowWidthRate = 1;

    onLoad() {

    };

    start() {

        var nd;
        var parent;
        if (!this.adjustLabel) { nd = this.node } else { nd = this.adjustLabel };
        if (!this.parent) { parent = this.node.parent } else { parent = this.parent };
        var lb = nd.getComponent(cc.Label);

        var parentSize = { height: parent.height, width: parent.width };

        nd.height = parentSize.height * this.rowHeightRate;
        nd.width = parentSize.width * this.rowWidthRate;

        lb.lineHeight = nd.height;
        lb.fontSize = nd.height - 1;

    };

};