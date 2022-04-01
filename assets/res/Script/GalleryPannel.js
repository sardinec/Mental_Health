import { LoadGameData, SaveGameData } from './Module/GameData';
import { constGalleryData } from './Module/CharacterConfig';
import { VM } from './modelView/ViewModel';
import { PlotData, } from './PlotManager';

let PageData = {
    name: '',
    motto: '',
    desc: '',
    pic: '',
    chance: 0,
    currAlert: '默认提醒测试',

    egg1: {
        state: 0,
        title: '',
        alert: '',
        short: '',
        serial: 0,
    },
    egg2: {
        state: 0,
        title: '',
        alert: '',
        short: '',
        serial: 0,
    },
    egg3: {
        state: 0,
        title: '',
        alert: '',
        short: '',
        serial: 0,
    },
    zoom: 1,
};

VM.add(PageData, 'page');

cc.Class({
    extends: cc.Component,

    properties: {
        _num: cc.Integer,
        _max: cc.Integer,
        data: cc.Object,
        _autoSaved: cc.Object,
        _globalData: cc.Object,

        _charNode: cc.Node,
        _grayMat: cc.Material,
        _colorMat: cc.Material,
    },

    onLoad: function() {
        this._autoSaved = LoadGameData('AutoSave');
        this._globalData = LoadGameData('GlobalData');

        this.data = constGalleryData();
        this._max = this.data.max;
        this._num = 0;

        this.numUpdate(this._num);


        let canvasNode = cc.find("Canvas");
        let leftBtn = canvasNode.getChildByName("Left Button");
        let rightBtn = canvasNode.getChildByName("Right Button");

        leftBtn.on(cc.Node.EventType.TOUCH_END, this.onLeftClicked, this);
        rightBtn.on(cc.Node.EventType.TOUCH_END, this.onRightClicked, this);

        this.grayMat = cc.resources.load('Materials/gray');

        let musicVol = cc.sys.localStorage.getItem("musicVolume");
        let audio = canvasNode.getComponent(cc.AudioSource);
        if ((audio) & (musicVol)) {
            audio.volume = musicVol;
        };

        this.eggUpdate();

    },

    onRightClicked: function() {
        this._num += 1;
        if (this._num >= this._max) { this._num = 0; };
        this.numUpdate(this._num);
    },


    onLeftClicked: function() {
        this._num -= 1;
        if (this._num < 0) { this._num = this._max - 1; };
        this.numUpdate(this._num);
    },


    numUpdate: function(a) {
        PageData.name = this.data.nameList[a];
        PageData.motto = this.data.mottoList[a];
        PageData.desc = this.data.descList[a];
        PageData.zoom = this.data.zoomList[a];
        PageData.pic = this.data.picList[a];

        // PageData.egg1.title = this.data.eggList[a].egg1.title;
        // PageData.egg2.title = this.data.eggList[a].egg2.title;
        // PageData.egg3.title = this.data.eggList[a].egg3.title;
        PageData.egg1.short = this.data.eggList[a].egg1.short;
        PageData.egg2.short = this.data.eggList[a].egg2.short;
        PageData.egg3.short = this.data.eggList[a].egg3.short;
        PageData.egg1.state = this.data.eggList[a].egg1.state;
        PageData.egg2.state = this.data.eggList[a].egg2.state;
        PageData.egg3.state = this.data.eggList[a].egg3.state;
        PageData.egg1.serial = this.data.eggList[a].egg1.serial;
        PageData.egg2.serial = this.data.eggList[a].egg2.serial;
        PageData.egg3.serial = this.data.eggList[a].egg3.serial;

        if (!PageData.egg1.state) {
            PageData.egg1.short = '???'
        };
        if (!PageData.egg2.state) {
            PageData.egg2.short = '???'
        };
        if (!PageData.egg3.state) {
            PageData.egg3.short = '???'
        };

        PageData.chance = this._globalData.eggs[a][0].chance;
        console.log('chance: ' + PageData.chance);

        // 主界面的彩蛋数据，与图鉴界面的同步
        PlotData.egg1.serial = PageData.egg1.serial;
        PlotData.egg2.serial = PageData.egg2.serial;
        PlotData.egg3.serial = PageData.egg3.serial;
        PlotData.egg1.title = PageData.egg1.title;
        PlotData.egg2.title = PageData.egg2.title;
        PlotData.egg3.title = PageData.egg3.title;

        console.log('Plotdata.egg1.serial:' + PlotData.egg1.serial);

        let picUrl = 'Pic/' + PageData.pic;
        this.picUpdate(picUrl);
        this.eggUpdate();
    },

    picUpdate: function(picUrl) {
        console.log('立绘路径为：' + picUrl);

        var nd = cc.find("Canvas/Gallery Layout/Character");
        var sp = nd.getComponent(cc.Sprite);

        cc.resources.load(picUrl, cc.SpriteFrame, function(err, ret) {
            if (err) {
                console.log('立绘载入出错，找不到资源 ' + picUrl);
            } else {
                sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                sp.trim = false;


                var parent = nd.parent;
                var picSize = ret.getOriginalSize();
                var parentSize = { height: parent.height, width: parent.width };

                var h;
                var w;

                var fitheight;
                let part = picUrl.substring(5, 6);
                if ((part == "0") || (part == "2")) { fitheight = true; } else { fitheight = false };

                if (fitheight) {
                    let scaleH = picSize.height / parentSize.height;
                    h = parentSize.height;
                    w = picSize.width / scaleH;
                } else {
                    let ratio = picSize.height / picSize.width;
                    h = 400;
                    w = h / ratio;
                };

                nd.height = h * PageData.zoom;
                nd.width = w * PageData.zoom;

                sp.spriteFrame = ret;
            };
        });
    },

    eggUpdate: function() {
        var egg1 = PageData.egg1;
        var egg2 = PageData.egg2;
        var egg3 = PageData.egg3;

        var pic1 = {
            num: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node/Num').getComponent(cc.Sprite),
            bg: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node/Layout/bg').getComponent(cc.Sprite),
            confi: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node/Layout/confid').getComponent(cc.Sprite),
            btn: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node/Layout').getComponent(cc.Button),
        };

        var pic2 = {
            num: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 2/Num').getComponent(cc.Sprite),
            bg: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 2/Layout/bg').getComponent(cc.Sprite),
            confi: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 2/Layout/confid').getComponent(cc.Sprite),
        };

        var pic3 = {
            num: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 3/Num').getComponent(cc.Sprite),
            bg: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 3/Layout/bg').getComponent(cc.Sprite),
            confi: cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 3/Layout/confid').getComponent(cc.Sprite),
        };

        let grayMat = cc.Material.getBuiltinMaterial('2d-gray-sprite');
        let NormalMat = cc.Material.getBuiltinMaterial('2d-sprite');

        console.log('--------Test——-------');
        console.log('egg1.state = ' + egg1.state);
        console.log('egg2.state = ' + egg2.state);
        console.log('egg3.state = ' + egg3.state);
        console.log('-------Test End--------');

        if (!egg1.state) {
            egg1.title = '???';
            egg1.alert = '尚未获得彩蛋';
            pic1.num.setMaterial(0, grayMat);
            pic1.bg.setMaterial(0, grayMat);
            pic1.confi.setMaterial(0, grayMat);

        } else {
            pic1.num.setMaterial(0, NormalMat);
            pic1.bg.setMaterial(0, NormalMat);
            pic1.confi.setMaterial(0, NormalMat);
        };

        if (!egg2.state) {
            egg2.title = '???';
            pic2.num.setMaterial(0, grayMat);
            pic2.bg.setMaterial(0, grayMat);
            pic2.confi.setMaterial(0, grayMat);
        } else {
            pic2.num.setMaterial(0, NormalMat);
            pic2.bg.setMaterial(0, NormalMat);
            pic2.confi.setMaterial(0, NormalMat);
        };

        if (!egg3.state) {
            egg3.title = '???';
            pic3.num.setMaterial(0, grayMat);
            pic3.bg.setMaterial(0, grayMat);
            pic3.confi.setMaterial(0, grayMat);
        } else {
            pic3.num.setMaterial(0, NormalMat);
            pic3.bg.setMaterial(0, NormalMat);
            pic3.confi.setMaterial(0, NormalMat);
        };

    },

    onEggClicked(event, n) {
        var pic1 = cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node/Layout');
        var pic2 = cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 2/Layout/');
        var pic3 = cc.find('Canvas/Gallery Layout/Layout/Candy Content/Secret Node 3/Layout/');

        if (n == '1') {
            // console.log('收到点击事件 ' + n);
            // 根据egg.state 来确定是加载弹窗，还是进入彩蛋播放(require serial)             
            // 更新currAlert,加载Popup_Gallery

            let url = 'Prefab/Popup_Gallery';
            if (!PageData.egg1.state) {
                PageData.currAlert = 'onEggClicked测试用 currAlert';
                cc.resources.load(url, function(err, res) {
                    let root = cc.instantiate(res);
                    cc.find('Canvas').addChild(root);
                });
            } else {
                PlotData.currSerial = PlotData.egg1.serial;
                console.log('loadScene已调用');

                PlotData.prevScene = 'Gallery';
                cc.director.loadScene("EggsPlay", () => {
                    cc.sys.garbageCollect();
                });

            };


        } else if (n == '2') {

        } else if (n == '3') {

        }

    },

});