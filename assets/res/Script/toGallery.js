cc.Class({
    extends: cc.Component,

    toGallery: function() {

        cc.director.loadScene("Gallery", () => {
            cc.sys.garbageCollect();
        });

    }, //切换到场景
});