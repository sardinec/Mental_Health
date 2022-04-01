/* 该脚本挂载于游戏界面的Canvas节点上，用于： 
 * 1. 显示人物名字、剧情文本、人物立绘
 * 2. 存档游戏进度
 * 3. 剧情回看、跳过、自动播放功能
 * 
 */

import { LoadGameData, SaveGameData, LoadMeta, SaveMeta, RequireChapter } from './Module/GameData';
import { constAttackList, constEggChoose } from './Module/CharacterConfig';
import { VM } from './modelView/ViewModel';
import { ASData } from './SlotsPannel';

export var PlotData = {
    attName: '',
    attNo: null, //该att人物在CharacterConfig中的序号，应写于attF中
    egg1: { title: '', serial: null, },
    egg2: { title: '', serial: null, },
    egg3: { title: '', serial: null, },
    prevScene: 'Main',
    currSerial: null,
    endAlert: '恭喜您通关《猎头骑士》！您可以重复体验游戏以获得更多结局和彩蛋。',
};

export var ReviewList = [];
export var RevListLen = 0;
export var PurchaseChap = { serial: 0, price: null, };


VM.add(PlotData, 'plot');
VM.add(ReviewList, 'review');
VM.add(RevListLen, 'revLen');
VM.add(PurchaseChap, 'pChap'); // 弹出章节购买提示用


const EndChapter = 10; //结束游戏的章节
const FalseEndChapter = 0;
const EndEnergy = 0; //能量值为0，结束游戏


cc.Class({
    extends: cc.Component,
    properties: {
        playSpeed: 0,
        testIndex: 99999,
        testChap: 1,
        canvasNode: null,
        revPrefab: null,

        _autoSaved: null, //自动存档object
        _globalData: null, //全局存档数据
        _metaData: null, //meta存档

        _convArr: null, //用于存档的conversation数组 []
        _initConv: false, //是否在start时initConv

        _reviewList: [], //回放功能使用，下面rev开头的都是
        _revStr: "",
        _reviewLabel: null, //废弃，使用reviewNode
        _reviewNode: null,
        _revOn: false, //回看界面是否被打开

        _isAuto: 0, //是否开启了自动播放，0未开启，1速度1，2速度2，3速度3
        _isTyping: 0, //打字机打字中
        _isStop: false,
        _isConv: false, //conv模式
        _originA: null,
        _originB: null,
        _prevEmo: null, //记录上一个emo信息，4位

        _currChap: 0, //当前章节号
        _currAtt: 0,
        _lastBG: null,

        _dialogStr: "", //当前播放的对话内容
        _dialogNode: null,
        _dialogLabel: null, //对话文本框
        _richNode: null,
        _richLabel: null, //实验，richtextLabel

        _currTextIndex: 0, //当前播放内容的索引
        _currPlotIndex: 0, //当前对话列表的索引

        _textNode: null, //名字+对话的整个Node
        _nameLabel: null, //人物名字Label
        _nameStr: "", //当前的名字

        _aChar: null,
        _bChar: null,
        _cChar: null,
        _charNode: null,
        _charSP: null,
        _picStr: "", //相当于name脚本中的_dialogStr, 用于临时存放当前的图片url
        _posList: [], //存放position的List
        _currPos: 0, //当前的position是A还是B？    
        _scNode: null, // 章节显示Node
        _animNode: null, //Anim-red Node
        _fullHeadNode: null, // Anim-head Node
        _stNode: null, //Stamp Node

        _tipsNode: null,
        _tipsLabel: null,

        _whiteNode: null,
        _whiteLabel: null,

        _isAttack: false,
        _inOpt: 0, // 选择肢现实中中的状态，应屏蔽点击事件
        _isOpt: false, // 在攻略-选项模块中
        _opNameList: null, //选择的对应内容是alist还是blist
        _opDiaList: null,
        _opIndex: 0,
        _currAttIndex: 0,
        _plotF: null,
        _attF: null,
        _initCase: 0,
        _enableClick: true,
        _postAttSuccess: false, //该状态下，不会dialogend进入下一条

        _decOp: false,
        _savePlotIndex: 0,

        _prevF: null,
        _prevID: null,

        _optNode: null,
        _aLabel: null,
        _bLabel: null,
        _aArray: null,
        _bArray: null,
        _quitNo: null,
        _info: null,


        _endEvent: null, //结束处理事件
        _stopPoint: 0, //结束时的剧本编号
    },

    onLoad() {
        this.canvasNode = cc.find("Canvas");
        this._dialogNode = cc.find("Canvas/Dialog/Text Area/Say/Widget");
        this._dialogLabel = cc.find("Canvas/Dialog/Text Area/Say/Widget").getComponentInChildren(cc.Label);
        this._richNode = this._dialogNode.getChildByName('richText');
        this._richLabel = cc.find("Canvas/Dialog/Text Area/Say/Widget").getComponentInChildren(cc.RichText);
        this._richLabel.active = true;

        this._nameNode = cc.find("Canvas/Dialog/Text Area/Name");
        this._nameLabel = this._nameNode.getComponentInChildren(cc.Label);
        let chars = this.canvasNode.getChildByName("Characters");
        this._aChar = chars.getChildByName("A");
        this._bChar = chars.getChildByName("B");
        this._cChar = this.canvasNode.getChildByName("CharacterC");
        this._textNode = this.canvasNode.getChildByName("Dialog");
        this._optNode = this.canvasNode.getChildByName("Options");

        this._scNode = this.canvasNode.getChildByName('BG').getChildByName('Chap');
        this._stNode = this.canvasNode.getChildByName('BG').getChildByName('Stamp');
        this._animNode = this.canvasNode.getChildByName('BG').getChildByName('Anim');
        this._fullHeadNode = this.canvasNode.getChildByName('Full_Head');
        this._whiteNode = this.canvasNode.getChildByName('BG').getChildByName('White');
        this._whiteLabel = this._whiteNode.getComponentInChildren(cc.Label);

        let GENode = cc.find('Canvas/Game_End');
        GENode.active = false;

        this._tipsNode = this.canvasNode.getChildByName('Tips');
        this._tipsLayout = this._tipsNode.getChildByName('Layout');
        this._tipsLabel = this._tipsLayout.getComponentInChildren(cc.Label);
        this._tipsRichLabel = this._tipsLayout.getComponentInChildren(cc.RichText);

        this._aLabel = this._optNode.getChildByName("OptionA").getChildByName("Right").getComponentInChildren(cc.Label);
        this._bLabel = this._optNode.getChildByName("OptionB").getChildByName("Right").getComponentInChildren(cc.Label);

        var revBtnNode = this.canvasNode.getChildByName("Dialog").getChildByName("btn Review");
        var autoBtnNode = this.canvasNode.getChildByName("Dialog").getChildByName("btn Auto");

        this.autoLB = autoBtnNode.getChildByName('Background').getComponentInChildren(cc.Label);
        this.autoLB.string = '';

        var optA = this._optNode.getChildByName('OptionA');
        var optB = this._optNode.getChildByName('OptionB');


        this._metaData = LoadMeta();
        this._autoSaved = LoadGameData('AutoSave');
        this._globalData = LoadGameData('GlobalData');



        // 点击Canvas，关闭回放 / 对话前进的事件注册。优先关闭回放
        this.canvasNode.on(cc.Node.EventType.TOUCH_START, function() {
            if (this._revOn) {
                this.closeReview();
            } else {
                if (this._enableClick) {
                    this.onClickSay();
                } else { console.log('onClick 已关闭响应') };
            };
        }, this);

        // 回看 自动 按钮的注册
        revBtnNode.on(cc.Node.EventType.TOUCH_END, this.showReview, this);
        autoBtnNode.on(cc.Node.EventType.TOUCH_END, function() { this.autoPlay(this._setClick) }, this);

        //选项注册
        optA.on(cc.Node.EventType.TOUCH_END, function() {
            this.optChoose('A', this._emit);

        }, this);
        optB.on(cc.Node.EventType.TOUCH_END, function() {
            this.optChoose('B', this._emit);

        }, this);

        this.node.on('dialogEnd', function() {
            if (!this._postAttSuccess) {
                this.analyzeContent(this.beforeDataUpdate);
            }
        }, this);

        //接受从Energy脚本传递的事件
        this.node.on('energyVal', function(val) {
            this._autoSaved.energy = val;
            console.log('收到energyVal事件' + val);
            SaveGameData(this._autoSaved, 1); //更新存档
            if (val <= 0) {
                //EndGame
                this.endGame(this, 4, this._afterEndGame);
            };

        }, this);


        this.node.on('chapterLock', function() {
            console.log('收到chapterLock事件');


        }, this);

        this.node.on('energyEnd', function() {
            this.endGame(this, 3, this._afterEndGame);
        }, this);

        this.node.on('resetGame', function() {
            this.resetGame(this, this._afterResetGame);
        }, this)

        let pan = this.canvasNode.getChildByName('Att_Success');
        pan.active = false;
        let eggs = cc.find('Canvas/Att_Success/Background/Eggs');
        let A = eggs.getChildByName('A').getChildByName('Button');
        let B = eggs.getChildByName('B').getChildByName('Button');
        let C = eggs.getChildByName('C').getChildByName('Button');

        PlotData.prevScene = 'Main';
        A.on(cc.Node.EventType.TOUCH_END, function() {
            console.log('收到点击 A');
            PlotData.currSerial = PlotData.egg1.serial;
            this.loadEggScene();
        }, this);
        B.on(cc.Node.EventType.TOUCH_END, function() {
            console.log('收到点击 B');
            PlotData.currSerial = PlotData.egg2.serial;
            this.loadEggScene();
        }, this);
        C.on(cc.Node.EventType.TOUCH_END, function() {
            PlotData.currSerial = PlotData.egg3.serial;
            this.loadEggScene();
        }, this);

        var autoID = this._autoSaved.index;

        //非test，正常运行
        this._currChap = this._autoSaved.chapter;
        this._currAtt = this._autoSaved.attChapter;

        //普通章节\att状态
        this._isAttack = this._autoSaved.pState;

        //是否conv状态

        let f1 = this._autoSaved.chapter;
        let f2 = this._autoSaved.attChapter;
        let f3 = this._autoSaved.prevChapter; //prevChapter本来就是'Chapter/Attack + num'的string
        //console.log('f3: ' + f3);

        //处理各个章节衔接关系
        this._prevID = this._autoSaved.prevIndex;

        if (f3) {
            if (f3.indexOf('Chapter') != -1) {
                //存档中，prevChapter为正文类型
                f3 = f3.substring(7, );
                this._plotF = RequireChapter(f3, 1, true);
                this._prevF = this._plotF;
                this._attF = RequireChapter(f2, 2, true);


                //console.log('f3已加载');
            } else if (f3.indexOf('Attack') != -1) {
                f3 = f3.substring(6, );
                this._attF = RequireChapter(f3, 2, true);
                this._prevF = this._attF;
                this._plotF = RequireChapter(f1, 1, true)
            };
        } else {
            this._plotF = RequireChapter(f1, 1, true);
            this._attF = RequireChapter(f2, 2, true);
        };

        if (this._plotF == 'CHAPTERLOCK') { this.node.emit('chapterLock') }



        if (!this._isAttack) {
            this._currPlotIndex = autoID;
            this._currAttIndex = autoID;
        } else {
            this._currAttIndex = autoID;
            this._currPlotIndex = autoID;
        };

        // 上次断档处是conv
        if (this._autoSaved.conv) {
            chars.active = true;
            this._cChar.active = false;
            this._isConv = true;
            this._initConv = true;
        } else {
            chars.active = false;
            this._cChar.active = false;
        };

        this._globalData.GameState.justEnded = false;
        this._globalData.GameState.newUser = false;
    },


    start() {
        var content;
        var id;

        if (this._isAttack) {
            content = this._attF;
            id = this._currAttIndex;
        } else {
            content = this._plotF;
            id = this._currPlotIndex;
        };


        //console.log('content[id] ' + content[id].Character);

        this._dialogStr = content[id].Dialog;
        this._nameStr = content[id].Character;
        this._picStr = content[id].Emo + '';
        this._picStr = 'Pic/' + this._picStr.substring(1, );
        this._optNode.active = false;
        this._isTyping = false;
        this._initCase = 1;

        if ((this._currChap == EndChapter) && (content == this._plotF) && (id == content[0]['max'])) {
            //console.log('已经是最后一章最后一条');
        } else {
            this.node.emit('dialogEnd');
        };

        this._scNode.active = false;
        this._animNode.active = false;
        this._fullHeadNode.active = false;
        this._animNode.zIndex = 0;

        this._tipsRichLabel.maxWidth = this._tipsLayout.width;
        this._richLabel.maxWidth = this._dialogNode.width - 5;

        SaveGameData(this._globalData, 2); //更新newUser justEnded状态
        SaveMeta(this._metaData);
        this._initBG(this, this._loadBG);
    },

    chooseTyper(str, nd, speed) {

        if (str.indexOf('<') == -1) {
            //console.log('没有找到<');
            if (nd == this._textNode) {
                let lb = this._dialogLabel;
                this._richLabel.string = '';
                this.labelWriter(str, nd, lb, speed);
            } else if (nd == this._tipsNode) {
                let lb = this._tipsLabel;
                this._tipsRichLabel.string = '';
                this.labelWriter(str, nd, lb, speed);
            };

        } else {
            console.log('找到了<');
            if (nd == this._textNode) {
                let lb = this._richLabel;
                this._dialogLabel.string = '';
                this.richTextTyper(str, nd, lb, speed);
            } else if (nd == this._tipsNode) {
                let lb = this._tipsRichLabel;
                this._tipsLabel.string = '';
                this.richTextTyper(str, nd, lb, speed);
            };
        };
    },

    richTextTyper(str, nd, lb, speed) {
        let delimiterCharList = ['✁', '✂', '✃', '✄', '✺', '✻', '✼', '❄', '❅', '❆', '❇', '❈', '❉', '❊'];
        let regexp = /<.+?\/?>/g;
        let matchArr = str.match(regexp);
        let delimiterChar = delimiterCharList.find((item) => str.indexOf(item) == -1);
        let replaceStr = str.replace(regexp, delimiterChar);
        let tagInfoArr = [];
        let temp = [];
        let tagInfo = {
            endStr: '',
            endtIdx: '',
            startIdx: '',
            startStr: '',
        };
        let num = 0;
        for (let i = 0; i < replaceStr.length; i++) {
            if (replaceStr[i] == delimiterChar) {
                temp.push(i);
                if (temp.length >= 2) {
                    tagInfo.endStr = matchArr[tagInfoArr.length * 2 + 1];
                    tagInfo.endtIdx = i - num;
                    tagInfoArr.push(tagInfo);
                    temp = [];
                    tagInfo = {};
                } else {
                    tagInfo.startIdx = i - num;
                    tagInfo.startStr = matchArr[tagInfoArr.length * 2];
                }
                num += 1;
            }
        }

        let showCharArr = str.replace(regexp, '').split('');
        let typerArr = [];
        for (let i = 1; i <= showCharArr.length; i++) {
            let temp = showCharArr.join('').slice(0, i);
            let addLen = 0;
            for (let j = 0; j < tagInfoArr.length; j++) {
                let tagInfo = tagInfoArr[j];
                let start = tagInfo.startIdx;
                let end = tagInfo.endtIdx;
                if (i > start && i <= end) {
                    temp = temp.slice(0, start + addLen) + tagInfo.startStr + temp.slice(start + addLen) + tagInfo.endStr;
                    addLen += tagInfo.startStr.length + tagInfo.endStr.length;
                } else if (i > end) {
                    temp =
                        temp.slice(0, start + addLen) +
                        tagInfo.startStr +
                        temp.slice(start + addLen, end + addLen) +
                        tagInfo.endStr +
                        temp.slice(end + addLen);
                    addLen += tagInfo.startStr.length + tagInfo.endStr.length;
                }
            }
            typerArr.unshift(temp);
        }

        var index = this._currTextIndex;
        var arrLen = typerArr.length;

        this.typerTimer && clearInterval(this.typerTimer);
        this.typerTimer = setInterval(() => {
            if (!nd.active) { return };
            if ((this._isTyping) && (!this._isStop)) {
                if (index < arrLen) {
                    lb.string = typerArr.pop();
                    index++;
                } else {
                    //this.typerTimer && clearInterval(this.typerTimer);
                    this._isTyping = false;
                    //lb.string = str;
                    clearInterval(this.typerTimer);
                }
            } else if (!this._isTyping) {
                this._isTyping = false;
                lb.string = str;
                clearInterval(this.typerTimer);

                // this.typerTimer && clearInterval(this.typerTimer);
            } else if (this._isStop) {
                return;
            }
        }, speed);
    },

    labelWriter(text, nd, lb, speed) {
        let self = this;
        let index = self._currTextIndex;
        // text = text || ""; //text具有真值，否则赋给空字符串

        let func = setInterval(function() {
            if (!nd.active) { return; }
            if ((self._isTyping) && (!self._isStop)) {
                if (index < text.length) {
                    lb.string = text.substr(0, ++index);
                    return;
                } else {
                    self._isTyping = false;
                    clearInterval(func);
                }
            } else if (!self._isTyping) {
                lb.string = text;
                clearInterval(func);
            } else if (self._isStop) {
                return;
            }
        }, speed);
    },

    typeWriterWhiteMode(text, nd, lb, speed) {
        let self = this;
        let index = self._currTextIndex;
        var inTween = false;

        let func = setInterval(function() {
            if (!nd.active) { return; }
            if ((self._isTyping) && (!self._isStop)) {
                if ((index == 0) && (!inTween)) {
                    cc.tween(nd)
                        .call(() => {
                            inTween = true;
                            //console.log('设置intween 为 true');
                        })
                        .show(0.3, { easing: "easeOut" })
                        .call(() => {
                            inTween = false;
                            //console.log('设置intween 为 false');
                        })
                        .start(nd)
                } else if ((index == 0) && (inTween)) {
                    cc.tween(nd)
                        .hide(0.1)
                        .show(0.3, { easing: "easeOut" })
                        .start(nd)
                };

                if (index < text.length) {
                    lb.string = text.substr(0, ++index);
                    return;
                } else {
                    self._isTyping = false;
                    clearInterval(func);
                }
            } else if (!self._isTyping) {
                lb.string = text;

                clearInterval(func);
            } else if (self._isStop) {
                return;
            }
        }, speed);

    },

    onClickSay() {

        if (this._isTyping) {
            if (!this._isAuto)
                this._isTyping = false; //打字中，点击效果为停止打字，显示全句
        } else {
            //打字机播放已经停止的状态下， 触发 dialogEnd，index+，进入下一条
            this._enableClick = false;
            this._dialogLabel.string = '';
            this._nameLabel.string = '';
            this._dialogStr = '';
            this._currTextIndex = 0;
            this.node.emit('dialogEnd');
        };
    },

    updateAutoSave(self, callback) {
        console.log('UpdateAutoSave ----------');
        if (self._isAttack) {
            self._autoSaved.index = self._currAttIndex;
        } else {
            self._autoSaved.index = self._currPlotIndex;
        };

        self._autoSaved.conv = self._convArr; // []或null
        //console.log('------conv： ' + self._convArr);
        self._autoSaved.pState = self._isAttack;
        self._autoSaved.chapter = self._currChap;
        self._autoSaved.attChapter = self._currAtt;
        self._autoSaved.prevChapter = 'Chapter' + self._currChap;
        self._autoSaved.prevIndex = self._prevID;

        console.log('id = ' + self._autoSaved.index);

        if (callback)
        // _saveData, auto类型
            callback(self._autoSaved, 1);
    },

    updateAttData(self, result, callback) {
        var charNum = self._attF[0]['attNo'];

        if (!charNum) { console.log('没找到curAtt编号所对应的人物，可能是config错漏？'); return; }

        //att失败情况：记录对应的结果为2，存档
        if (result == false) {
            self._globalData.attacked[charNum] = 2; //att文件编号与人物的对应逻辑？
            console.log('攻略失败情况已存档，index = ' + self._currPlotIndex);
        } else {
            //att成功情况：记录对应结果为1，存档
            self._globalData.attacked[charNum] = 1;
            console.log('攻略成功情况已存档');
        };

        if (callback) {
            // _saveData, Global类型
            callback(self._globalData, 2);
        };
    },

    _saveData(data, type, callback) {
        SaveGameData(data, type);

        if (callback) {
            callback();
        };
    },

    onAttSuccess(self, name, no, callback) {
        // test打包 去掉以下部分
        //self.canvasNode.pauseSystemEvents(true);
        //self._postAttSuccess = true;
        self._textNode.active = false;

        if (self._currAttIndex >= self._attF[0]['max']) {
            //console.log('attindex 超出上限，进行转换');
            self._isAttack = false;
            self._currAttIndex = 1;
        };

        if (self._prevID > self._plotF[0]['max']) {
            self._currChap += 1;
            self._currPlotIndex = 1;
            self._prevID = 1;
        };

        self.updateAutoSave(self, self._saveData);

        let lb = cc.find('Canvas/Att_Success').getComponentInChildren(cc.Label);
        lb.string = '人物：{{0}}，\n 第一个彩蛋：{{1}}';


        let data = constEggChoose(no);
        PlotData.attName = name;
        PlotData.egg1.title = data.egg1.title;
        PlotData.egg2.title = data.egg2.title;
        PlotData.egg3.title = data.egg3.title;
        PlotData.egg1.serial = data.egg1.serial;
        PlotData.egg2.serial = data.egg2.serial;
        PlotData.egg3.serial = data.egg3.serial;

        if (callback) {
            // test 有deactivate，正式则去掉
            callback(self, self._deactivateVMLabel);
        }
    },

    _activateVMLabel(self, callback) {
        let pan = cc.find('Canvas/Att_Success');
        pan.active = true;

        if (callback) { callback(); }
    },

    _deactivateVMLabel() {
        let pan = cc.find('Canvas/Att_Success');
        pan.active = false;
    },

    loadEggScene() {
        console.log('loadScene已调用');
        // this._postAttSuccess = false;
        cc.director.loadScene("EggsPlay", () => {
            cc.sys.garbageCollect();
        });
    },



    analyzeContent(callback) {
        //在数据更新前调用
        var self = this;
        var content;
        var id;
        var type; //1显示plotF，2显示attF，3显示opArray，4 opArray播到最后一条了 5 播完这条就要quit
        var aTip; //攻略环节开始，加载Att Tips.替代 type = 6 的作用

        var stop = false; //在attSuccess、无下一章节情况，需要停止后续的数据显示

        if (self._isOpt) {
            content = self._opArray;
            //console.log('opArray: ' + self._opArray);
            if ((self._initCase) && (self._opIndex)) { id = self._opIndex } else {
                id = self._opIndex + 1;
                console.log('analyz中，本条的opIndex： ' + self._opIndex);

            };
            type = 3; //一般的opArray播放状态
            if (content[id] == null) {
                if ((id - 1) == content['quit']) {
                    console.log('到了quit条，content.quit = ' + content['quit']);
                    type = 5; //opArray - quit
                } else {
                    type = 4; // opArray - 
                }
            }
        } else
        if (self._isAttack) { // attack开
            content = self._attF; //默认为attf
            if (self._initCase) { id = self._currAttIndex } else {
                id = self._currAttIndex + 1;
            };
            type = 2;

            if (content[id] == null) { // attack文件正常播完
                console.log('Analyze，attack文件播完，切换为plotf');
                content = self._plotF;
                id = self._currPlotIndex;
                self._isAttack = false;


                //以下两个if 是测试去掉彩蛋显示时用的
                // if (self._currAttIndex >= self._attF[0]['max']) {
                //     console.log('attindex 超出上限，进行转换');
                //     self._isAttack = false;
                //     self._currAttIndex = 1;
                //     type = 1;

                // };

                // if (self._currPlotIndex > self._plotF[0]['max']) {
                //     self._currChap += 1;
                //     self._currPlotIndex = 1;
                // };


                //这是带有彩蛋显示的正式版本
                if ((self._attF[0]['attName']) && (self._attF[0]['attNo'])) {
                    self.onAttSuccess(self, self._attF[0]['attName'], self._attF[0]['attNo'], self._activateVMLabel)
                        //test取消stop
                        // stop = true;
                } else { console.log('Att File 缺少人物名称、编号'); }



                self.updateAttData(self, true, self._saveData);
            };

        } else {
            content = self._plotF;
            if (self._initCase) { id = self._currPlotIndex } else {
                id = self._currPlotIndex + 1;
            };

            //该章节最后一条的处理
            if (id > content[0]['max']) {

                self._currChap++;
                let result = RequireChapter(self._currChap, 1, false);
                //self._plotF = RequireChapter(self._currChap, 1, false);

                if (result == 'END') {
                    self._isAuto = false;
                    //EndGame
                    self.endGame(self, 4, self._afterEndGame);
                    callback = null;
                } else if (result == 'CHAPTERLOCK') {
                    self.node.emit('chapterLock');
                } else if (result != null) {
                    self._plotF = result;
                    self._currPlotIndex = 1;
                    self._initCase = 1;
                    id = self._currPlotIndex;
                    content = self._plotF;
                };

                console.log('当前播放结束，进入chapter ：' + self._currChap);
                type = 1;


            } else if (content[id].Character.indexOf('攻略环节') != -1) { //下一条是攻略环节
                console.log('Analyze，攻略环节提示  ' + id);
                self._currAtt = content[id].Dialog;
                let f = 'Attack' + self._currAtt;
                self._attF = RequireChapter(self._currAtt, 2, false);
                self._isAttack = true;
                self._currPlotIndex = id + 1;
                self._currAttIndex = 0;
                content = self._attF;
                id = 0;
                type = 6;
                aTip = true;
                //console.log('重置id： ' + id);
                //console.log('content[id].Character:' + content[id].Character);

            } else {
                type = 1;
            };
        };

        if (!content) { stop = true };

        if ((content[id] != null) && (content[id].Character != null)) {


            var currName = content[id].Character;
            var optA;
            var optB;
            var aStr;
            var bStr;
            var quit;
            var startOp;
            var endOp;

            var sys;
            var textSwitch;
            var charOff;
            var emo;
            var picChange = true;
            var bg;
            var st;
            var textOff = false;
            var switchap;
            var anim;
            var eVal;
            var pos;
            var poSwitch;
            var conv;
            var decOpt;
            var meet;
            var mode;
            var float;

            if ((currName.indexOf('背景') == -1) && (currName.indexOf('场景') == -1) && (currName.indexOf('【') == -1)) {
                self._reviewUpdate(self, content[id].Character + "：" + content[id].Dialog);
            } else if ((currName.indexOf('背景') != -1) || (currName.indexOf('场景') != -1)) {
                self._reviewUpdate(self, '');
            };


            //背景图的情况
            if ((currName.indexOf('背景') != -1) || (currName.indexOf('场景') != -1)) {
                console.log('检测到了背景关键字');
                textOff = true;
                bg = content[id].Dialog;
                if (content[id].Switchap) {
                    switchap = content[id].Switchap;
                };
            };
            if (content[id].Mode) { mode = content[id].Mode };

            if (content[id].Stamp) {
                st = content[id].Stamp;
            };

            //系统提示情况
            if (currName.indexOf('系统') != -1) {
                sys = content[id].Dialog;
                console.log('===analyze,sys = ' + sys);
            };

            //记录角色登场
            if (content[id].Meet) {
                meet = content[id].Meet;
            };

            //动画播放
            if (content[id].Anim) {
                anim = content[id].Anim;
                console.log('本条含有anim：' + anim);
                console.log('id= ' + id);
            };

            //energy变化情况
            if (content[id].Energy) {
                eVal = content[id].Energy;
                //console.log("这一条含有energy信息：" + eVal);
            };

            // conversation初始化显示
            if (content[id].Conversation) {
                conv = content[id].Conversation;
                self._isConv = true;
                charOff = true; //之前为什么取消这个？疑似祁笑头有问题的原因
            };

            emo = content[id].Emo;

            // 确定立绘显示的位置(pos)
            if (content[id].Emo >= 1000) {
                pos = content[id].Emo + '';
                pos = pos.substring(0, 1);

                if (pos == 1) {
                    self._isConv = false;
                    self._convArr = null
                };
            };


            //更换图片情况
            if (id > 1) {
                var a1 = content[id].Emo + '';
                var a0 = content[id - 1].Emo + '';

                if (pos) {
                    var pos0 = a0.substring(0, 1);
                    if ((pos != pos0) && (pos != 1) && (pos0 != 1) && (a1 != a0)) {
                        poSwitch = true; // pos和pos0分别为2或3,同时
                    } else if (conv) {
                        poSwitch = true;
                    } else {
                        poSwitch = false;
                    }
                };

                if ((a1.substring(1, 2)) != (a0.substring(1, 2))) {
                    charOff = true; //需要把charNode切换成 inactive
                } else if (a1.substring(2, 3) != (a0.substring(2, 3))) { charOff = true; } else { charOff = false };

                // 这里是判断是否4位都一样
                if (a1 == a0) { picChange = true } else { picChange = false };

            } else { charOff = true };

            if (content[id].Float) { float = content[id].Float };

            if ((type == 6) || (bg)) {
                charOff = true;
                textOff = true;
            };



            //选项开始，涉及到 opt相关状态
            if (!self._isOpt) { // ! 选择肢显示状态
                if (currName.indexOf('选项A') != -1) {
                    //进入选择肢显示状态
                    self._isOpt = true;
                    self._inOpt = true;

                    self._enableClick = false;
                    self.canvasNode.pauseSystemEvents(true);

                    self._opIndex = 1;
                    textOff = true;
                    startOp = id;
                    optA = id;
                    aStr = content[id].Dialog;
                    var aNList = [];
                    var bNList = [];
                    var aDList = [];
                    var bDlist = [];
                    var aPList = [];
                    var bPList = [];
                    var aFList = [];
                    var bFList = [];
                    var aCList = [];
                    var bCList = [];


                    if (aStr.indexOf('【Quit】') != -1) {
                        aStr = aStr.substring(6, );
                        quit = 'A';
                    };


                    for (let a = id; a <= content[0]['max']; a++) {
                        var name = content[a].Character;
                        //console.log('name： ' + name);
                        if (name.indexOf('选项B') != -1) {
                            optB = a;
                            bStr = content[a].Dialog;
                            if (bStr.indexOf('【Quit】') != -1) {
                                bStr = bStr.substring(6, );
                                quit = 'B';
                            };
                            break;
                        };
                    };

                    for (let a = id; a <= content[0]['max']; a++) {
                        var name = content[a].Character;
                        //console.log('name： ' + name);
                        if (name.indexOf('EndOption') != -1) {
                            endOp = a;
                            break;
                        };
                    };
                    // console.log('optA = ' + optA + "  optB = " + optB);
                    // console.log('endop : ' + endOp);

                    for (let a = optA + 1; a < optB; a++) {
                        aNList.push(content[a].Character);
                        aDList.push(content[a].Dialog);
                        aPList.push(content[a].Emo);
                        let fl = content[a].Float || null;
                        aFList.push(fl);
                        let conv = content[a].Conversation || null;
                        aCList.push(conv);
                    };

                    for (let a = optB + 1; a < endOp; a++) {
                        bNList.push(content[a].Character);
                        bDlist.push(content[a].Dialog);
                        bPList.push(content[a].Emo);
                        let fl = content[a].Float || null;
                        bFList.push(fl);

                        let conv = content[a].Conversation || null;
                        bCList.push(conv);

                    };

                    var toArray = function(nlist, dlist, plist, flist) {
                        var result = {};
                        var len = nlist.length;
                        result['quit'] = 0;
                        result[0] = { Character: 0, Dialog: 0, }
                        var n;
                        for (n = 0; n < len; n++) {
                            if (!flist[n]) {
                                result[n + 1] = {
                                    Character: nlist[n],
                                    Dialog: dlist[n],
                                    Emo: plist[n],
                                }
                            } else {
                                result[n + 1] = {
                                    Character: nlist[n],
                                    Dialog: dlist[n],
                                    Emo: plist[n],
                                    Float: flist[n],
                                }
                            }
                            result['quit'] = n + 1;
                        };
                        return result;
                    };

                    self._aArray = toArray(aNList, aDList, aPList, aFList);
                    self._bArray = toArray(bNList, bDlist, bPList, aFList);
                    if (quit == 'A') { self._bArray['quit'] = -1 } else { self._aArray['quit'] = -1 };
                    //console.log('aarray的长度是：' + self._aArray.length + ' barray长度： ' + self._bArray.length);

                    if ((self._aArray.length == null) && (self._bArray.length == null) && (!self._isAttack)) {
                        //非真实攻略选择，不做具体的更改
                        type = 3;
                        decOpt = true;
                        self._isOpt = false;
                        self._opIndex = null;
                    };

                    self._prevF = content;
                    if (content == self._attF) {
                        self._prevID = endOp;
                        console.log('正在init选项状态。prevID = ' + endOp);
                    } else {
                        self._prevID = self._currPlotIndex;
                        console.log('prevID:  ' + self._prevID);
                    };
                };
            };
        };

        class obj {
            constructor(sys, pos, ton, tp, tn, cn, emo, pch, ps, bg, st, sc, an, ev, so, eo, oa, ob, dec, as, bs, qu, cv, mt, at, md, fl) {
                this.sys = sys;
                this.pos = pos;
                this.textOff = ton;
                this.type = tp;
                this.textSwitch = tn;
                this.charOff = cn;
                this.emo = emo;
                this.picChange = pch; //指pic是否4位都一样，包括pos
                this.poSwitch = ps;
                this.bg = bg;
                this.stamp = st;
                this.switchap = sc;
                this.anim = an;
                this.eVal = ev;
                this.startOp = so;
                this.endOp = eo;
                this.optA = oa;
                this.optB = ob;
                this.decOpt = dec;
                this.aStr = as;
                this.bStr = bs;
                this.quit = qu;
                this.conv = cv;
                this.meet = mt;
                this.aTip = at;
                this.mode = md;
                this.float = fl;
            };
        };

        var info = new obj(sys, pos, textOff, type, textSwitch, charOff, emo, picChange, poSwitch, bg, st, switchap, anim, eVal, startOp, endOp, optA, optB, decOpt, aStr, bStr, quit, conv, meet, aTip, mode, float);
        self._info = info;

        if (stop) {
            self._isStop = true;
            self._textNode.active = false;
        };

        console.log('Analyze, type = ' + type);
        console.log('Analyze, id = ' + id);

        if ((!self._isStop) && (callback)) {
            // callback: beforeUpdate
            // 在 Onload时间注册处
            callback(self, self.dataUpdate);
        };
    },


    beforeDataUpdate(self, callback) {
        var info = self._info;
        var interval = 0.2;
        var bgSP = self.canvasNode.getChildByName('BG').getComponent(cc.Sprite);
        var tipsPlayEnd;
        var stampPlayEnd;
        var switchPlayEnd;
        var bgLoadEnd;

        if (info.aTip) {
            tipsPlayEnd = false;
            interval = 3.5;
            console.log('加载att_notice prefab');
            cc.resources.load('Prefab/Attack_Notice', function(err, res) {
                let tips = cc.instantiate(res);
                let anim = tips.getComponent(cc.Animation);

                var onAnimStop = function(type) {
                    //let animState = state;
                    if (type === 'stop') {
                        tipsPlayEnd = true;
                        console.log('tipsPlayEnd');
                        // 注销回调函数
                        anim.off('stop', this.onAnimStop, this);
                    }
                };

                anim.on('stop', onAnimStop, self);
                self.canvasNode.addChild(tips, 0, 'Attack_Notice');
            }.bind(self));
        };


        if (info.stamp) {
            stampPlayEnd = false;
            interval = 2.8;
            var url = 'Pic/' + info.stamp;
            var stSP = self._stNode.getComponent(cc.Sprite);
            cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                if (err) {
                    console.log('没有找到stamp图资源');
                    return;
                };
                stSP.spriteFrame = ret;
                self._stNode.active = true;
                let anim = self._stNode.getComponent(cc.Animation);

                var onAnimStop = function(type) {
                    if (type === 'stop') {
                        stampPlayEnd = true;
                        console.log('stampPlayEnd');
                        // 注销回调函数
                        anim.off('stop', this.onAnimStop, this);
                    }
                };

                anim.on('stop', onAnimStop, self);

            });
        };


        if (info.switchap) {
            switchPlayEnd = false;
            interval = 3.2
            self._scNode.getComponentInChildren(cc.Label).string = info.switchap;
            self._scNode.active = true;

            let anim = self._scNode.getComponent(cc.Animation);

            var onAnimStop = function(type) {
                if (type === 'stop') {
                    switchPlayEnd = true;
                    console.log('switchPlayEnd');
                    // 注销回调函数
                    anim.off('stop', this.onAnimStop, this);
                }
            };
            anim.on('stop', onAnimStop, self);
        };

        //逻辑：先disable，在postupdate中再去enable

        if ((!info.sys) && (!info.mode)) {
            self._textNode.active = true;
            self._tipsNode.active = false;
            self._whiteNode.active = false;
        } else if (info.sys) {
            //console.log('------读取到info.sys, beforeUpdate');
            self._textNode.active = false;
            self._tipsNode.active = false;
            self._tipsLabel.string = '';
            self._whiteNode.active = false;
        } else if (info.mode) {
            //console.log('------读取到info.mode, beforeUpdate');
            self._whiteNode.active = false;
            self._textNode.active = false;
            self._tipsNode.active = false;
            self._whiteLabel.string = '';
        };

        //根据位置信息确定charnode是哪一个
        if (info.pos == 1) {
            self._charNode = self._cChar;
            self._aChar.parent.active = false;
        } else if (info.pos == 2) {
            self._charNode = self._aChar;
        } else if (info.pos == 3) {
            self._charNode = self._bChar;
        } else if (!info.pos) {
            self._charNode = self._cChar;
        };

        //console.log('pos的值为： ' + info.pos);

        if (info.conv) {
            // 读到conv条的初始化
            self._cChar.active = false;
            self._aChar.parent.active = true;
            self._convArr = info.conv; // 用于存档
        };


        var scriptList = ['BhvSine', ];
        //切换人物，先disable，后面再启用
        if ((info.charOff) && (self._charNode)) {
            self._charNode.active = false;
            self._charNode.getComponent(cc.Sprite).spriteFrame = null;
            for (let i = 0; i < scriptList.length; i++) {
                self._charNode.getComponent(scriptList[i]).enabled = false;
            };
        };

        if (self._prevEmo != info.Emo) { //不是第一条,且emo不同
            if (!self._isConv) {
                //对话模式不处理，非对话模式才处理
                console.log('=======before阶段，使sine脚本失效');
                for (let i = 0; i < scriptList.length; i++) {
                    let ascr = self._aChar.getComponent(scriptList[i]);
                    let bscr = self._bChar.getComponent(scriptList[i]);
                    let cscr = self._cChar.getComponent(scriptList[i]);
                    if (ascr)
                        ascr.enabled = false;
                    if (bscr)
                        bscr.enabled = false;
                    if (cscr)
                        cscr.enabled = false;
                }
            }
        };

        if (info.textOff) { self._textNode.active = false };

        if ((self._inOpt) || (info.anim) || (info.switchap) || (info.sys) || (info.mode) || (info.aTip) || (info.bg)) { self._enableClick = false };


        if ((info.type == 6) && (self._charNode)) {
            self._textNode.active = false;
            self._charNode.active = false;
        };

        if (info.bg) {
            bgLoadEnd = false;
            interval = 1.5;
            self._autoSaved.bg = info.bg;

            var url = 'Pic/' + info.bg;
            cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                if (err) {
                    console.log('没有找到背景图资源');
                    return;
                };
                bgSP.spriteFrame = ret;
                console.log('成功切换了背景图');
                self.scheduleOnce(() => { bgLoadEnd = true; }, 0.15)

            });
        };

        self._nameLabel.string = '';

        if (info.meet) {
            self._globalData.known.push(info.meet);
            console.log('新遇见角色： ' + info.meet);
            self._saveData(self._globalData, 2);
        };

        //新逻辑：必须要check LOadSuccess（bg),以及checkPlayEnd（动画等）
        //通过check才能回调，否则一直执行schedule
        // console.log('-------info--------');
        // console.log(info.bg + '\n' + info.anim + '\n' + info.switchap + '\n' + info.stamp + '\n' + info.aTip);


        if ((!info.bg) && (!info.switchap) && (!info.stamp) && (!info.aTip)) {
            console.log('不需要check pass，直接回调dataupdate');
            self.scheduleOnce(function() {
                if ((callback) && (!self._isStop)) {

                    console.log('before阶段，interval = ' + interval);
                    callback(self, info, self.postDataUpdate)
                };
            }, interval);
        } else {

            var currCount = 0;

            const sched = setInterval(function() {
                currCount++;
                //console.log('sched ++');
                let bgStuck = ((info.bg) && (!bgLoadEnd));
                let stampStuck = ((info.stamp) && (!stampPlayEnd));
                console.log('bgstuck =' + bgStuck);
                console.log('stampstuck =' + stampStuck);
                if (currCount < 30) {
                    if ((info.bg) && (!bgLoadEnd)) { return };
                    if ((info.switchap) && (!switchPlayEnd)) { return };
                    if ((info.stamp) && (!stampPlayEnd)) { return };
                    if ((info.aTip) && (!tipsPlayEnd)) { return };
                } else {
                    console.log('currcount 次数过多，clear Interval');
                }
                // 以上没有return即为pass

                console.log('sched: 全部pass通过，回调dataupdate');
                if ((callback) && (!self._isStop)) {
                    callback(self, info, self.postDataUpdate);
                };
                clearInterval(sched);
            }, 0.2);

        }
    },



    dataUpdate(self, info, callback) {
        var content;
        var id;
        var interval = 0;

        //console.log('dataup中，本条的type是：' + info.type);

        if (info.type == 1) { //播放剧情正文
            content = self._plotF;
            //初始化特殊处理
            if (!self._initCase) {
                self._currPlotIndex++;
            } else { self._initCase = 0 };
            id = self._currPlotIndex;

        } else if (info.type == 2) { //播放攻略正文
            content = self._attF;
            if (!self._initCase) {
                self._currAttIndex++
            } else { self._initCase = 0 };
            id = self._currAttIndex;
        } else if (info.type == 3) { //播放选项后内容
            console.log('本次dataup中type=3 ');
            if (!info.decOpt) { //decopt为伪选项的处理，非伪时：

                content = self._opArray;
                if (!self._initCase) {
                    self._opIndex++;
                } else { self._initCase = 0; }
                id = self._opIndex;

            } else { //伪选项情况：
                console.log('本次dataup中，为伪选项情况，已经重置currplotindex');
                content = self._plotF;
                self._currPlotIndex = info.endOp;

                id = self._currPlotIndex;
                console.log('新的plotindex：' + id);
                self._isOpt = false;
                self._inOpt = true;
                self._decOp = true;

            };
        } else if ((info.type == 4)) {
            //表示该条dialog是opArray的最后一条，将切换为plot或att
            if (self._prevF == self._plotF) { //att切换为plot
                console.log('0101 op部分播放完了，准备切换到plotF');
                content = self._plotF;
                id = self._prevID;
                self._isOpt = false;
                self._isAttack = false;

            } else if (self._prevF == self._attF) {
                console.log('0102 op部分播放完了，准备切换到attF');
                //console.log('prevID是： ' + self._prevID);
                content = self._attF;
                id = self._prevID;
                self._currAttIndex = self._prevID;
                self._isOpt = false;

                if (id >= self._attF['max']) {
                    content = self._plotF;
                    id = self._currPlotIndex;
                    self._isAttack = false;
                };
            };
            id++;
            self.node.emit('dialogEnd');
        } else if (info.type == 5) {
            //quit 跳出攻略环节，直接进入plotf
            content = self._plotF;
            id = self._currPlotIndex;
            self._isOpt = false;
            self._isAttack = false;
            self._prevID = self._currPlotIndex;
            console.log('quit,直接跳出opt和att，接plotF');

            self.updateAttData(self, false, self._saveData)

        } else if (info.type == 6) {
            //不是任何的播放文字类型，而是播放动画
            if (callback) {
                callback(self, info, self._switchClick);
            };
            return;
        };

        //console.log('本条的id是：' + id);

        if (info.stamp) {
            self._stNode.active = false;
        };

        if (info.bg) {
            id++;
            self.node.emit('dialogEnd');
            return;
        } else {
            self._nameStr = content[id].Character;
            self._dialogStr = content[id].Dialog;
            self._picStr = content[id].Emo + '';
            self._nameLabel.string = self._nameStr; //显示名字

            if (!self._isConv) { //非conv，立绘在中间显示 
                self.showSprite(self, self._picStr, info, self.showAnim); //显示立绘
            } else {

                if (info.conv) {
                    var picStr1 = '' + info.conv[0];
                    var picStr2 = '' + info.conv[1];
                    var firstPic = '' + content[id].Emo;
                    var secondPic;

                    if (picStr1 == firstPic) { secondPic = picStr2 } else { secondPic = picStr1 };

                    var secondcall = function() {
                        var secallFunc = self.showSprite;
                        secallFunc(self, secondPic, info, self.showAnim).bind(self);
                    };

                    self.showSprite(self, firstPic, info, secondcall);

                    //console.log('conv信息：两次showsprite call。pic1： ' + firstPic + 'pic2: ' + secondPic);

                    self._initConv = false;
                } else {
                    self.showSprite(self, self._picStr, info, self.showAnim); //显示立绘

                };
            };

            if (info.float) { //头的漂浮效果
                console.log('======= update阶段，读取到float   ' + id);
                let scr = self._charNode.getComponent("BhvSine");
                if (scr) {
                    scr.enabled = true;
                    //console.log('enable bhvsine');
                }
            };


            //更新游戏存档：test临时取消
            self.updateAutoSave(self, self._saveData);

            //播放动画的情况


            //energy发生变化的情况
            if (info.eVal) { self.node.emit('energyChange', info.eVal) };

            //切换章节动画
            if (info.switchap) { interval = 3.6 };

            if (!self._isStop) {
                self.scheduleOnce(function() {
                    if (callback) {
                        callback(self, info, self._switchClick);
                    };
                }, interval);
            }
        };


    },

    postDataUpdate(self, info, callback) {
        if (info.type != 6) {
            self._charNode.active = true;
            self._isTyping = true;

            if (self._inOpt) {
                self._optNode.active = true;
                self._textNode.active = false;
                self._aLabel.string = info.aStr;
                self._bLabel.string = info.bStr;
            } else {
                if (info.sys) {
                    self._tipsNode.active = true;
                    self.chooseTyper(self._dialogStr, self._tipsNode, 50)
                        // self.labelWriter(self._dialogStr, self._tipsNode, self._tipsLabel, 50);
                } else if (info.mode) {
                    if (info.mode == 1) {
                        self._whiteNode.active = true;
                        self.typeWriterWhiteMode(self._dialogStr, self._whiteNode, self._whiteLabel, 120)
                            //self._whiteLabel.string = self._dialogStr;
                    };
                } else if (self._postAttSuccess) {
                    self._textNode.active = false;
                } else {
                    self._textNode.active = true;
                    // self.typeWriter(self._dialogStr, self._textNode, self._dialogLabel, 50);

                    self.chooseTyper(self._dialogStr, self._textNode, 50);
                }
            };


        } else {

        };

        if (info.switchap) {
            self._scNode.active = false;
        };
        if (info.anim == 'showHead') {

        } else if (info.anim == 'hideHead') {

        };

        if (info.Float) {
            self._prevEmo = info.Emo;
            self._prevPos = (info.Emo + '').substring(0, 1);
        };

        if (callback) {
            // 回调为 switchClick
            if ((!self._inOpt) || (info.type != 6)) {
                callback(self);
            }
        };

    },

    _switchClick(self) {
        self._enableClick = true;
    },

    optChoose(choo, callback) {
        if (this._decOp) {
            this._decOp = false;
            this._currPlotIndex++;
        };

        if (choo == 'A') {
            this._opArray = this._aArray;
        } else {
            this._opArray = this._bArray;
        };
        this._initCase = true;
        this._inOpt = false;
        this._enableClick = true;
        this.canvasNode.resumeSystemEvents(true);
        this._optNode.active = false;

        if (callback) {
            callback(this);
        }
    },

    _emit(self) {
        self.node.emit('dialogEnd');
    },

    showSprite(self, picStr, info, callback) {
        if (self._isStop) { return; }

        var cn = self._charNode;
        var sp = self._charNode.getComponent(cc.Sprite);
        var wg = self._charNode.getComponent(cc.Widget);
        var pic = picStr.substring(1, );
        var pos = picStr.substring(0, 1);

        var rescale = function(err, res, callback) {
            if (err) {
                //console.log('rescale无法加载资源' + res);
                if (sp.spriteFrame) { console.log('该node已经有图片资源'); };
            };

            if (cc.isValid(res)) {
                var size = res.getOriginalSize();
                var char = pic.substring(0, 1);
                var part = pic.substring(1, 2); //判断加载图片是头还是身体还是全部，0全，1头，2身
                var hList = [1.08, 0.8, 1, 0.9, 1, 1, 1, 1, 1, 0.9]; //头身一起的身高列表，单身体再乘系数

                //console.log("original size :" + size + ' 角色 = ' + char + '  部分 = ' + part + '部分 = ' + pos);

                if (part == 1) {
                    var ratio = size.width / size.height;
                    var h = 350;
                    var w = 350 * ratio;

                    if (char == 4) {
                        h = 650;
                        w = 650 * ratio;
                    };

                    if (char == 3) {
                        //笼子立绘特殊处理
                        let last = pic.substring(2, 3);
                        if (last >= 3) {
                            h = 690;
                            w = 690 * ratio;
                        }
                    }

                    // 与身体同框出现的头在画面上方20%，单独出现则在正中位置
                    if (pos == 1) {
                        wg.isAlignTop = false;
                        wg.isAlignBottom = true;
                        wg.bottom = 0.5;
                    } else {
                        wg.isAlignTop = true;
                        wg.isAlignBottom = false;
                        wg.top = 0.2;
                    };

                    cn.width = w;
                    cn.height = h;

                } else if (part == 2) {
                    var ratio = size.width / size.height;
                    var h = self.canvasNode.height * 0.9 * hList[char] * 0.8;
                    var w = h * ratio;

                    if (pic == '924') {
                        h = self.canvasNode.height * 0.9 * 1.03 * 0.8;
                        w = h * ratio;
                    };

                    wg.isAlignTop = false;
                    wg.isAlignBottom = true;
                    wg.bottom = -0.05;
                    cn.width = w;
                    cn.height = h;
                } else if (part == 0) {


                    var ratio = size.width / size.height;
                    var h = self.canvasNode.height * 0.9 * hList[char];
                    var w = h * ratio;

                    if ((pic == '904') || (pic == '902')) {
                        h = self.canvasNode.height * 0.9 * 0.7;
                        w = h * ratio;
                    }

                    wg.isAlignTop = false;
                    wg.isAlignBottom = true;
                    wg.bottom = -0.05;
                    cn.width = w;
                    cn.height = h;
                };

                if (callback) {
                    //callback为下面的show
                    callback(res, convAnim);
                };
            } else { //console.log('未能成功load res，找不到资源') 
            };
        };

        var show = function(res, callback) {
            // 由rescale来call，接下来的callback为convAnim
            sp.spriteFrame = res;
            wg.updateAlignment();

            if (pos != 1) {
                var vpMask = cn.getChildByName('Viewport').getComponent(cc.Mask);
                var vpWD = cn.getChildByName('Viewport').getComponentInChildren(cc.Sprite);
                var otherMask;
                var otherWD;
                var thisChar;
                var otherChar;
                var thisVec;
                var otherVec;
                var otherOrigin;

                if (pos == 2) {
                    thisChar = self._aChar;
                    otherChar = self._bChar;
                    if (info.conv) {
                        self._originA = thisChar.position;
                        self._originB = otherChar.position;
                    };

                    otherOrigin = self._originB;
                    thisVec = cc.v2(120, 0);
                    otherVec = cc.v2(-100, 0);
                    otherMask = otherChar.getChildByName('Viewport').getComponent(cc.Mask);
                    otherWD = otherChar.getChildByName('Viewport').getComponentInChildren(cc.Sprite);

                } else {
                    thisVec = cc.v2(-120, 0);
                    otherVec = cc.v2(100, 0);
                    thisChar = self._bChar;
                    otherChar = self._aChar;
                    if (info.conv) {
                        self._originB = thisChar.position;
                        self._originA = otherChar.position;
                    };
                    otherOrigin = self._originA;
                    otherMask = otherChar.getChildByName('Viewport').getComponent(cc.Mask);
                    otherWD = otherChar.getChildByName('Viewport').getComponentInChildren(cc.Sprite);
                };


                if (vpMask) {
                    //console.log('vpMask为： ' + vpMask.name);
                    vpMask.spriteFrame = res;
                    vpWD.enabled = false;
                    thisChar.zIndex = 1;
                    otherChar.zIndex = 0;
                    if (otherChar.getComponent(cc.Sprite).spriteFrame) {
                        otherWD.enabled = true;
                    };
                } else { console.log('找不到vpmask，cn为：' + cn.name); };
            };

            if (self._isConv) {
                if (callback) {
                    // callback为convAnim
                    callback(thisChar, otherChar, thisVec, otherVec, otherOrigin);
                    //console.log('call convAnim');
                };
            } else {
                if ((self._originA) && (self._originB)) {
                    self._aChar.position = self._originA;
                    self._bChar.position = self._originB;
                };

                if (self._aChar.getComponent(cc.Sprite).spriteFrame) {
                    self._aChar.getComponent(cc.Sprite).spriteFrame = null;
                };
                if (self._bChar.getComponent(cc.Sprite).spriteFrame) {
                    self._bChar.getComponent(cc.Sprite).spriteFrame = null;
                };
            };
        };


        var convAnim = function(thisC, otherC, thisV, otherV, otherO, callback) {
            //console.log('info.poswicth = ' + info.poSwitch);
            if (info.poSwitch) {
                if (!info.conv) {
                    //console.log('需要将另一个Char还原的情况' + otherO);
                    // 不是conv的第一条，切切换了pos，要把之前的还原
                    var reVec;
                    if (otherC == self._aChar) {
                        reVec = cc.v2(-120, 0);
                    } else { reVec = cc.v2(120, 0) };

                    cc.tween(otherC)
                        .by(0.4, { position: reVec }, { easing: 'quartIn' })
                        .start(otherC)
                };


                cc.tween(thisC)
                    .by(0.4, { position: thisV }, { easing: 'sineOut' })
                    .start(thisC)

                //console.log('播放了本Char的位移动画');
            };

        };



        var url = 'Pic/' + pic;
        cc.resources.load(url, cc.SpriteFrame, (err, res) => rescale(err, res, show));


        if ((info.anim) && (!self._isConv)) {
            // conv模式与anim冲突，不能同时
            if (callback) {
                // callback(self, info.anim, self._switchClick);

                callback(self, info.anim);
            }
        };

    },


    showAnim(self, anim, callback) {
        if (self._isStop) { return };

        if (anim == 'showHead') {
            self._fullHeadNode.active = true;

        } else if (anim == 'hideHead') {
            self._fullHeadNode.active = false;
        } else if (anim == 'shake') {
            let bhvShake = self.canvasNode.getChildByName('Main Camera').getComponent('BhvShake');
            bhvShake.callShake(0.02, 1.2);
        } else if (anim == 'longShake') {
            let bhvShake = self.canvasNode.getChildByName('Main Camera').getComponent('BhvShake');
            bhvShake.callShake(0.02, 2.6);
        } else if (anim == 'bigShake') {
            let bhvShake = self.canvasNode.getChildByName('Main Camera').getComponent('BhvShake');
            bhvShake.callShake(0.02, 1.2, cc.v2(50, 50));
        }

        if (callback) {
            callback(self);
        };
    },

    autoPlay(callback) {
        var self = this;
        this._isAuto++;

        if (this._isAuto >= 3) {
            this._isAuto = 0;
            this.autoLB.string = '';
        } else {
            this.autoLB.string = 'x' + this._isAuto;
        };

        if (callback) {
            callback(self);
        }
    },

    _setClick(self) {
        var interval;
        if (self._isAuto == 1) { interval = 1000 } else if (self._isAuto == 2) { interval = 600 } else { interval = 0; };

        var autoSay = function(self) {
            if (!self._isTyping) {
                //打字机播放已经停止的状态下， 触发 dialogEnd，index+，进入下一条
                self._enableClick = false;

                self._dialogLabel.string = '';
                self._nameLabel.string = '';
                self._dialogStr = '';
                self._currTextIndex = 0;

                self.node.emit('dialogEnd');
            } else return;
        };

        let click = setInterval(function() {
            if (self._isAuto == 0) { clearInterval(click) } else {
                autoSay(self);
            };
        }, interval);
    },

    _reviewUpdate(self, dial) {

        if (dial.indexOf('【Quit】') == -1) {
            self._reviewList.push(dial);
        } else {
            let str = dial.replace('【Quit】', '');
            self._reviewList.push(str);
        };

        var len = Object.keys(self._reviewList).length - 1;
        var str = "";

        if (len > 30) {
            self._reviewList.shift();
        };
        var a;
        for (a = 0; a < len; a++) {
            str += self._reviewList[a] + '\n';
        };
        self._revStr = str;

        if (cc.isValid(self._reviewLabel)) {
            self._clearReview();
            self._reviewLabel.string = self._revStr;
        };
    },

    showReview() {
        var url = "Prefab/Scroll_Review";;

        var onResourceLoaded = function(errorMessage, loadedResource) {
            if (errorMessage) { cc.log('載入Prefab失敗, 原因:'); return; }
            if (!(loadedResource instanceof cc.Prefab)) { cc.log('你載入的不是Prefab, 你做了什麼事?'); return; } //這個是型別的檢查

            var root = cc.instantiate(loadedResource);
            var revScroll = root.getComponent(cc.ScrollView);

            this.canvasNode.addChild(root, 1, "Review");
            this._reviewNode = root.getChildByName("view").getChildByName("content");

            // 操作reviewList
            this._addReviewItem(root);

            // this._reviewLabel = root.getChildByName("view").getComponentInChildren(cc.Label);
            // this._reviewLabel.string = this._revStr;

            this.scheduleOnce(function() { revScroll.scrollToBottom(0); }, 0.2);
            this._revOn = true;
        };

        if (this._revOn == false) {
            cc.resources.load(url, cc.Prefab, onResourceLoaded.bind(this));
        } else {
            this.closeReview();
        };

    },

    closeReview() {
        var root = this.canvasNode.getChildByName("Review");

        cc.tween(root)
            .hide(1, { easing: "easeOut" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                root.destroy();
                this._reviewNode = null;
                this._reviewLabel = null;
                this._revOn = false;
            })
            .start(root)
    },

    _addReviewItem(root) {
        if (cc.isValid(this._reviewNode)) {
            var len = this._reviewList.length;
            var url = 'Prefab/item_copy';

            for (let i = 0; i < len; i++) {
                cc.resources.load(url, cc.Prefab, (err, res) => {
                    if (err) { cc.log('載入Prefab失敗, 原因:' + err); return; }
                    if (!(res instanceof cc.Prefab)) { cc.log('你載入的不是Prefab, 你做了什麼事?'); return; } //這個是型別的檢查

                    let item = cc.instantiate(res);
                    let label = item.getComponent(cc.Label);
                    label.string = this._reviewList[i];

                    let name = "item" + i;
                    this._reviewNode.addChild(item, 1, name);

                });
            }


        };
    },

    _clearReview() {

        if (cc.isValid(this._reviewLabel)) {
            this._reviewLabel.string = "";
            //console.log("clearReview called");
        };
    },


    _initBG(self, callback) {
        //这里使用 .testBG，正式发布使用 .bg
        this._lastBG = this._autoSaved.bg;
        if (!this._lastBG) {
            var id;
            for (id = this._currPlotIndex; id >= 1; id--) {
                if ((this._plotF[id].Character.indexOf('场景') != -1) || (this._plotF[id].Character.indexOf('背景') != -1)) {
                    this._lastBG = this._plotF[id].Dialog;
                    break;
                };
            };
        };

        if (!this._lastBG) { this._lastBG = 'bg103' }
        //console.log('lastBG的值为：' + this._lastBG);

        this._autoSaved.bg = this._lastBG;
        if (callback) {
            callback(self);
        };
    },

    _loadBG(self) {
        var bgSP = self.canvasNode.getChildByName('BG').getComponent(cc.Sprite);
        var bgSF = bgSP.spriteFrame;

        if (bgSF == null) {
            var url = 'Pic/' + self._lastBG;
            console.log('当前没有背景图，使用' + url);
            cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                if (err) {
                    console.log('出错了，背景图在哪？');
                };
                console.log("背景图名称： " + ret.name);

                // 为什么这里直接给bgSF赋值是无效的？
                bgSP.spriteFrame = ret;
            });
        };
    },

    endGame(self, type, callback) {
        //  AutoSave不归零(?)
        //  弹出完结提示
        //  不再触发DialogEnd
        //  GlobalData中的GameState变更

        // AutoSave跟上
        self.updateAutoSave(self, self._saveData);

        // 取消事件响应
        self.canvasNode.pauseSystemEvents(true);
        self._textNode.active = false;
        self._aChar.active = false;
        self._bChar.active = false;
        self._cChar.active = false;

        self._globalData.GameState.justEnded = true;
        self._saveData(self._globalData, 2);

        if (type == 1) {
            // True End
            PlotData.endAlert = '恭喜您通关《猎头骑士》！您可以重复体验游戏以获得更多结局和彩蛋。';
        } else if (type == 2) {
            // False End，GameState变化

        } else if (type == 3) {
            // Energy End，GameState变化
            PlotData.endAlert = '你的心情只有0，头都掉了！请不要气馁，重新来过吧。';

        } else if (type == 4) {
            // TBC End
            PlotData.endAlert = '恭喜您通关了第' + EndChapter + '章，敬请期待下一章节的发布！';
        };

        let GENode = cc.find('Canvas/Game_End');
        let Step1 = GENode.getChildByName('Step1');
        let Step2 = GENode.getChildByName('Step2');
        GENode.active = true;
        GENode.zIndex = 99;
        Step1.active = true;
        Step2.active = false;

        GENode.on(cc.Node.EventType.TOUCH_END, function() {
            console.log('调用GENode反馈');
            self.toLaunch(self);
        }, self);
        if (callback) { callback(self) };
    },

    _afterEndGame(self) {
        // 回到Launch界面
        self.canvasNode.on(cc.Node.EventType.TOUCH_END, function() { self.toLaunch(self) }, self);

        // 重置Launch界面状态
    },


    resetGame(self, callback) {
        self.canvasNode.pauseSystemEvents(true);
        self._textNode.active = false;
        self._aChar.active = false;
        self._bChar.active = false;
        self._cChar.active = false;

        self._autoSaved = ASData;

        if (callback) {
            self.scheduleOnce(function() {
                callback(self);
            }, 0.5);
        }

    },

    _afterResetGame(self) {
        self.canvasNode.resumeSystemEvents(true);

        var autoID = self._autoSaved.index;
        //非test，正常运行
        self._currChap = self._autoSaved.chapter;
        self._currAtt = self._autoSaved.attChapter;

        //普通章节\att状态
        self._isAttack = self._autoSaved.pState;

        let f1 = 'Chapter' + self._autoSaved.chapter;
        let f2 = 'Attack' + self._autoSaved.attChapter;
        let f3 = self._autoSaved.prevChapter;
        console.log('f3: ' + f3);

        //处理各个章节衔接关系
        self._prevID = self._autoSaved.prevIndex;

        if (f3) {
            if (f3.indexOf('Chapter') != -1) {
                //存档中，prevChapter为正文类型
                self._plotF = require(f3);
                self._prevF = self._plotF;
                self._attF = require(f2);
                //console.log('f3已加载');
            } else if (f3.indexOf('Attack') != -1) {
                self._attF = require(f3);
                self._prevF = self._attF;
                self._plotF = require(f1);
            };
        } else {
            self._plotF = require(f1);
            self._attF = require(f2);
        };

        if (!self._isAttack) {
            self._currPlotIndex = autoID;
            self._currAttIndex = autoID;
        } else {
            self._currAttIndex = autoID;
            self._currPlotIndex = autoID;
        };

        var content;
        var id;

        if (self._isAttack) {
            content = self._attF;
            id = self._currAttIndex;
        } else {
            content = self._plotF;
            id = self._currPlotIndex;
        };

        self._dialogStr = content[id].Dialog;
        self._nameStr = content[id].Character;
        self._picStr = content[id].Emo + '';
        self._picStr = 'Pic/' + self._picStr.substring(1, );
        self._optNode.active = false;
        self._isTyping = false;
        self._initCase = 1;

        if ((self._currChap == EndChapter) && (content == self._plotF) && (id == content[0]['max'])) {
            //console.log('已经是最后一章最后一条');
        } else {
            self.scheduleOnce(function() { self.node.emit('dialogEnd'); }, 0.15)
        };

        self._scNode.active = false;
        self._animNode.active = false;
        self._animNode.zIndex = 0;

        self._initBG(self, self._loadBG);
    },

    toGallery() {
        this._isAuto = 0;
        this.autoLB.string = '';
        this._isTyping = false;
        this._isStop = true;

        cc.director.loadScene("Gallery", () => {
            //cc.sys.garbageCollect();
        });
    },

    toLaunch(self) {
        console.log('调用tomlaunch');
        self._isAuto = 0;
        self.autoLB.string = '';
        self._isTyping = false;
        self._isStop = true;

        cc.director.pause();
        cc.director.loadScene("Launch", () => {
            cc.sys.garbageCollect();
        });
    },


});