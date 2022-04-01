import { LoadGameData } from './Module/GameData';

export let MainAudioSources = null;


let MusicConfig = [
    { url: '00 Melodic Outro', vol: 0.8 }, // 0
    { url: '01 Emotional_looped (Piano and Strings)', vol: 0.8 },
    { url: '02 Ethnic Textures BASIC', vol: 0.8 },
    { url: '03 Playful LOOP', vol: 0.8 },
    { url: '04 Playful LOOP NO MELODY', vol: 0.8 },
    { url: '05 Reinforcement_looped', vol: 0.8 }, // 
    { url: '06 Reverse Ambience LOOP', vol: 0.8 },
    { url: '07 Reverse Ambience LOOP NO BED', vol: 0.8 },
    { url: '08 Soft Relaxing Track (looped)', vol: 0.8 },
    { url: '09 Teddy SHORT', vol: 0.8 },
    { url: '10 Time To Rise', vol: 0.8 },
    { url: '11 Quiet Theme #4', vol: 0.8 },
    { url: '15 Abstract Vision #2', vol: 0.8 },
];


cc.Class({
    extends: cc.Component,

    properties: {
        BGM: cc.AudioSource,
        Effects: null,

        _autoSaved: null,
        _globalData: null,
        _loadedAudio: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.Effects = this.node.getChildByName('Effects').getComponentsInChildren(cc.AudioSource);

        this._autoSaved = LoadGameData('AutoSave');
        this._globalData = LoadGameData('GlobalData');

        this.BGM.volume = this._globalData.musicVol;

        for (let i = 0; i < this.Effects.length; i++) {
            this.Effects[i].volume *= this._globalData.fxVol;
        };

        MainAudioSources = [this.BGM, this.Effects];

        this.node.on('playMusic', this.loadBGM, this);
        this.node.on('fadeMusic', this.fadeOut, this);

    },

    fadeIn(targetVol) {
        this.BGM.volume = 0;
        this.BGM.play();
        var rate = targetVol / 20;
        var count = 0;

        let fade = setInterval(() => {
            if (this.BGM.volume >= targetVol) {
                console.log('调整次数：' + count);
                clearInterval(fade);
            } else {
                this.BGM.volume += rate;
                count++;
            };
        }, 250);

    },

    fadeOut() {
        console.log('fadeout， currVol ' + this.BGM.volume);
        var rate = this.BGM.volume / 20;
        var count = 0;
        let fade = setInterval(() => {
            if (this.BGM.volume <= 0) {
                console.log('调整次数：' + count);
                console.log('loadedAudio: ' + this._loadedAudio);

                this.BGM.stop();
                if (this._loadedAudio) {
                    cc.audioEngine.uncache(this._loadedAudio);
                    this._loadedAudio = null;
                    console.log('调用uncache');
                };
                clearInterval(fade);
            } else {
                count++;
                this.BGM.volume -= rate;
            };

        }, 250);
    },

    loadBGM(i) {

        this.BGM.playOnLoad = false;
        let track = 'Music/' + MusicConfig[i].url;
        let targetVol = MusicConfig[i].vol * this._globalData.musicVol;
        cc.resources.load(track, (err, res) => {
            this.BGM.clip = res;
            this.BGM.volume = 0;
            this._loadedAudio = res;
            this.fadeIn(targetVol);
        });

    },

    unloadBGM() {},

    playBGM() {

    },

    start() {

    },

});