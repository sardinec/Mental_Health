import { VM } from '../modelView/ViewModel';
import { LoadGameData, SaveGameData } from './GameData';
import { PurchaseChap } from '../PlotManager';

//name, price, price_original, icon, desc
export let ShopConfig = {
    0: {
        name: '畅读大礼包',
        price: 180,
        price_original: 640,
        icon: 'Pic/畅读礼包',
        desc: '全角色彩蛋解锁+攻略卡6张+额外存档位7个。限时%折！',
        suffix: '个礼包', // 商城界面中描述：当前有2 ‘张攻略卡’
        sale: 1,
        multiBuy: false,
    },
    1: {
        name: '攻略卡礼包',
        price: 190,
        price_original: 300,
        icon: 'Pic/攻略卡包',
        desc: '含攻略卡*6。在攻略失败时使用，助你成功攻略所有角色。',
        suffix: '个礼包',
        sale: 1,
        multiBuy: false,
    },
    2: { name: '全存档位解锁', price: 210, price_original: 350, icon: 'Pic/存档位包', desc: '解锁全部7个存档位', suffix: '个存档位', sale: 1, multiBuy: false, },
    3: { name: '全彩蛋解锁', price: 350, price_original: 600, icon: 'Pic/彩蛋礼包', desc: '解锁全部隐藏剧情，发现每个人的小秘密。', suffix: '张彩蛋券', sale: 1, multiBuy: false, },
    4: { name: '攻略卡*1', price: 50, price_original: null, icon: 'Pic/攻略卡', desc: '', suffix: '张攻略卡', sale: 0, multiBuy: true, },
    5: { name: '存档位*1', price: 50, price_original: null, icon: 'Pic/存档位调整后', desc: '', suffix: '个存档位', sale: 0, multiBuy: true, },
    6: {
        name: '彩蛋*1',
        price: 25,
        price_original: null,
        icon: '',
        desc: 'AAA',
        suffix: '张彩蛋券',
        sale: 0,
        multiBuy: true,
    },
    7: {
        name: '全章节解锁',
        price: 25,
        price_original: null,
        icon: '',
        desc: '解锁全部正文章节（不包括彩蛋部分）',
        suffix: '全章节解锁',
        sale: 0,
        multiBuy: false,
    },
    8: { //这个顺序关联很多东西，不要再改了。界面可以在编辑器改顺序
        name: '新章节*1',
        price: 25,
        price_original: null,
        icon: '',
        desc: '解锁1个正文章节',
        suffix: '章',
        sale: 0,
        multiBuy: false,
    },

};

VM.add(ShopConfig, 'shop');


export function constShopList() {
    // 在商城界面中使用，用于点击购买时弹出框显示
    let list = [];
    let item = {};
    let sc = ShopConfig;
    let gd = LoadGameData('GlobalData');

    for (let i = 0; i < 9; i++) {
        sc[i].serial = i;
        sc[i].quant = 1;
        sc[i].owned = gd.shop[i]; //owned属性：0-4有效，5-8废?
        list.push(sc[i]);
    };

    //    list.push(sc[0], sc[1], sc[2], sc[3], sc[4], sc[5], sc[6], sc[7], sc[8]);

    return list;
};

export function constEggInfo() {
    var d = { eggUnlocked: 0, chanceHeld: 0 };
    var gd = LoadGameData('GlobalData');

    for (let i = 0; i < 8; i++) {
        if (gd.eggs[i])
            d.chanceHeld += gd.eggs[i].chance;

        for (let j = 1; j < 3; j++) {
            if ((gd.eggs[i][j] == 1) || (gd.eggs[i][j] == 2)) {
                d.eggUnlocked++;
                console.log('eggUnlocked++ ' + d.eggUnlocked);
            }
        };
    };

    return d;
};

export function constLockedChapter() {};


export function PurchaseItem(serial, quant) {
    var result = 'FAIL';
    var gd = LoadGameData('GlobalData');
    var shopd = [];

    let sum = ShopConfig[serial].price * quant;

    if (gd.diamond < sum) {
        console.log('购买失败，钻石不足');
    } else {
        console.log('购买成功.(逻辑待写)');
        gd.diamond -= sum; //钻石减少
        result = 'SUCCESS';
        if (serial == 0) {
            //豪华礼包，全角色彩蛋解锁+攻略卡6张+额外存档位7个


        } else if (serial == 1) {
            //含攻略卡*6。在攻略失败时使用

        } else if (serial == 2) {
            //解锁全部7个存档位

        } else if (serial == 3) {
            // 解锁全部隐藏剧情，发现每个人的小秘密。

        } else if (serial == 4) {
            // 攻略卡1

        } else if (serial == 5) {
            // 存档1

            //判定是否已经全部解锁，是 则cancel

        } else if (serial == 6) {
            // 彩蛋1

        };
    };

    SaveGameData(gd, 2);

    const _shop = [
        0, //豪华大礼包0
        0, //攻略卡礼包1
        2, //存储位2
        0, // 用于解锁彩蛋的机会（购买/游戏获得）3
        1, //攻略卡4
        null, //5废，存档位，从2读取
        null, //6废，彩蛋券，从3读取
        0, // 已经解锁的彩蛋数量7
    ];


    return result;

};