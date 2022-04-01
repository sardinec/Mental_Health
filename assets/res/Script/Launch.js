/*
 * 在游戏Load时，进行init
 * 全局存档涉及 chapter, autoSave,  musicVolume,fxVolume, energyVal, 
 * 全局 图鉴界面相关：roleCollect(角色是否已遇见)，eggCollect（角色彩蛋开启状态、new状态） 
 * 另有手动存档slots
 * 所有存档，在launch时向服务器请求，记录是否成功。如果未成功，在进入其他界面时再请求一次
 * 仍未成功，予以提示
 */

import { LoadGameData, SaveGameData, LoadMeta, SaveMeta } from './Module/GameData';

export let Initialize = { do: false };
export let LaunchAudioSources = null;

cc.Class({
    extends: cc.Component,

    properties: {
        _autoSave: cc.Float,
        _musicVolume: cc.Float,
        _fxVolume: cc.Float,
        _chapter: cc.Float,
        _energyVal: cc.Integer,
        _roleCollect: cc.Object,
        _eggCollect: cc.Object,

        _autoSaved: cc.Object,
        _globalData: cc.Object,
        _metaData: cc.Object,

        _mask: null,
        NewGameBtn: cc.Node,
        ContinueBtn: cc.Node,
        SlotsBtn: cc.Node,
    },

    onLoad: function() {
        cc.director.resume();
        this._autoSaved = LoadGameData('AutoSave');
        this._globalData = LoadGameData('GlobalData');

        this._mask = cc.find('Canvas/Mask');
        this._mask.active = false;
        this._mask.opacity = 0;

        if (this._globalData.GameState.newUser) {
            //生成新的UID
        };

        // this._loadMeta(this._saveMeta);

        this._metaData = LoadMeta();

        if ((this._globalData.GameState.justEnded)) {
            //刚结束游戏：不要生成新的存档。

            //生成新的docNames
            let md = LoadMeta();
            let a = md.metaDocName;
            let b = md.autoDocName;
            let c = md.globalDocHistory;

            this._metaData.metaDocHistory.push(a);
            this._metaData.autoDocHistory.push(b);
            this._metaData.globalDocHistory.push(c);

            //this._metaData.metaDocName += '1';
            this._metaData.autoDocName += '2';
            //          this._metaData.globalDocName += '3';
            console.log('metaDocName  ' + this._metaData.metaDocName);

        };

        this._musicVolume = this._globalData.musicVol;
        this._fxVolume = this._globalData.fxVol;

        console.log('-------------Test Data------------');
        console.log('Global Dta 用户状态： ');
        console.log('新用户： ' + this._globalData.GameState.newUser);
        console.log('一周目结束用户：' + this._globalData.GameState.justEnded);

        var audio = cc.find("Canvas").getComponent(cc.AudioSource);
        if (audio) {
            audio.volume = this._musicVolume;
        };

    },


    start() {
        if ((this._globalData.GameState.justEnded) || (this._globalData.GameState.newUser)) {
            this.ContinueBtn.active = false;
            this.NewGameBtn.active = true;
        } else {
            this.ContinueBtn.active = true;
            this.NewGameBtn.active = false;
        };

        this._saveMeta(this, this._reSaveGameData);

    },

    // _loadMeta(callback) {
    //     this._metaData = LoadMeta();


    //     if ((this._globalData.GameState.justEnded) || (this._globalData.GameState.newUser)) {
    //         //生成新的docNames
    //         let md = LoadMeta();
    //         let a = md.metaDocName;
    //         let b = md.autoDocName;
    //         let c = md.globalDocHistory;

    //         this._metaData.metaDocHistory.push(a);
    //         this._metaData.autoDocHistory.push(b);
    //         this._metaData.globalDocHistory.push(c);

    //         this._metaData.metaDocName += '1';
    //         this._metaData.autoDocName += '2';
    //         this._metaData.globalDocName += '3';
    //         console.log('metaDocName  ' + this._metaData.metaDocName);
    //     };

    //     if (callback) { callback(this, this._reloadGameData) }
    // },

    _saveMeta(self, callback) {

        self._globalData.GameState.justEnded = false;
        self._globalData.GameState.newUser = false;

        SaveMeta(self._metaData);

        if (callback) { callback(self) }
    },

    _reSaveGameData(self) {
        SaveGameData(self._autoSaved, 1);
        SaveGameData(self._globalData, 2);
    },


    testData() {
        console.log('-------------Test Data------------');
        console.log('Global Dta 用户状态： ');
        console.log('新用户： ' + this._globalData.GameState.newUser);
        console.log('一周目结束用户：' + this._globalData.GameState.justEnded);
    }
});