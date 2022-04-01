"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM = void 0;
var JsonOb_1 = require("./JsonOb");
var VM_EMIT_HEAD = 'VC:';
var DEBUG_SHOW_PATH = false;
//通过 .  路径 设置值
function setValueFromPath(obj, path, value, tag) {
    if (tag === void 0) { tag = ''; }
    var props = path.split('.');
    for (var i = 0; i < props.length; i++) {
        var propName = props[i];
        if (propName in obj === false) {
            console.error('[' + propName + '] not find in ' + tag + '.' + path);
            break;
        }
        if (i == props.length - 1) {
            obj[propName] = value;
        }
        else {
            obj = obj[propName];
        }
    }
}
//通过 . 路径 获取值
function getValueFromPath(obj, path, def, tag) {
    if (tag === void 0) { tag = ''; }
    var props = path.split('.');
    for (var i = 0; i < props.length; i++) {
        var propName = props[i];
        if ((propName in obj === false)) {
            console.error('[' + propName + '] not find in ' + tag + '.' + path);
            return def;
        }
        obj = obj[propName];
    }
    if (obj === null || typeof obj === "undefined")
        obj = def; //如果g == null 则返回一个默认值
    return obj;
}
/**
 * ModelViewer 类
 */
var ViewModel = /** @class */ (function () {
    function ViewModel(data, tag) {
        //索引值用的标签
        this._tag = null;
        /**激活状态, 将会通过 cc.director.emit 发送值变动的信号, 适合需要屏蔽的情况 */
        this.active = true;
        /**是否激活根路径回调通知, 不激活的情况下 只能监听末端路径值来判断是否变化 */
        this.emitToRootPath = false;
        new JsonOb_1.JsonOb(data, this._callback.bind(this));
        this.$data = data;
        this._tag = tag;
    }
    //回调函数 请注意 回调的 path 数组是 引用类型，禁止修改
    ViewModel.prototype._callback = function (n, o, path) {
        if (this.active == true) {
            var name_1 = VM_EMIT_HEAD + this._tag + '.' + path.join('.');
            if (DEBUG_SHOW_PATH)
                cc.log('>>', n, o, path);
            cc.director.emit(name_1, n, o, [this._tag].concat(path)); //通知末端路径
            if (this.emitToRootPath)
                cc.director.emit(VM_EMIT_HEAD + this._tag, n, o, path); //通知主路径
            if (path.length >= 2) {
                for (var i = 0; i < path.length - 1; i++) {
                    var e = path[i];
                    //cc.log('中端路径');
                }
            }
        }
    };
    //通过路径设置数据的方法
    ViewModel.prototype.setValue = function (path, value) {
        setValueFromPath(this.$data, path, value, this._tag);
    };
    //获取路径的值
    ViewModel.prototype.getValue = function (path, def) {
        return getValueFromPath(this.$data, path, def, this._tag);
    };
    return ViewModel;
}());
/**
 * VM 对象管理器(工厂)
 */
var VMManager = /** @class */ (function () {
    function VMManager() {
        /**静态数组，保存创建的 mv 组件 */
        this._mvs = [];
        this.EMIT_HEAD = VM_EMIT_HEAD;
        this.setObjValue = setValueFromPath;
        this.getObjValue = getValueFromPath;
    }
    /**
     * 绑定一个数据，并且可以由VM所管理
     * @param data 需要绑定的数据
     * @param tag 对应该数据的标签(用于识别为哪个VM，不允许重复)
     * @param activeRootObject 激活主路径通知，可能会有性能影响，一般不使用
     */
    VMManager.prototype.add = function (data, tag, activeRootObject) {
        if (tag === void 0) { tag = 'global'; }
        if (activeRootObject === void 0) { activeRootObject = false; }
        var vm = new ViewModel(data, tag);
        var has = this._mvs.find(function (v) { return v.tag === tag; });
        if (tag.includes('.')) {
            console.error('cant write . in tag:', tag);
            return;
        }
        if (has) {
            console.error('already set VM tag:' + tag);
            return;
        }
        vm.emitToRootPath = activeRootObject;
        this._mvs.push({ tag: tag, vm: vm });
    };
    /**
     * 移除并且销毁 VM 对象
     * @param tag
     */
    VMManager.prototype.remove = function (tag) {
        var index = this._mvs.findIndex(function (v) { return v.tag === tag; });
        if (index >= 0)
            this._mvs.splice(index, 1);
    };
    /**
     * 获取绑定的数据
     * @param tag 数据tag
     */
    VMManager.prototype.get = function (tag) {
        var res = this._mvs.find(function (v) { return v.tag === tag; });
        if (res == null) {
            console.error('cant find VM from:', tag);
        }
        else {
            return res.vm;
        }
    };
    /**
     * 通过全局路径,而不是 VM 对象来 设置值
     * @param path - 全局取值路径
     * @param value - 需要增加的值
     */
    VMManager.prototype.addValue = function (path, value) {
        path = path.trim(); //防止空格,自动剔除
        var rs = path.split('.');
        if (rs.length < 2) {
            console.error('Cant find path:' + path);
        }
        ;
        var vm = this.get(rs[0]);
        if (!vm) {
            console.error('Cant Set VM:' + rs[0]);
            return;
        }
        ;
        var resPath = rs.slice(1).join('.');
        vm.setValue(resPath, vm.getValue(resPath) + value);
    };
    /**
     * 通过全局路径,而不是 VM 对象来 获取值
     * @param path - 全局取值路径
     * @param def - 如果取不到值的返回的默认值
     */
    VMManager.prototype.getValue = function (path, def) {
        path = path.trim(); //防止空格,自动剔除
        var rs = path.split('.');
        if (rs.length < 2) {
            console.error('Get Value Cant find path:' + path);
            return;
        }
        ;
        var vm = this.get(rs[0]);
        if (!vm) {
            console.error('Cant Get VM:' + rs[0]);
            return;
        }
        ;
        return vm.getValue(rs.slice(1).join('.'), def);
    };
    /**
     * 通过全局路径,而不是 VM 对象来 设置值
     * @param path - 全局取值路径
     * @param value - 需要设置的值
     */
    VMManager.prototype.setValue = function (path, value) {
        path = path.trim(); //防止空格,自动剔除
        var rs = path.split('.');
        if (rs.length < 2) {
            console.error('Set Value Cant find path:' + path);
            return;
        }
        ;
        var vm = this.get(rs[0]);
        if (!vm) {
            console.error('Cant Set VM:' + rs[0]);
            return;
        }
        ;
        vm.setValue(rs.slice(1).join('.'), value);
    };
    /**等同于 cc.director.on */
    VMManager.prototype.bindPath = function (path, callback, target, useCapture) {
        path = path.trim(); //防止空格,自动剔除
        if (path == '') {
            console.error(target.node.name, '节点绑定的路径为空');
            return;
        }
        if (path.split('.')[0] === '*') {
            console.error(path, '路径不合法,可能错误覆盖了 VMParent 的onLoad 方法, 或者父节点并未挂载 VMParent 相关的组件脚本');
            return;
        }
        cc.director.on(VM_EMIT_HEAD + path, callback, target, useCapture);
    };
    /**等同于 cc.director.off */
    VMManager.prototype.unbindPath = function (path, callback, target) {
        path = path.trim(); //防止空格,自动剔除
        if (path.split('.')[0] === '*') {
            console.error(path, '路径不合法,可能错误覆盖了 VMParent 的onLoad 方法, 或者父节点并未挂载 VMParent 相关的组件脚本');
            return;
        }
        cc.director.off(VM_EMIT_HEAD + path, callback, target);
    };
    /**冻结所有标签的 VM，视图将不会受到任何信息 */
    VMManager.prototype.inactive = function () {
        this._mvs.forEach(function (mv) {
            mv.vm.active = false;
        });
    };
    /**激活所有标签的 VM*/
    VMManager.prototype.active = function () {
        this._mvs.forEach(function (mv) {
            mv.vm.active = true;
        });
    };
    return VMManager;
}());
//   整数、小数、时间、缩写
/**
 * VM管理对象,使用文档:
 *  https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/ViewModelScript.md
 */
exports.VM = new VMManager();
