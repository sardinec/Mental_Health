"use strict";
/**
 * 实现动态绑定的核心部分，
 * 每次修改属性值，都会调用对应函数，并且获取值的路径
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonOb = void 0;
var OP = Object.prototype;
var types = {
    obj: '[object Object]',
    array: '[object Array]'
};
var OAM = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
/**
 * 实现属性拦截的类
 */
var JsonOb = /** @class */ (function () {
    function JsonOb(obj, callback) {
        if (OP.toString.call(obj) !== types.obj && OP.toString.call(obj) !== types.array) {
            console.error('请传入一个对象或数组');
        }
        this._callback = callback;
        this.observe(obj);
    }
    /**对象属性劫持 */
    JsonOb.prototype.observe = function (obj, path) {
        var _this = this;
        if (OP.toString.call(obj) === types.array) {
            this.overrideArrayProto(obj, path);
        }
        Object.keys(obj).forEach(function (key) {
            var self = _this;
            var oldVal = obj[key];
            var pathArray = path && path.slice();
            if (pathArray) {
                pathArray.push(key);
            }
            else {
                pathArray = [key];
            }
            Object.defineProperty(obj, key, {
                get: function () {
                    return oldVal;
                },
                set: function (newVal) {
                    //cc.log(newVal);
                    if (oldVal !== newVal) {
                        if (OP.toString.call(newVal) === '[object Object]') {
                            self.observe(newVal, pathArray);
                        }
                        self._callback(newVal, oldVal, pathArray);
                        oldVal = newVal;
                    }
                }
            });
            if (OP.toString.call(obj[key]) === types.obj || OP.toString.call(obj[key]) === types.array) {
                _this.observe(obj[key], pathArray);
            }
        }, this);
    };
    /**
     * 对数组类型进行动态绑定
     * @param array
     * @param path
     */
    JsonOb.prototype.overrideArrayProto = function (array, path) {
        // 保存原始 Array 原型  
        var originalProto = Array.prototype;
        // 通过 Object.create 方法创建一个对象，该对象的原型是Array.prototype  
        var overrideProto = Object.create(Array.prototype);
        var self = this;
        var result;
        // 遍历要重写的数组方法  
        OAM.forEach(function (method) {
            Object.defineProperty(overrideProto, method, {
                value: function () {
                    var oldVal = this.slice();
                    //调用原始原型上的方法  
                    result = originalProto[method].apply(this, arguments);
                    //继续监听新数组  
                    self.observe(this, path);
                    self._callback(this, oldVal, path);
                    return result;
                }
            });
        });
        // 最后 让该数组实例的 __proto__ 属性指向 假的原型 overrideProto  
        array['__proto__'] = overrideProto;
    };
    return JsonOb;
}());
exports.JsonOb = JsonOb;
