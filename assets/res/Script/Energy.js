/* 挂载于Canvas，管理电量相关功能：
 * 1. 电量随着剧情而改变（Event？）
 * 2. 电量sprite的显示状态，随之改变
 * 3. 电量降低时，全屏光效提示
 * 4. 电量非常低时，光效+Tips提示
 */
import { LoadGameData } from './Module/GameData';
import rolling_lottery from './OuterSource/rolling_lottery';

const { ccclass, property } = cc._decorator;
@ccclass
export class Energy extends cc.Component {
    _eNode = null;
    _autoSaved = null;
    _eVal = null;
    _hunLabel = null;
    _hunNode = null;
    _tenLabel = null;
    _animNode = null;
    _soundUp = null;
    _soundDown = null;
    _rolling_lottery_os = [];

    onLoad() {
        this._eNode = cc.find('Canvas/Top Column/Energy Widget/Nums');
        this._hunNode = this._eNode.getChildByName('numA');
        this._eNode.children.forEach((v1_o, k1_n) => {
            this._rolling_lottery_os.push(v1_o.getComponent(rolling_lottery));
            this._rolling_lottery_os[k1_n].reset();
        });
        this._autoSaved = LoadGameData('AutoSave');
        this._eVal = this._autoSaved.energy;
        cc.log("energyval : " + this._eVal);

        this._hunNode.active = true;
        this._animNode = cc.find('Canvas/BG/Anim');
        this._soundUp = cc.find('Canvas/AudioManager/Effects/Val_Up').getComponent(cc.AudioSource);
        this._soundDown = cc.find('Canvas/AudioManager/Effects/Val_Down').getComponent(cc.AudioSource);
        this.node.on('energyChange', this.onEnergyChange, this);
    };

    start() {
        this.startShow(this._eVal);

    };

    startShow(val) {
        var ten = val % 10;
        var hun = Number.parseInt(val / 10);
        this._rolling_lottery_os[1].scroll(ten);
        this._rolling_lottery_os[0].scroll(hun);
        this._rolling_lottery_os[0].scroll(0);
        //this._soundUp.play();
    };

    // 基本的
    onEnergyChange(val) {
        console.log("received energychange event");

        var sound;
        if (val > 0) { sound = this._soundUp } else { sound = this._soundDown };

        if (this._eVal >= 1) {
            let lastTen = this._eVal % 10;
            let lastHun = Number.parseInt(this._eVal / 10);

            let currVal = this._eVal + val;
            let currTen = currVal % 10;
            let currHun = Number.parseInt(currVal / 10);

            if (lastTen != currTen) {
                sound.play();
                var scrollTen = this._rolling_lottery_os[1].scroll(currTen);
                if (scrollTen == 'success') {
                    this.scheduleOnce(function() {
                        sound.stop();
                    }, 0.5);
                };

                if (scrollTen == 'busy') {
                    console.log('scroll busy======');
                    let func =
                        setInterval(() => {
                            scrollTen =
                                this._rolling_lottery_os[1].scroll(currTen);
                            if (scrollTen == 'success') {
                                sound.stop();
                                clearInterval(func);
                            };
                        }, 0.8);

                };
            };
            if (lastHun != currHun) {
                console.log('scroll busy======');
                var scrollHun = this._rolling_lottery_os[0].scroll(currHun);
                if (scrollHun == 'busy') {
                    let func =
                        setInterval(() => {
                            scrollHun =
                                this._rolling_lottery_os[0].scroll(currHun);
                            if (scrollHun == 'success') {
                                clearInterval(func)
                            };
                        }, 0.8);
                }
            };
            this._eVal += val;
        };

        if (val < 0) {

            this._animNode.active = true;
            var anSP = this._animNode.getComponent(cc.Sprite);
            let animPlayer = this._animNode.getComponent(cc.Animation);
            let url = 'Pic/red';

            cc.resources.load(url, cc.SpriteFrame, function(err, ret) {
                anSP.spriteFrame = ret;
                animPlayer.play('red');
            });

            this.scheduleOnce(function() {
                this._animNode.active = false;
                anSP.spriteFrame = null;
            }, 1.5);
        }

        this.node.emit('energyVal', this._eVal); //在PlotManager中接收事件

        if (this._eVal == 0) {
            this.node.emit('energyEnd');
        }
    };

    onTestClick() {
        let func =
            setInterval(() => {
                var scrollHun =
                    this._rolling_lottery_os[0].jump(9);
                if (scrollHun == 'success') {
                    console.log('clearinterval');
                    clearInterval(func)
                };
            }, 0.5);

    }
};