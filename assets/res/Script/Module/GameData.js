export const EndChapter = 3;

//如果想要直接看某章节，就在这里改。
//方法见下面的注释，一共5条数据需要改
<<<<<<< HEAD
let aDocName = 'auto_temp_09md '; //修改这个字段的名称，比如在b01后加上别的数字
let gDocName = 'gData_test2wvcse'; //修改字段，同上
let mDocName = 'mDoc_Testingv5w_f'; //修改字段，同上
let UID_temp = '0101';

const tempCh = 1; //这个是你要看的章节号，目前整理好了1-8
=======
let aDocName = 'auto_temp_Yp）q3047'; //修改这个字段的名称，比如在b01后加上别的数字
let gDocName = 'gData_test_*&6p22ys'; //修改字段，同上
let mDocName = 'mDoc_Testing_F2oWDg_'; //修改字段，同上
let UID_temp = '0101';

const tempCh = 11; //这个是你要看的章节号，目前整理好了1-8
>>>>>>> parent of 416f9ad... 0.0.6打包-未去多余脚本
const tempID = 1; //这个是你要看的章节的对话条数
const tempSt = 0;
const tempACh = 1;
const tempPCh = null;
const tempPID = 1;
const tempEne = 6;

//正式
const slDocNames = [
    'auto_0_021133',
    'bb_0_021133',
    'cc_0_021133',
    'dd_0_021133',
    'ee_0_021133',
    'ff_0_021133',
    'gg_0_021133',
    'hh_0_021133'
];


export class AutoSave {
    constructor(chap, att, state, id, pc, pi, cv, en, bg, doc) {
        this.chapter = chap;
        this.attChapter = att;
        this.pState = state; //0：普通章节，1：攻略章节
        this.index = id;
        this.prevChapter = pc; //例如 ’Chapter1‘
        this.prevIndex = pi;
        this.conv = cv;
        this.energy = en;
        this.bg = bg; //上一个背景图
        this.docName = doc;
    };

    init(name) {
        var d = JSON.parse(cc.sys.localStorage.getItem(name));
        console.log('执行AutoSave.init ');
        if (d) {
            d.docName = name;
            console.log('存档存在，返回d：' + d.chapter + '  ' + d.index + ' ' + d.docName);
            return d;
        } else {
            console.log('存档不存在，重新初始化存档：第?章第?条 ');
            // // 正式的return
            // return new AutoSave(1, 1, 0, 1, 'Chapter1', 1, 6, null, name);

            //temp，测试用
            return new AutoSave(tempCh, tempACh, tempSt, tempID, tempPCh, tempPID, null, tempEne, null, name);

        };
    };

};

export class GlobalData {

    constructor(shop, known, attd, eggs, gs, dia, cu, doc, ) {
        this.UserID = null;
        this.musicVol = 0.5;
        this.fxVol = 0.5;
        this.shop = shop;
        this.known = known;
        this.attacked = attd;
        this.eggs = eggs;

        this.GameState = gs;

        this.diamond = dia;
        this.chapterUnlocked = cu;

        this.docName = doc;
    };

    init(name) {
        const _shop = [
            0, //豪华大礼包0
            0, //攻略卡礼包1
            2, //存储位2
            0, // 用于解锁彩蛋的机会（购买/游戏获得）3
            1, //攻略卡4
            null, //5废，存档位，从2读取
            null, //6废，彩蛋券，从3读取
            0, // 已经解锁的彩蛋数量7
            0, // 拥有全章节解锁8
        ];

        //重要，后面需要扩写
        const _known = [ //已经出场过的角色, 序号见CharacterConfig
            0, //初始：李无奇，金老板
        ];

        //已经攻略过的对象,0未攻略，1成功，2失败
        //与人物的对应顺序，在CharacterConfig
        const _attacked = [0, 0, 0, 0, 0, 0, 0, 0, 0, ];

        //彩蛋拥有情况 0未获得 1获得 2已读 NULL不可攻略;
        //chance：在gallery界面显示的，剩余可选彩蛋次数
        const _eggs = [
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0],
            [{ chance: 0 }, 0, 0, 0], null, null, null, null
        ];

        const _GAMESTATE = {
            newUser: true, //用户第一次登录时为new，初始化后即变为false（未写）
            justEnded: false, //用户刚刚打完了一轮，即将要重新开始的状态。重新开始后即为false（未写）
            endOnce: false,
            trueEnd: false,
            falseEnd: false,
        };

        const _diamond = 5000;

        const _chapterUnlocked = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        console.log('执行GlobalData.init.  docName : ' + name);
        let d = JSON.parse(cc.sys.localStorage.getItem(name));
        if (d) { console.log('GlobalData取用已存档的数据'); return d } else { return new GlobalData(_shop, _known, _attacked, _eggs, _GAMESTATE, _diamond, _chapterUnlocked, name) };
    };

};

export class slPannel {
    constructor(st, as) {
        this.slotState = st;
        this.asData = as; // Autosave实例，包含章节等信息
    };


    initAll(buySlot) { //buySlot:1 买1个  2 买全部
        /* @param allP 对应所有的存档位的名称，第一个为自动存档除外*/
        var docList = [];
        console.log('this' + this.name);

        var gd = LoadGameData('GlobalData');
        var shopSlot = gd.shop[2];

        var as = LoadGameData('AutoSave');

        // 输出有8个元素（0-7）的数组
        // 正式用逻辑，SlotsPannel需要保持一致
        for (let n = 0; n < slDocNames.length; n++) {
            let d = JSON.parse(cc.sys.localStorage.getItem(slDocNames[n]));
            if (d) {
                // 该位置已经有存档，那么st一定是2
                d.slotState = 2;
                docList.push(d)
            } else {
                // 该位置没有存档
                var newd;
                var st;
                var asd;

                // 
                if ((shopSlot - n) >= 1) { st = 1 } else { st = 0 };

                //
                if (n == 0) {
                    st = 2;
                    asd = as;
                };

                newd = new slPannel(st, asd);

                docList.push(newd);

                console.log('ini，第 ' + n + ' 个存储槽状态： ' + st);
            };

        };

        return docList;
    };

    unlockSlot(mode) { //1 单个解锁 2 全部解锁


    };


    initOne(name) {
        let d = JSON.parse(cc.sys.localStorage.getItem(name));
        if (d) { return d } else {
            var st;
            if (name == 'bb') { st = 1 } else { st = 0 };
            return new slPannel(st, 0, 0, 0, null)
        }
    };

};

export class MetaData {
    constructor(uid, mdn, mdh, adn, adh, gdn, gdh) {
        this.UID = uid;
        this.metaDocName = mdn;
        this.metaDocHistory = mdh;
        this.autoDocName = adn;
        this.autoDocHistory = adh;
        this.globalDocName = gdn;
        this.globalDocHistory = gdh;
    };

    init() {
        let d = JSON.parse(cc.sys.localStorage.getItem(mDocName));
        if (d) { console.log('MetaData取用已存档的数据'); return d } else {
            console.log('重新创建Metadata');
            return new MetaData(UID_temp, mDocName, [], aDocName, [], gDocName, []);
        };
    };
};

export function LoadMeta() {
    let md = new MetaData();
    md = md.init();
    return md;
};

export function SaveMeta(data) {

    if (data) {
        console.log('-------Saving Meta-----');
        console.log('metadata.autoDocName: ' + data.autoDocName);
        cc.sys.localStorage.setItem(mDocName, JSON.stringify(data));
    } else {
        console.log('存储MeTADATA失败, 请传入非null值');
    }
};


export function LoadGameData(tp, ini) {
    var md = LoadMeta();

    if (tp == 'AutoSave') {
        console.log('LoadData:类型为Autosave');
        let as = new AutoSave();
        as = as.init(md.autoDocName);
        return as;
    } else if (tp == 'GlobalData') {
        let gd = new GlobalData();
        gd = gd.init(md.globalDocName);
        return gd;
    } else if (tp == 'slPannel') {
        let sl = new slPannel();
        if (ini == 1) {
            sl = sl.initAll();
            return sl;
        } else if (ini == 0) {
            sl = sl.initOne();
            return sl;
        } else if (!ini) {
            console.log('请输入正确的ini模式，否则无法load slPannel');
        };
    } else { console.log('LoadGameData类型错误，请输入正确的Load类型'); }

};



// 参数d：存档object本身
export function SaveGameData(d, type) {

    if (type == 1) {
        console.log('存储Autosave，已成功');
        cc.sys.localStorage.setItem(aDocName, JSON.stringify(d));
    } else if (type == 2) {
        cc.sys.localStorage.setItem(gDocName, JSON.stringify(d));
    } else {
        console.log('传入参数类型错误，请传入AutoSave或GlobalData类型');
    };
};

export function ReadSLData(int) {
    console.log('-------Reading SL---------');
    var data;
    // int参数为slot编号，1-8 对应于slDocNames array的0-7

    if (int == null) { console.log('请传入正确的编号'); } else {
        console.log(int);
        let name = slDocNames[int - 1];
        data = JSON.parse(cc.sys.localStorage.getItem(name));
    };

    return data;
};

export function SaveSLData(int, state, asd) {

    console.log('-------Saving SL---------');
    console.log('三个参数： ' + int + '  ' + state + '  ' + asd);
    // int: slot编号，下面会转换为相应的存储名称
    // state: 该slot的状态，0未获得 1为存储 2 有存储
    // asd: 存储的autosave信息 object
    if ((int != null) && (state != null) && (asd != null)) {
        // 传入int为1-8，寻找对应名称时要-1
        let name = slDocNames[int - 1];
        var d = {};
        d.slotState = state;
        d.asData = asd;

        cc.sys.localStorage.setItem(name, JSON.stringify(d));

    } else { console.log('无法存储SL，需要3个参数：serial，state，asd'); }
};


export function RequireChapter(serial, type, loading) {
    //type 1:chapter, 2:attack, 3:egg
    //loading: 是否是在Onload/start阶段调用，如果是，则有fallback

    var gd = LoadGameData('GlobalData');
    var file;
    var result; //null：fail， SUCCESS:成功， END, CHAPTERLOCK
    var fallbackChap;

    //let test = require('Chapter3');

    if (type == 1) { //需要一个新的Chapter
        console.log('进入RequireChapter');
        // console.log('type ==1');
        console.log('EndChapter： ' + EndChapter);
        console.log('serial: ' + serial);
        if (serial <= EndChapter) { // 一般情况，判断章节解锁没有
            console.log('章节在ENDCHAPTER范围以内');
            var chaps = gd.chapterUnlocked;
            for (let i = 0; i < chaps.length; i++) {
                //console.log('i = ' + i);
                if (chaps[i] == serial) { //从已解锁列表找到了该章节
                    let n = 'Chapter' + serial;
                    file = require(n);
                    result = 'SUCCESS';
                    console.log('成功require ' + n);
                    console.log('require test =' + file[1].Dialog);
                    break;
                } else if (i == chaps.length - 1) { //没找到章节且为最后一条
                    result = 'CHAPTERLOCK';
                    if (loading) {
                        console.log('开启Fallback程序，检查前一章节是否锁定，直到require到未锁章节。');
                        var br;
                        for (let j = serial; j > 0; j--) {
                            if (br) { break } else {
                                for (let i = 0; i < chaps.length; i++) {
                                    console.log('章节：' + j + '  列表序号：' + i);
                                    if (chaps[i] == j) {
                                        let n = "Chapter" + j;
                                        fallbackChap = j;
                                        file = require(n);
                                        console.log(n + ' 未锁定');
                                        console.log('file:' + file.name);
                                        br = true;
                                        break;
                                    };
                                }
                            }
                        }
                    }
                };

            }
        } else if (serial > EndChapter) { // 最后一章已经播完了，返回END
            if (loading) {
                console.log('require，loading');
                let n = 'Chapter' + EndChapter;
                file = require(n);
                console.log('已到结尾');
                result = 'END';
            } else {
                let n = 'Chapter' + EndChapter;
                file = require(n);
                console.log('已到结尾');
                result = 'END';
            }

        };

    } else if (type == 2) { // require 一个AttFile，只会在剧情中require
        let n = 'Attack' + serial;
        file = require(n);
        result = 'SUCCESS';
    } else if (type == 3) { // require 一个彩蛋，需判定,判定待写
        let n = 'Bonus' + serial;
        file = require(n);
        result = 'SUCCESS';
    } else { console.log('RequireChapter，请传入正确的类型（1-3）'); }


    return [result, file, fallbackChap];

};