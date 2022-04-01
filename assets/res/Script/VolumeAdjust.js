import { LoadGameData, SaveGameData } from './Module/GameData';
import { MainAudioSources } from './AudioManager';
import { LaunchAudioSources } from './Launch';

cc.Class({
    extends: cc.Component,

    properties: {
        //首先创建AudioSource，把相应的音乐文件拖入
        //添加UI组件Slider,
        musicSource: cc.AudioSource,
        FXSources: null,
        slider_Music: cc.Slider,
        slider_FX: cc.Slider,

        _globalData: null,
    },

    onLoad() {
        // 获取这个Slider的Progress,且调用方法传入参数
        // 其实就是初始加载声音大小
        if (MainAudioSources) {
            this.musicSource = MainAudioSources[0];
            if (MainAudioSources[1]) {
                this.FXSources = MainAudioSources[1];
            }
        } else if (LaunchAudioSources) {
            this.musicSource = LaunchAudioSources[0];
            if (LaunchAudioSources[1]) { this.FXSources = LaunchAudioSources[1]; }
        };

        this._globalData = LoadGameData('GlobalData');

    },

    start() {

        let currMusicVol = this._globalData.musicVol;
        if (currMusicVol) {
            this.slider_Music.progress = currMusicVol;
        } else {
            this.slider_Music.progress = 0.5;
        };

        let currFXVol = this._globalData.fxVol;
        if (currFXVol) {
            this.slider_FX.progress = currFXVol;
        } else { this.slider_FX.progress = 0.5 };

        this._updateMusicVolume(this.slider_Music.progress);
        this._updateFXVolume(this.slider_FX.progress);


    },

    _updateMusicVolume(progress) {
        if (this.musicSource) {
            this.musicSource.volume = progress;
            this._globalData.musicVol = progress;
        };
        SaveGameData(this._globalData, 2);
    },

    _updateFXVolume(progress) {
        if (this.FXSources) {
            console.log('FXSources 存在');
            for (let i = 0; i < this.FXSources.length; i++) {
                this.FXSources[i].volume = progress;
                this._globalData.fxVol = progress;
            };
        };
        SaveGameData(this._globalData, 2);
    },

    //在Slider组件里回调这个函数
    onSliderHEvent(sender, type) {
        console.log('调用 onSliderEvent');
        //this._updateMusicVolume(sender.progress, type);
        if (type == 1) {
            console.log('收到Event Music');
            this._updateMusicVolume(sender.progress);

        } else if (type == 2) {
            console.log('收到Event FX');
            this._updateFXVolume(sender.progress);
        };


    }
});