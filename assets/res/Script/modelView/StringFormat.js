"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringFormatFunction = void 0;
/**
 * 数值格式化函数, 通过语义解析自动设置值的范围
 *     //整数
 * 1:def(0)//显示一个默认值
 */
var StringFormat = /** @class */ (function () {
    function StringFormat() {
    }
    StringFormat.prototype.deal = function (value, format) {
        if (format === '')
            return value;
        format = format.toLowerCase().trim(); //不区分大小
        var match_func = format.match(/^[a-z|A-Z]+/gi); //匹配到 format 中的 函数名
        var match_num = format.match(/\d+$/gi); //匹配到 format 中的参数
        var func = '';
        var num;
        var res = '';
        if (match_func)
            func = match_func[0];
        if (match_num)
            num = parseInt(match_num[0]);
        if (typeof value == 'number') {
            switch (func) {
                case 'int':
                    res = this.int(value);
                    break;
                case 'fix':
                    res = this.fix(value, num);
                    break;
                case 'kmbt':
                    res = this.KMBT(value);
                    break;
                case 'per':
                    res = this.per(value, num);
                    break;
                case 'sep':
                    res = this.sep(value);
                    break;
                default:
                    break;
            }
        }
        else {
            switch (func) {
                case 'limit':
                    res = this.limit(value, num);
                    break;
                default:
                    break;
            }
            res = value;
        }
        return res;
    };
    //将数字按分号显示
    StringFormat.prototype.sep = function (value) {
        var num = Math.round(value).toString();
        return num.replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
    };
    //将数字按分显示 00:00 显示 （ms制）
    StringFormat.prototype.time_m = function (value) {
        //todo
    };
    //将数字按秒显示 00:00:00 显示 （ms制）
    StringFormat.prototype.time_s = function (value) {
        //todo
    };
    //将数字按 0:00:00:000 显示 （ms制）
    StringFormat.prototype.time_ms = function (value) {
        //todo
    };
    //将时间戳显示为详细的内容
    StringFormat.prototype.timeStamp = function (value) {
        //todo
        return new Date(value).toString();
    };
    /** [value:int] 将取值0~1 变成 1~100,可以指定修饰的小数位数 */
    StringFormat.prototype.per = function (value, fd) {
        return Math.round(value * 100).toFixed(fd);
    };
    /** [value:int] 将取值变成整数 */
    StringFormat.prototype.int = function (value) {
        return Math.round(value);
    };
    /** [value:fix2]数值转换为小数*/
    StringFormat.prototype.fix = function (value, fd) {
        return value.toFixed(fd);
    };
    /** [value:limit3]字符串长度限制 */
    StringFormat.prototype.limit = function (value, count) {
        return value.substring(0, count);
    };
    /** 将数字缩短显示为KMBT单位 大写,目前只支持英文 */
    StringFormat.prototype.KMBT = function (value, lang) {
        if (lang === void 0) { lang = 'en'; }
        //10^4=万, 10^8=亿,10^12=兆,10^16=京，
        var counts = [1000, 1000000, 1000000000, 1000000000000];
        var units = ['', 'K', 'M', 'B', 'T'];
        switch (lang) {
            case 'zh':
                //10^4=万, 10^8=亿,10^12=兆,10^16=京，
                var counts_1 = [10000, 100000000, 1000000000000, 10000000000000000];
                var units_1 = ['', '万', '亿', '兆', '京'];
                break;
            default:
                break;
        }
        return this.compressUnit(value, counts, units, 2);
    };
    //压缩任意单位的数字，后缀加上单位文字
    StringFormat.prototype.compressUnit = function (value, valueArr, unitArr, fixNum) {
        if (fixNum === void 0) { fixNum = 2; }
        var counts = valueArr;
        var units = unitArr;
        var res;
        var index;
        for (index = 0; index < counts.length; index++) {
            var e = counts[index];
            if (value < e) {
                if (index > 0) {
                    res = (value / counts[index - 1]).toFixed(fixNum);
                }
                else {
                    res = value.toFixed(0);
                }
                break;
            }
        }
        return res + units[index];
    };
    return StringFormat;
}());
/**格式化处理函数 */
exports.StringFormatFunction = new StringFormat();
