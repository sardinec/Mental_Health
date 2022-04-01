// 游戏存档分为3种：
// global data：商城购买情况，道具持有、消耗情况 (Global)
// game data: 分为chapter，index,energy , attacked (Game)
// auto save: slot固定位1，随游戏进程存档 (autoSave)
// egg data: 彩蛋存档，在游戏进程中存取

// state0 ：不拥有该slot
// state1 ：拥有但未存档
// state2 ：已存档（必须有对应存档信息）
// 在Load时、手动操作存档时，进行状态更新，emit事件

import { LoadGameData, SaveSLData, ReadSLData } from './Module/GameData';
import { Tween_ExitUI } from './Module/TweenUtils';

const { ccclass, property } = cc._decorator;

export let ASData = {};
@ccclass
export class SlotsPannel extends cc.Component {
    @property({ type: cc.Integer, tooltip: '1测试模式 0正式运行模式' })
    testMode = 0;
    @property({ type: cc.Integer, tooltip: '2：该位置有存档, 1：拥有该slot，无存档, 0：不拥有此slot，需要购买' })
    autoState = 2;

    @property({ type: cc.Node, tooltip: '' })
    autoSlot = null;
    @property({ type: cc.Node, tooltip: '' })
    slot2 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot3 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot4 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot5 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot6 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot7 = null;
    @property({ type: cc.Node, tooltip: '' })
    slot8 = null;
    @property({ type: cc.Node, tooltip: '关闭整个pannel时用到' })
    WholePannel = null;


    @property({ type: cc.SpriteFrame, tooltip: '第一状态的sprite' })
    SFrame1 = null;
    @property({ type: cc.SpriteFrame, tooltip: '第二状态的sprite' })
    SFrame2 = null;
    @property({ type: cc.SpriteFrame, tooltip: '第三状态的sprite' })
    SFrame3 = null;

    _maskNode = null;
    _maskSP = null;
    _currSlotNum = null; //数字
    _currSlotNode = null; //Node
    _currPannel = null; //字符串
    _currState = null;
    _canvasNode = null;
    _slotList = [];
    _states = null;
    _slDataList = [];

    onLoad() {
        this._canvasNode = cc.find('Canvas');
        this._slotList.push(this.autoSlot, this.slot2, this.slot3, this.slot4, this.slot5, this.slot6, this.slot7, this.slot8);
        this._maskNode = this.node.parent.getChildByName('Mask');
        this._maskSP = this._maskNode.getComponent(cc.Sprite);
        this._maskNode.active = false;
        this._maskSP.enabled = true;

        let states = {
            // 0 不拥有此存档位 1 未存档 2已存档
            autoState: 2,
            state2: 1,
            state3: 0,
            state4: 0,
            state5: 0,
            state6: 0,
            state7: 0,
            state8: 0,
        };

        this._slDataList = LoadGameData('slPannel', 1); //以initAll模式load，返回 8位List


        states.state2 = this._slDataList[1].slotState; //2 <--> 1，是起点问题，此处没错

        for (let i = 0; i <= 7; i++) {
            if (i == 0) {
                let asd = LoadGameData('AutoSave');
                this.setState(this._slotList[i], this._slDataList[i].slotState, asd);
            } else {
                let asd2 = this._slDataList[i].asData;
                this.setState(this._slotList[i], this._slDataList[i].slotState, asd2);
            }
        };
        console.log('states.autoState = ' + states.autoState);

    };

    start() {

    };

    setState(slot, state, asd) {
        var sf;
        console.log('slot的类型为：' + typeof slot);

        var label = slot.getComponentInChildren(cc.Label);
        var font;

        if (state == 0) {
            sf = this.SFrame1;
            label.string = '存档位未开放';
            font = 'ZhenyanGray';
        } else if (state == 1) {
            sf = this.SFrame2;
            label.string = '暂无存档';
            font = 'ZhenyanGray';
        } else if (state == 2) {
            sf = this.SFrame3;
            var ch;
            if (asd) { ch = asd.chapter } else { ch = '？' };

            if (slot == this.autoSlot) { label.string = '自动存档：\n第' + ch + '章' } else {
                label.string = '存档：第' + ch + '章';
            }
            font = 'ZhenyanRed';
            console.log('setState=2  已完成');
        };

        var slotSP = slot.getComponent(cc.Sprite);
        slotSP.enabled = true;
        slotSP.spriteFrame = sf;
        label.enabled = true;

        cc.resources.load('Font/' + font, function(err, res) {
            var lb = slot.getComponentInChildren(cc.Label);
            lb.font = res;
        });

    };

    showPop(err, n) {
        console.log('customEvent : ' + n);

        var st;
        var mask = this.node.parent.getChildByName('Mask');
        mask.active = true;

        this._currSlotNum = parseInt(n);
        console.log('ShowPoP, CURRSLOT: ' + this._currSlotNum);
        st = this._slDataList[this._currSlotNum - 1].slotState;

        this.node.pauseSystemEvents(true);

        var pannel;
        if (st == 0) {
            console.log('state :  ' + st);
            pannel = 'Prefab/Popup Shop';
        } else if (st == 1) {
            console.log('state :  ' + st);
            pannel = 'Prefab/Popup Choose';
        } else if (st == 2) {
            console.log('state :  ' + st);
            pannel = 'Prefab/Popup Choose';
        } else { console.log('请传入正确的state参数！') }

        this._currState = st;
        cc.resources.load(pannel, this.loadPannel.bind(this));

    };


    num2slot(n, self) {
        console.log('-----------转换开始，n= ' + n);
        if ((n == '1') || (n == 1)) {
            self._currSlotNode = self.autoSlot;
        } else if ((n == '2') || (n == 2)) {
            console.log('------转换中，n=2');
            self._currSlotNode = self.slot2;
        } else if ((n == '3') || (n == 3)) {
            self._currSlotNode = self.slot3;
        } else if ((n == '4') || (n == 4)) {
            self._currSlotNode = self.slot4;
        } else if ((n == '5') || (n == 5)) {
            self._currSlotNode = self.slot5;
        } else if ((n == '6') || (n == 6)) {
            self._currSlotNode = self.slot6;
        } else if ((n == '7') || (n == 7)) {
            self._currSlotNode = self.slot7;
        } else if ((n == '8') || (n == 8)) {
            self._currSlotNode = self.slot8;
        };
        console.log('--------转换结果:' + self._currSlotNode.name + ' ----------');
        return self._currSlotNode;
    };

    loadPannel(err, res) {
        var self = this;
        console.log('self : ' + self);
        var root = cc.instantiate(res);
        var name;
        var buttons = root.getChildByName('Buttons');
        var oneButton = root.getChildByName('One Button');
        var text = root.getChildByName('Text').getComponentInChildren(cc.Label);

        this._currPannel = root;

        if (this._currState == 0) { //不拥有此slot，需要购买
            name = 'Popup_Shop';
        } else if (this._currState == 1) { //拥有slot，无存档
            name = 'Popup_Choose';
            text.string = '是否在此存档位进行存档？';
            buttons.active = false;
            oneButton.active = true;

            var confBtn = oneButton.getChildByName('Conf Button');
            confBtn.on(cc.Node.EventType.TOUCH_END, function() {
                //确定在此位置存档
                cc.resources.load('Prefab/Popup Rewrite', function(err, res) {
                    root.destroy();
                    var pann = cc.instantiate(res);
                    self._canvasNode.addChild(pann, 0, 'Popup_Rewrite');
                    var cancel = pann.getChildByName('Buttons').getChildByName('Cancel Button');
                    var yes = pann.getChildByName('Buttons').getChildByName('Yes Button');
                    var exit = pann.getChildByName('Exit');
                    var mask = self._canvasNode.getChildByName('theSlots').getChildByName('Mask');

                    var onExit = function() {
                        pann.destroy();
                        console.log('mask :' + mask.name)
                        if (mask) {
                            mask.active = false;

                            self.node.resumeSystemEvents(true);
                            //self._currPannel = null;
                        };
                    };

                    exit.on(cc.Node.EventType.TOUCH_END, onExit);
                    cancel.on(cc.Node.EventType.TOUCH_END, onExit);

                    yes.on(cc.Node.EventType.TOUCH_END, function() {
                        self.rewriteSlot(pann, self);
                    });
                });
            });
        } else if (this._currState == 2) { //该存档位已有存档
            console.log('state ==2，弹出popup choose');
            name = 'Popup_Choose';
            text.string = '请选择您需要的操作：';
            buttons.active = true;
            oneButton.active = false;

            var write = buttons.getChildByName('Write');
            var read = buttons.getChildByName('Read');

            read.on(cc.Node.EventType.TOUCH_END, function() {
                //读取该位置存档
                console.log('currslotnum: ' + self._currSlotNum);
                let slotData = ReadSLData(self._currSlotNum);
                if (slotData) {
                    ASData = slotData.asData;

                    console.log('------------ASData--------------');
                    console.log('chapter ' + ASData.chapter);
                    console.log('attChapter ' + ASData.attChapter);
                    console.log('index ' + ASData.index);
                    console.log('.pState ' + ASData.pState);
                    console.log('prevChap / ID ' + ASData.prevChapter + '  ' + ASData.prevIndex);
                    console.log('----------ASData End------------');
                } else {
                    console.log('ASData未能正确加载');
                };
                self._canvasNode.resumeSystemEvents(true);

                //重新开始游戏，退出该Pannel
                self.scheduleOnce(function() {
                    root.destroy(); // 关闭本pannel（choose Pannel）
                    self.exitWholePann();
                    self._canvasNode.emit('resetGame');
                }, 0.2);

            });


            write.on(cc.Node.EventType.TOUCH_END, function() {
                //覆盖此位置存档
                self._currState = 0;
                cc.resources.load('Prefab/Popup Rewrite', function(err, res) {

                    root.opacity = 0;
                    self.scheduleOnce(() => { root.destroy(); }, 0.15)

                    var pann = cc.instantiate(res);
                    self._canvasNode.addChild(pann, 0, 'Popup_Rewrite');
                    var cancel = pann.getChildByName('Buttons').getChildByName('Cancel Button');
                    var yes = pann.getChildByName('Buttons').getChildByName('Yes Button');
                    var mask = self._canvasNode.getChildByName('theSlots').getChildByName('Mask');
                    //var exit = pann.getChildByName('Exit');

                    var onExit = function() {

                        cc.tween(pann)
                            .to(0.15, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
                            // 当前面的动作都执行完毕后才会调用这个回调函数
                            .call(() => {
                                console.log('销毁前等待0.2');
                                self.node.resumeSystemEvents(true);
                                self.scheduleOnce(() => { pann.destroy(); }, 0.2)
                            })
                            .start(pann)

                        if (mask) {
                            mask.active = false;
                            // self._currPannel = null;
                        };
                    };

                    //exit.on(cc.Node.EventType.TOUCH_END, onExit);
                    cancel.on(cc.Node.EventType.TOUCH_END, onExit);

                    yes.on(cc.Node.EventType.TOUCH_END, function() {
                        //确定覆盖此位置存档
                        // this._currSlotNum
                        self.rewriteSlot(pann, self);
                        onExit();
                    });
                });
            });
        } else if (this._currState == 0) {

        };

        this._canvasNode.addChild(root, 0, name);
        // var Exit = root.getChildByName("Exit");
        // Exit.on(cc.Node.EventType.TOUCH_END, this.exitPannel.bind(this));
    };

    rewriteSlot(pann, self) {
        // 确定覆盖此位置存档
        self._currState = 2;

        let as = LoadGameData('AutoSave');
        // 存档该slot状态的变化
        SaveSLData(self._currSlotNum, self._currState, as);

        // 更新本脚本中的动态信息，与存档一致
        self._slDataList[self._currSlotNum - 1].slotState = self._currState;

        let slo = self.num2slot(self._currSlotNum, self);
        self.setState(slo, self._currState, as);

    };

    exitWholePann() {
        console.log('执行 exit WholePann');

        // let cb = function(self) {
        //     if (self._currPannel) {
        //         self._currPannel.destroy();
        //     }

        //     self._canvasNode.resumeSystemEvents(true);
        //     self.WholePannel.destroy();

        // };

        // Tween_ExitUI(this, this.WholePannel, cb);

        cc.tween(this.WholePannel)
            .to(0.2, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                if (this._currPannel) {
                    this._currPannel.destroy();
                }

                this._canvasNode.resumeSystemEvents(false);
                this.WholePannel.destroy();
            })
            .start(this.WholePannel)


    };

    exitPannel() {
        console.log('执行exitPannel');
        var root = this._currPannel;
        var mask = this.node.parent.getChildByName('Mask');

        cc.tween(root)
            .hide(1, { easing: "easeOut" })
            // 当前面的动作都执行完毕后才会调用这个回调函数
            .call(() => {
                root.active = false;
                this.node.resumeSystemEvents(true);
                mask.active = false;
                let asd = LoadGameData('AutoSave');
                this.num2slot(this._currSlotNum, this);
                this.setState(this._currSlotNode, this._currState, asd);

                this._currPannel = null;
                this._currSlotNode = null;
            })
            .start(root)
            //console.log('closed');

    };


};