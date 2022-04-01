"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ViewModel_1 = require("./ViewModel");
//用来处理通知数据的层级
//控制旗下子节点的数据
//目前只是起到一个识别组件的作用，之后会抽象很多功能在这里面
// player.equips.* 可以自动根据所在父对象的位置设置顺序
var DEBUG_WATCH_PATH = false;
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
/**
 * watchPath 的基础，只提供绑定功能 和 对应的数据更新函数
 */
var VMBase = /** @class */ (function (_super) {
    __extends(VMBase, _super);
    function VMBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** watch 单路径  */
        _this.watchPath = '';
        /** watch 多路径 */
        _this.watchPathArr = [];
        /**是否启用模板多路径模式 */
        _this.templateMode = false;
        /**储存模板多路径的值 */
        _this.templateValueArr = [];
        /**VM管理 */
        _this.VM = ViewModel_1.VM;
        return _this;
    }
    /**
     * 如果需要重写onLoad 方法，请根据顺序调用 super.onLoad()，执行默认方法
     */
    VMBase.prototype.onLoad = function () {
        var _this = this;
        if (CC_EDITOR)
            return;
        //提前拆分、并且解析路径
        var paths = this.watchPath.split('.');
        for (var i = 1; i < paths.length; i++) {
            var p = paths[i];
            //如果发现了路径使用了 * ，则自动去自己的父节点查找自己所在 index 值
            if (p == '*') {
                var index = this.node.getParent().children.findIndex(function (n) { return n === _this.node; });
                if (index <= 0)
                    index = 0;
                paths[i] = index.toString();
                break;
            }
        }
        //替换掉原路径
        this.watchPath = paths.join('.');
        //提前进行路径数组 的 解析
        var pathArr = this.watchPathArr;
        if (pathArr.length >= 1) {
            for (var i = 0; i < pathArr.length; i++) {
                var path = pathArr[i];
                var paths_1 = path.split('.');
                for (var i_1 = 1; i_1 < paths_1.length; i_1++) {
                    var p = paths_1[i_1];
                    if (p == '*') {
                        var index = this.node.getParent().children.findIndex(function (n) { return n === _this.node; });
                        if (index <= 0)
                            index = 0;
                        paths_1[i_1] = index.toString();
                        break;
                    }
                }
                this.watchPathArr[i] = paths_1.join('.');
            }
        }
        //打印出所有绑定的路径，方便调试信息
        if (DEBUG_WATCH_PATH && CC_DEBUG) {
            cc.log('所有路径', this.watchPath ? [this.watchPath] : this.watchPathArr, '<<', this.node.getParent().name + '.' + this.node.name);
        }
        if (this.watchPath == '' && this.watchPathArr.join('') == '') {
            cc.log('可能未设置路径的节点:', this.node.getParent().name + '.' + this.node.name);
        }
    };
    VMBase.prototype.onEnable = function () {
        if (CC_EDITOR)
            return; //编辑器模式不能判断
        if (this.templateMode) {
            this.setMultPathEvent(true);
        }
        else if (this.watchPath != '') {
            this.VM.bindPath(this.watchPath, this.onValueChanged, this);
        }
        this.onValueInit(); //激活时,调用值初始化
    };
    VMBase.prototype.onDisable = function () {
        if (CC_EDITOR)
            return; //编辑器模式不能判断
        if (this.templateMode) {
            this.setMultPathEvent(false);
        }
        else if (this.watchPath != '') {
            this.VM.unbindPath(this.watchPath, this.onValueChanged, this);
        }
    };
    //多路径监听方式
    VMBase.prototype.setMultPathEvent = function (enabled) {
        if (enabled === void 0) { enabled = true; }
        if (CC_EDITOR)
            return;
        var arr = this.watchPathArr;
        for (var i = 0; i < arr.length; i++) {
            var path = arr[i];
            if (enabled) {
                this.VM.bindPath(path, this.onValueChanged, this);
            }
            else {
                this.VM.unbindPath(path, this.onValueChanged, this);
            }
        }
    };
    VMBase.prototype.onValueInit = function () {
        //虚方法
    };
    VMBase.prototype.onValueChanged = function (n, o, pathArr) {
    };
    VMBase = __decorate([
        ccclass
    ], VMBase);
    return VMBase;
}(cc.Component));
exports.default = VMBase;
