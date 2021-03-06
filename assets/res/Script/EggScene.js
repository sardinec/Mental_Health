import { PlotData } from './PlotManager';

import { LoadGameData, SaveGameData, LoadMeta, SaveMeta, } from './Module/GameData';

EndChapter: null,

    cc.Class({
        extends: cc.Component,

        properties: {
            canvasNode: cc.Node,
            _trans: cc.Node,
            _currEgg: null,
            _playSerial: null,
            _quitTo: null,
            _plotF: null,
            _currChap: null,
            _currPlotIndex: null,
            _initCase: 0,
            _enableClick: true,
            _isAttack: false,
            _isTyping: false,
            _isStop: false,
            _dialogStr: null,
            _nameStr: null,
            _picStr: null,
            _reviewList: [],

            _dialogLabel: null,
            _nameNode: null,
            _nameLabel: null,
            _aChar: null,
            _bChar: null,
            _cChar: null,
            _textNode: null,
            _optNode: null,
            _scNode: null,
            _stNode: null,
            _animNode: null,
            _whiteNode: null,
            _whiteLabel: null,

            _tipsNode: null,
            _tipsLabel: null,
            _aLabel: null,
            _bLabel: null,
            autoLB: null,

        },

        onLoad() {
            //this._trans = cc.find('Canvas/Transition');
            this.canvasNode = cc.find("Canvas");
            this._dialogLabel = cc.find("Canvas/Dialog/Text Area/Say/Widget").getComponentInChildren(cc.Label);
            this._nameNode = cc.find("Canvas/Dialog/Text Area/Name");
            this._nameLabel = this._nameNode.getComponentInChildren(cc.Label);
            let chars = this.canvasNode.getChildByName("Characters");
            this._aChar = chars.getChildByName("A");
            this._bChar = chars.getChildByName("B");
            this._cChar = this.canvasNode.getChildByName("CharacterC");
            this._textNode = this.canvasNode.getChildByName("Dialog");
            this._optNode = this.canvasNode.getChildByName("Options");

            chars.active = false;
            this._cChar.active = false;

            this._scNode = this.canvasNode.getChildByName('BG').getChildByName('Chap');
            this._stNode = this.canvasNode.getChildByName('BG').getChildByName('Stamp');
            this._animNode = this.canvasNode.getChildByName('BG').getChildByName('Anim');
            this._whiteNode = this.canvasNode.getChildByName('BG').getChildByName('White');
            this._whiteLabel = this._whiteNode.getComponentInChildren(cc.Label);


            this._metaData = LoadMeta();
            this._autoSaved = LoadGameData('AutoSave');
            this._globalData = LoadGameData('GlobalData');

            let GENode = cc.find('Canvas/Game_End');
            GENode.active = false;

            this._tipsNode = this.canvasNode.getChildByName('Tips');
            this._tipsLabel = this._tipsNode.getChildByName('Layout').getComponentInChildren(cc.Label);

            this._aLabel = this._optNode.getChildByName("OptionA").getChildByName("Right").getComponentInChildren(cc.Label);
            this._bLabel = this._optNode.getChildByName("OptionB").getChildByName("Right").getComponentInChildren(cc.Label);

            var revBtnNode = this.canvasNode.getChildByName("Dialog").getChildByName("btn Review");
            var autoBtnNode = this.canvasNode.getChildByName("Dialog").getChildByName("btn Auto");

            this.autoLB = autoBtnNode.getChildByName('Background').getComponentInChildren(cc.Label);
            this.autoLB.string = '';

            var optA = this._optNode.getChildByName('OptionA');
            var optB = this._optNode.getChildByName('OptionB');
            // ??????Canvas??????????????? / ????????????????????????????????????????????????
            this.canvasNode.on(cc.Node.EventType.TOUCH_START, function() {
                if (this._revOn) {
                    this.closeReview();
                } else {
                    if (this._enableClick) {
                        this.onClickSay();
                    } else { console.log('onClick ???????????????') };
                };
            }, this);

            // ?????? ?????? ???????????????
            revBtnNode.on(cc.Node.EventType.TOUCH_END, this.showReview, this);
            autoBtnNode.on(cc.Node.EventType.TOUCH_END, function() { this.autoPlay(this._setClick) }, this);

            //????????????
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

            //?????????Energy?????????????????????
            this.node.on('energyVal', function(val) {
                this._autoSaved.energy = val;
                console.log('??????energyVal??????' + val);
                SaveGameData(this._autoSaved, 1); //????????????
                if (val <= 0) {
                    //EndGame
                    this.endGame(this, 5, this._afterEndGame);
                };

            }, this);
        },

        start() {
            var content;
            var id;

            this._playSerial = PlotData.currSerial;

            //this._trans.active = true;
            console.log('???????????????serial?????? ' + this._playSerial);
            console.log('?????????PlotData imported:');
            console.log('1 title??????' + PlotData.egg1.title);
            console.log('1 serial??????' + PlotData.egg1.serial);
            console.log('currSerial?????? ' + PlotData.currSerial);
            // console.log('?????????????????? ' + this._quitTo);

            if (this._playSerial) {
                let f = 'Bonus' + this._playSerial;
                this._plotF = require(f);
                this._currPlotIndex = 1;
                content = this._plotF;
                id = this._currPlotIndex;
                this._currChap = this._playSerial;
                EndChapter = this._playSerial;
            } else { //test?????????????????????else??????
                this._playSerial = 13;
                let f = 'Bonus' + this._playSerial;
                this._plotF = require(f);
                this._currPlotIndex = 1;
                content = this._plotF;
                id = this._currPlotIndex;
                this._currChap = this._playSerial;
                EndChapter = this._playSerial;

            };

            console.log('content[id] ' + content[id].Character);

            this._dialogStr = content[id].Dialog;
            this._nameStr = content[id].Character;
            this._picStr = content[id].Emo + '';
            this._picStr = 'Pic/' + this._picStr.substring(1, );
            this._optNode.active = false;
            this._isTyping = false;
            this._initCase = 1;

            if (content[id] != null) {
                this.node.emit('dialogEnd');
            };

            this._scNode.active = false;
            this._animNode.active = false;
            this._animNode.zIndex = 0;

        },


        typeWriter(text, nd, lb, speed) {
            let self = this;
            let index = self._currTextIndex;
            // text = text || ""; //text???????????????????????????????????????
            console.log('-------------TypeWriting??? text = ' + text);
            console.log('isTyping : ' + self._isTyping);
            console.log('isstop : ' + self._isStop);

            let func = setInterval(function() {
                if (!nd.active) {
                    console.log('node????????????????????????');
                    return;
                }
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


        onClickSay() {

            if (this._isTyping) {
                if (!this._isAuto)
                    this._isTyping = false; //??????????????????????????????????????????????????????
            } else {
                //?????????????????????????????????????????? ?????? dialogEnd???index+??????????????????
                this._enableClick = false;
                this._dialogLabel.string = '';
                this._nameLabel.string = '';
                this._dialogStr = '';
                this._currTextIndex = 0;
                this.node.emit('dialogEnd');
            };
        },

        analyzeContent(callback) {
            //????????????????????????
            var self = this;
            var content;
            var id;
            var type; //1??????plotF???2??????attF???3??????opArray???4 opArray????????????????????? 5 ??????????????????quit
            var aTip; //???????????????????????????Att Tips.?????? type = 6 ?????????

            var stop = false; //???attSuccess????????????????????????????????????????????????????????????

            if (self._isOpt) {
                content = self._opArray;
                console.log('opArray: ' + self._opArray);
                if ((self._initCase) && (self._opIndex)) { id = self._opIndex } else {
                    id = self._opIndex + 1;
                    console.log('analyz???????????????opIndex??? ' + self._opIndex);
                };
                type = 3; //?????????opArray????????????
                if (content[id] == null) {
                    if ((id - 1) == content['quit']) {
                        console.log('??????quit??????content.quit = ' + content['quit']);
                        type = 5; //opArray - quit
                    } else {
                        type = 4; // opArray - 
                    }
                }
            } else
            if (self._isAttack) {
                content = self._attF;
                if (self._initCase) { id = self._currAttIndex } else {
                    id = self._currAttIndex + 1;
                };
                type = 2;

                if (content[id] == null) { // attack??????????????????
                    content = self._plotF;
                    id = self._currPlotIndex;
                    self._isAttack = false;

                    if ((self._attF[0]['attName']) && (self._attF[0]['attNo'])) {
                        self.onAttSuccess(self, self._attF[0]['attName'], self._attF[0]['attNo'], self._activateVMLabel)
                        stop = true;
                    } else { console.log('Att File ???????????????????????????'); }



                    self.updateAttData(self, true, self._saveData);
                };

            } else {
                content = self._plotF;
                if (self._initCase) { id = self._currPlotIndex } else {
                    id = self._currPlotIndex + 1;
                }
                console.log('analyze?????????id??????' + id);
                //console.log(content[id].Dialog);

                //??????????????????????????????
                if (id > content[0]['max']) {
                    if (self._currChap >= EndChapter) {

                        if (self._isAuto) { self._isAuto = false };
                        //EndGame
                        self.endGame(self, 5, self._afterEndGame);
                        callback = null;
                    } else {
                        self._currChap++;
                        var f = 'Chapter' + self._currChap;
                        self._plotF = require(f);
                        self._currPlotIndex = 1;
                        self._initCase = 1;
                        id = self._currPlotIndex;
                        content = self._plotF;
                        console.log('???????????????????????????chapter ???' + self._currChap);
                        type = 1;
                    };

                } else if (content[id].Character.indexOf('????????????') != -1) { //????????????????????????
                    console.log('Analyze?????????????????????  ' + id);
                    self._currAtt = content[id].Dialog;
                    let f = 'Attack' + self._currAtt;
                    self._attF = require(f);
                    self._isAttack = true;
                    self._currPlotIndex = id + 1;
                    self._currAttIndex = 0;
                    content = self._attF;
                    id = 0;
                    type = 6;
                    aTip = true;
                    console.log('??????id??? ' + id);
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

                if ((currName.indexOf('??????') == -1) || (currName.indexOf('??????') == -1) || (currName.indexOf('???') == -1))
                    self._reviewUpdate(self, content[id].Character + "???" + content[id].Dialog);



                //??????????????????
                if ((currName.indexOf('??????') != -1) || (currName.indexOf('??????') != -1)) {
                    console.log('???????????????????????????');
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

                //??????????????????
                if (currName.indexOf('??????') != -1) {
                    sys = content[id].Dialog;
                    console.log('===analyze,sys = ' + sys);
                };

                //??????????????????
                if (content[id].Meet) {
                    meet = content[id].Meet;
                };

                //????????????
                if (content[id].Anim) {
                    anim = content[id].Anim;
                    console.log('????????????anim???' + anim);
                    console.log('id= ' + id);
                };

                //energy????????????
                if (content[id].Energy) {
                    eVal = content[id].Energy;
                    //console.log("???????????????energy?????????" + eVal);
                };

                // conversation???????????????
                if (content[id].Conversation) {
                    conv = content[id].Conversation;
                    self._isConv = true;
                    //charOff = true;
                };


                // ???????????????????????????(pos)
                if (content[id].Emo >= 1000) {
                    pos = content[id].Emo + '';
                    pos = pos.substring(0, 1);

                    if (pos == 1) { self._isConv = false };
                };


                //??????????????????
                if (id > 1) {
                    var a1 = content[id].Emo + '';
                    var a0 = content[id - 1].Emo + '';

                    if (pos) {
                        var pos0 = a0.substring(0, 1);
                        if ((pos != pos0) && (pos != 1) && (pos0 != 1) && (a1 != a0)) {
                            poSwitch = true; // pos???pos0?????????2???3,??????
                        } else if (conv) {
                            poSwitch = true;
                        } else {
                            poSwitch = false;
                        }
                    };

                    if ((a1.substring(1, 2)) != (a0.substring(1, 2))) {
                        charOff = true; //?????????charNode????????? inactive
                    } else { charOff = false };
                } else { charOff = true; }



                if ((type == 6) || (bg)) {
                    charOff = true;
                    textOff = true;
                };



                //???????????????????????? opt????????????
                if (!self._isOpt) { // ! ?????????????????????
                    if (currName.indexOf('??????A') != -1) {
                        //???????????????????????????
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


                        if (aStr.indexOf('???Quit???') != -1) {
                            aStr = aStr.substring(6, );
                            quit = 'A';
                        };


                        for (let a = id; a <= content[0]['max']; a++) {
                            var name = content[a].Character;
                            console.log('name??? ' + name);
                            if (name.indexOf('??????B') != -1) {
                                optB = a;
                                bStr = content[a].Dialog;
                                if (bStr.indexOf('???Quit???') != -1) {
                                    bStr = bStr.substring(6, );
                                    quit = 'B';
                                };
                                break;
                            };
                        };

                        for (let a = id; a <= content[0]['max']; a++) {
                            var name = content[a].Character;
                            console.log('name??? ' + name);
                            if (name.indexOf('EndOption') != -1) {
                                endOp = a;
                                break;
                            };
                        };
                        console.log('optA = ' + optA + "  optB = " + optB);
                        console.log('endop : ' + endOp);

                        for (let a = optA + 1; a < optB; a++) {
                            aNList.push(content[a].Character);
                            aDList.push(content[a].Dialog);
                            aPList.push(content[a].Emo);
                            //  console.log('ADLIST :' + aDList);
                        };

                        for (let a = optB + 1; a < endOp; a++) {
                            bNList.push(content[a].Character);
                            bDlist.push(content[a].Dialog);
                            bPList.push(content[a].Emo);
                        };
                        //console.log(aNList);

                        var toArray = function(nlist, dlist, plist) {
                            var result = {};
                            var len = nlist.length;
                            result['quit'] = 0;
                            result[0] = { Character: 0, Dialog: 0, }
                            var n;
                            for (n = 0; n < len; n++) {
                                result[n + 1] = {
                                    Character: nlist[n],
                                    Dialog: dlist[n],
                                    Emo: plist[n],
                                };
                                result['quit'] = n + 1;
                            };
                            return result;
                        };

                        self._aArray = toArray(aNList, aDList, aPList);
                        self._bArray = toArray(bNList, bDlist, bPList);
                        if (quit == 'A') { self._bArray['quit'] = -1 } else { self._aArray['quit'] = -1 };
                        console.log('aarray???????????????' + self._aArray.length + ' barray????????? ' + self._bArray.length);

                        if ((self._aArray.length == null) && (self._bArray.length == null) && (!self._isAttack)) {
                            //?????????????????????????????????????????????
                            type = 3;
                            decOpt = true;
                            self._isOpt = false;
                            self._opIndex = null;
                        };

                        self._prevF = content;
                        if (content == self._attF) {
                            self._prevID = endOp;
                        } else {
                            self._prevID = self._currPlotIndex
                        };
                        //console.log('prevID:  ' + self._prevID);
                    };
                };
            };

            class obj {
                constructor(sys, pos, ton, tp, tn, cn, ps, bg, st, sc, an, ev, so, eo, oa, ob, dec, as, bs, qu, cv, mt, at, md) {
                    this.sys = sys;
                    this.pos = pos;
                    this.textOff = ton;
                    this.type = tp;
                    this.textSwitch = tn;
                    this.charOff = cn;
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
                };
            };

            var info = new obj(sys, pos, textOff, type, textSwitch, charOff, poSwitch, bg, st, switchap, anim, eVal, startOp, endOp, optA, optB, decOpt, aStr, bStr, quit, conv, meet, aTip, mode);
            self._info = info;

            if (stop) {
                self._isStop = true;
                self._textNode.active = false;
            };

            console.log('Analyze, type = ' + type);
            console.log('Analyze, id = ' + id);

            if ((!self._isStop) && (callback)) {
                // callback: beforeUpdate
                // ??? Onload???????????????
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
                console.log('??????att_notice prefab');
                cc.resources.load('Prefab/Attack_Notice', function(err, res) {
                    let tips = cc.instantiate(res);
                    let anim = tips.getComponent(cc.Animation);

                    var onAnimStop = function(type) {
                        //let animState = state;
                        if (type === 'stop') {
                            tipsPlayEnd = true;
                            console.log('tipsPlayEnd');
                            // ??????????????????
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
                        console.log('????????????stamp?????????');
                        return;
                    };
                    stSP.spriteFrame = ret;
                    self._stNode.active = true;
                    let anim = self._stNode.getComponent(cc.Animation);

                    var onAnimStop = function(type) {
                        if (type === 'stop') {
                            stampPlayEnd = true;
                            console.log('stampPlayEnd');
                            // ??????????????????
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
                        // ??????????????????
                        anim.off('stop', this.onAnimStop, this);
                    }
                };
                anim.on('stop', onAnimStop, self);
            };

            //????????????disable??????postupdate?????????enable

            if ((!info.sys) && (!info.mode)) {
                self._textNode.active = true;
                self._tipsNode.active = false;
                self._whiteNode.active = false;
            } else if (info.sys) {
                console.log('------?????????info.sys, beforeUpdate');
                self._textNode.active = false;
                self._tipsNode.active = false;
                self._tipsLabel.string = '';
                self._whiteNode.active = false;
            } else if (info.mode) {
                console.log('------?????????info.mode, beforeUpdate');
                self._whiteNode.active = false;
                self._textNode.active = false;
                self._tipsNode.active = false;
                self._whiteLabel.string = '';
            };

            //????????????????????????charnode????????????
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

            //console.log('pos???????????? ' + info.pos);

            if (info.conv) {
                self._cChar.active = false;
                self._aChar.parent.active = true;
            };

            //??????????????????disable??????????????????
            if ((info.charOff) && (self._charNode)) {
                self._charNode.active = false;
                self._charNode.getComponent(cc.Sprite).spriteFrame = null;
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
                        console.log('???????????????????????????');
                        return;
                    };
                    bgSP.spriteFrame = ret;
                    console.log('????????????????????????');
                    self.scheduleOnce(() => { bgLoadEnd = true; }, 0.15)

                });
            };

            self._nameLabel.string = '';

            if (info.meet) {
                self._globalData.known.push(info.meet);
                console.log('?????????????????? ' + info.meet);
                self._saveData(self._globalData, 2);
            };

            //?????????????????????check LOadSuccess???bg),??????checkPlayEnd???????????????
            //??????check?????????????????????????????????schedule
            console.log('-------info--------');
            console.log(info.bg + '\n' + info.anim + '\n' + info.switchap + '\n' + info.stamp + '\n' + info.aTip);


            if ((!info.bg) && (!info.switchap) && (!info.stamp) && (!info.aTip)) {
                console.log('?????????check pass???????????????dataupdate');
                self.scheduleOnce(function() {
                    if ((callback) && (!self._isStop)) {

                        console.log('before?????????interval = ' + interval);
                        callback(self, info, self.postDataUpdate)
                    };
                }, interval);
            } else {

                var currCount = 0;

                const sched = setInterval(function() {
                    currCount++;
                    console.log('sched ++');
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
                        console.log('currcount ???????????????clear Interval');
                    }
                    // ????????????return??????pass

                    console.log('sched: ??????pass???????????????dataupdate');
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

            //console.log('dataup???????????????type??????' + info.type);

            if (info.type == 1) { //??????????????????
                content = self._plotF;
                //?????????????????????
                if (!self._initCase) {
                    self._currPlotIndex++;
                } else { self._initCase = 0 };
                id = self._currPlotIndex;

            } else if (info.type == 2) { //??????????????????
                content = self._attF;
                if (!self._initCase) {
                    self._currAttIndex++
                } else { self._initCase = 0 };
                id = self._currAttIndex;
            } else if (info.type == 3) { //?????????????????????
                console.log('??????dataup???type=3 ');
                if (!info.decOpt) { //decopt????????????????????????????????????

                    content = self._opArray;
                    if (!self._initCase) {
                        self._opIndex++;
                    } else { self._initCase = 0; }
                    id = self._opIndex;

                } else { //??????????????????
                    console.log('??????dataup???????????????????????????????????????currplotindex');
                    content = self._plotF;
                    self._currPlotIndex = info.endOp;

                    id = self._currPlotIndex;
                    console.log('??????plotindex???' + id);
                    self._isOpt = false;
                    self._inOpt = true;
                    self._decOp = true;

                };
            } else if ((info.type == 4)) {
                //????????????dialog???opArray??????????????????????????????plot???att
                if (self._prevF == self._plotF) { //att?????????plot
                    console.log('0101 op????????????????????????????????????plotF');
                    content = self._plotF;
                    id = self._prevID;
                    self._isOpt = false;
                    self._isAttack = false;

                } else if (self._prevF == self._attF) {
                    console.log('0102 op????????????????????????????????????attF');
                    //console.log('prevID?????? ' + self._prevID);
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
                //quit ?????????????????????????????????plotf
                content = self._plotF;
                id = self._currPlotIndex;
                self._isOpt = false;
                self._isAttack = false;
                console.log('quit,????????????opt???att??????plotF');

                self.updateAttData(self, false, self._saveData)

            } else if (info.type == 6) {
                //??????????????????????????????????????????????????????
                if (callback) {
                    callback(self, info, self._switchClick);
                };
                return;
            };

            //console.log('?????????id??????' + id);

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
                self._nameLabel.string = self._nameStr; //????????????



                if (!self._isConv) {
                    self.showSprite(self, self._picStr, info, self.showAnim); //????????????
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

                        console.log('conv???????????????showsprite call???pic1??? ' + firstPic + 'pic2: ' + secondPic);
                    } else {
                        self.showSprite(self, self._picStr, info, self.showAnim); //????????????

                    };
                };
                //?????????????????????test????????????
                //self.updateAutoSave(self, self._saveData);

                //?????????????????????


                //energy?????????????????????
                if (info.eVal) { self.node.emit('energyChange', info.eVal) };

                //??????????????????
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
                        self.typeWriter(self._dialogStr, self._tipsNode, self._tipsLabel, 50);
                    } else if (info.mode) {
                        if (info.mode == 1) {
                            self._whiteNode.active = true;
                            self._whiteLabel.string = self._dialogStr;
                        };
                    } else if (self._postAttSuccess) {
                        self._textNode.active = false;
                    } else {
                        self._textNode.active = true;
                        self.typeWriter(self._dialogStr, self._textNode, self._dialogLabel, 50);
                    }
                };


            } else {

            };

            if (info.switchap) {
                self._scNode.active = false;
            };
            if (info.anim) {
                self.scheduleOnce(function() {
                    self._animNode.active = false;
                }, 1.5);
            };




            if (callback) {
                // ????????? switchClick
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
                    //console.log('rescale??????????????????' + res);
                    if (sp.spriteFrame) { console.log('???node?????????????????????'); };
                };

                if (cc.isValid(res)) {
                    var size = res.getOriginalSize();
                    var char = pic.substring(0, 1);
                    var part = pic.substring(1, 2); //???????????????????????????????????????????????????0??????1??????2???
                    var hList = [0, 0.85, 1, 0.9, 1, 1, 1, 1, 1, 0.9]; //???????????????????????????????????????????????????

                    //console.log("original size :" + size + ' ?????? = ' + char + '  ?????? = ' + part + '?????? = ' + pos);

                    if (part == 1) {
                        var ratio = size.width / size.height;
                        var h = 350;
                        var w = 350 * ratio;

                        if (char == 4) {
                            h = 550;
                            w = 550 * ratio;
                        };

                        // ??????????????????????????????????????????20%?????????????????????????????????
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

                        wg.isAlignTop = false;
                        wg.isAlignBottom = true;
                        wg.bottom = -0.05;
                        cn.width = w;
                        cn.height = h;
                    } else if (part == 0) {


                        var ratio = size.width / size.height;
                        var h = self.canvasNode.height * 0.9 * hList[char];
                        var w = h * ratio;

                        wg.isAlignTop = false;
                        wg.isAlignBottom = true;
                        wg.bottom = -0.05;
                        cn.width = w;
                        cn.height = h;
                    };

                    if (callback) {
                        //callback????????????show
                        callback(res, convAnim);
                    };
                } else { //console.log('????????????load res??????????????????') 
                };
            };

            var show = function(res, callback) {
                // ???rescale???call???????????????callback???convAnim
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
                        console.log('vpMask?????? ' + vpMask.name);
                        vpMask.spriteFrame = res;
                        vpWD.enabled = false;
                        thisChar.zIndex = 1;
                        otherChar.zIndex = 0;
                        if (otherChar.getComponent(cc.Sprite).spriteFrame) {
                            otherWD.enabled = true;
                        };
                    } else { console.log('?????????vpmask???cn??????' + cn.name); };
                };

                if (self._isConv) {
                    if (callback) {
                        // callback???convAnim
                        callback(thisChar, otherChar, thisVec, otherVec, otherOrigin);
                        console.log('call convAnim');
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
                console.log('info.poswicth = ' + info.poSwitch);
                if (info.poSwitch) {
                    if ((!info.conv)) {
                        console.log('??????????????????Char???????????????' + otherO);
                        // ??????conv???????????????????????????pos????????????????????????
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

                    console.log('????????????Char???????????????');
                };

            };



            var url = 'Pic/' + pic;
            cc.resources.load(url, cc.SpriteFrame, (err, res) => rescale(err, res, show));


            if ((info.anim) && (!self._isConv)) {
                // conv?????????anim?????????????????????
                if (callback) {
                    // callback(self, info.anim, self._switchClick);

                    callback(self, info.anim);
                }
            };

        },


        showAnim(self, anim, callback) {
            if (self._isStop) { return };
            self._animNode.active = true;
            var anSP = self._animNode.getComponent(cc.Sprite);
            var animPlayer = self._animNode.getComponent(cc.Animation);
            var url = 'Pic/' + anim;

            cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                anSP.spriteFrame = ret;
                animPlayer.play(anim);
            });

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
                    //?????????????????????????????????????????? ?????? dialogEnd???index+??????????????????
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
            self._reviewList.push(dial);

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
                if (errorMessage) { cc.log('??????Prefab??????, ??????:' + errorMessage); return; }
                if (!(loadedResource instanceof cc.Prefab)) { cc.log('??????????????????Prefab, ???????????????????'); return; } //????????????????????????

                var root = cc.instantiate(loadedResource);
                var revScroll = root.getComponent(cc.ScrollView);

                this.canvasNode.addChild(root, 1, "Review");
                this._reviewLabel = root.getChildByName("view").getComponentInChildren(cc.Label);
                this._reviewLabel.string = this._revStr;

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
                // ??????????????????????????????????????????????????????????????????
                .call(() => {
                    root.destroy();
                    this._reviewLabel = null;
                    this._revOn = false;
                })
                .start(root)
        },

        _clearReview() {

            if (cc.isValid(this._reviewLabel)) {
                this._reviewLabel.string = "";
                console.log("clearReview called");
            };
        },


        _initBG(self, callback) {
            //???????????? .testBG????????????????????? .bg
            this._lastBG = this._autoSaved.bg;
            if (!this._lastBG) {
                var id;
                for (id = this._currPlotIndex; id >= 1; id--) {
                    if ((this._plotF[id].Character.indexOf('??????') != -1) || (this._plotF[id].Character.indexOf('??????') != -1)) {
                        this._lastBG = this._plotF[id].Dialog;
                        break;
                    };
                };
            };
            //console.log('lastBG????????????' + this._lastBG);
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
                console.log('??????????????????????????????' + url);
                cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                    if (err) {
                        console.log('??????????????????????????????');
                    };
                    console.log("?????????????????? " + ret.name);

                    // ????????????????????????bgSF?????????????????????
                    bgSP.spriteFrame = ret;
                });
            };
        },

        endGame(self, type, callback) {
            //  AutoSave?????????(?)
            //  ??????????????????
            //  ????????????DialogEnd
            //  GlobalData??????GameState??????

            // AutoSave??????
            // self.updateAutoSave(self, self._saveData);

            // ??????????????????
            self.canvasNode.pauseSystemEvents(true);
            self._textNode.active = false;
            self._aChar.active = false;
            self._bChar.active = false;
            self._cChar.active = false;

            // self._globalData.GameState.justEnded = true;
            // self._saveData(self._globalData, 2);

            if (type == 1) {
                // True End
                PlotData.endAlert = '????????????????????????????????????????????????????????????????????????????????????????????????';
            } else if (type == 2) {
                // False End???GameState??????

            } else if (type == 3) {
                // Energy End???GameState??????

            } else if (type == 4) {
                // TBC End
                PlotData.endAlert = '?????????????????????' + EndChapter + '??????????????????????????????????????????';
            } else if (type == 5) {
                PlotData.endAlert = '?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????';
            };

            let GENode = cc.find('Canvas/Game_End');
            let Step1 = GENode.getChildByName('Step1');
            let Step2 = GENode.getChildByName('Step2');
            GENode.active = true;
            GENode.zIndex = 99;
            Step1.active = true;
            Step2.active = false;

            GENode.on(cc.Node.EventType.TOUCH_END, function() {
                console.log('??????GENode??????');
                self.toMain(self);
            }, self);
            if (callback) { callback(self) };
        },

        _afterEndGame(self) {
            // ??????Launch??????
            self.canvasNode.on(cc.Node.EventType.TOUCH_END, function() { self.toMain(self) }, self);

            // ??????Launch????????????
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
            //???test???????????????
            self._currChap = self._autoSaved.chapter;
            self._currAtt = self._autoSaved.attChapter;

            //????????????\att??????
            self._isAttack = self._autoSaved.pState;

            let f1 = 'Chapter' + self._autoSaved.chapter;
            let f2 = 'Attack' + self._autoSaved.attChapter;
            let f3 = self._autoSaved.prevChapter;
            console.log('f3: ' + f3);

            //??????????????????????????????
            self._prevID = self._autoSaved.prevIndex;

            if (f3) {
                if (f3.indexOf('Chapter') != -1) {
                    //????????????prevChapter???????????????
                    self._plotF = require(f3);
                    self._prevF = self._plotF;
                    self._attF = require(f2);
                    //console.log('f3?????????');
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
                console.log('?????????????????????????????????');
            } else {
                self.scheduleOnce(function() { self.node.emit('dialogEnd'); }, 0.15)
            };

            self._scNode.active = false;
            self._animNode.active = false;
            self._animNode.zIndex = 0;

            self._initBG(self, self._loadBG);
        },


        // updateAutoSave(self, callback) {
        //     console.log('UpdateAutoSave ----------');
        //     if (self._isAttack) {
        //         self._autoSaved.index = self._currAttIndex;
        //     } else {
        //         self._autoSaved.index = self._currPlotIndex;
        //     };
        //     self._autoSaved.pState = self._isAttack;
        //     self._autoSaved.chapter = self._currChap;
        //     self._autoSaved.attChapter = self._currAtt;
        //     self._autoSaved.prevChapter = 'Chapter' + self._currChap;
        //     self._autoSaved.prevIndex = self._prevID;


        //     if (callback)
        //     // _saveData, auto??????
        //         callback(self._autoSaved, 1);
        // },

    });