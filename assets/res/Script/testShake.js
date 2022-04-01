cc.Class({
    extends: cc.Component,

    properties: {
        camera: cc.Node,

        _canvasNode: cc.Node,

    },

    onLoad() {
        this._canvasNode = cc.find('Canvas');


    },

    onBtnClick() {
        let bhvShake = this.camera.getComponent('BhvShake');
        bhvShake.onButtonShake();
    },

});