import { PlotData } from './PlotManager';


cc.Class({
    extends: cc.Component,

    properties: { _prev: '', },

    start() {
        this._prev = PlotData.prevScene;
    },

    toPrevScene() {
        console.log('前一个场景为：' + this._prev);
        if (this._prev != '')
            cc.director.loadScene(this._prev, () => {
                cc.sys.garbageCollect();
            });
    },

});