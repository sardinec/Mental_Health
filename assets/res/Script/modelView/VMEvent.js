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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VMBase_1 = __importDefault(require("./VMBase"));
//todo
// +普通 label 更新数据的情况,label.string = xxx;
// +frameIndex 插件，通过number 数值设置 BhvFrameIndex 来切换当前贴图
// +spriteFrame 直接替换贴图的情况 , 
//  读取本地路径 data.spriteFrame = $res:/pic/com1
//  读取网页路径 data.spriteFrame = $url:http:xxxxxxxxxx.png
// +特殊条件控制 
// 比较条件:,如果传入值 > /< />= /<= /== 某值时，执行的action类型
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, executeInEditMode = _a.executeInEditMode, menu = _a.menu, help = _a.help;
// enum WatchMode {
//     ccLabel,
//     ccRichText,
//     ccSlider,
//     ccProgressBar,
// }
var FILTER_MODE;
(function (FILTER_MODE) {
    FILTER_MODE[FILTER_MODE["none"] = 0] = "none";
    FILTER_MODE[FILTER_MODE["=="] = 1] = "==";
    FILTER_MODE[FILTER_MODE["!="] = 2] = "!=";
    FILTER_MODE[FILTER_MODE[">"] = 3] = ">";
    FILTER_MODE[FILTER_MODE[">="] = 4] = ">=";
    FILTER_MODE[FILTER_MODE["<"] = 5] = "<";
    FILTER_MODE[FILTER_MODE["<="] = 6] = "<=";
})(FILTER_MODE || (FILTER_MODE = {}));
/**
 *  [VM-Event]
 * 提供  ViewModel 的相关基础功能,
 * 如果值发生变化将会调用对应的函数方法
 */
var VMEvent = /** @class */ (function (_super) {
    __extends(VMEvent, _super);
    function VMEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.templateMode = false;
        _this.watchPath = "";
        _this.triggerOnce = false;
        _this.watchPathArr = [];
        _this.filterMode = FILTER_MODE.none;
        _this.compareValue = '';
        _this.changeEvents = [];
        return _this;
        // update (dt) {}
    }
    // LIFE-CYCLE CALLBACKS:
    // onLoad () {}
    VMEvent.prototype.onValueInit = function () {
    };
    VMEvent.prototype.onValueChanged = function (newVar, oldVar, pathArr) {
        var res = this.conditionCheck(newVar, this.compareValue);
        if (!res)
            return;
        if (Array.isArray(this.changeEvents)) {
            this.changeEvents.forEach(function (v) {
                v.emit([newVar, oldVar, pathArr]);
            });
        }
        //激活一次后，自动关闭组件
        if (this.triggerOnce === true) {
            this.enabled = false;
        }
    };
    /**条件检查 */
    VMEvent.prototype.conditionCheck = function (a, b) {
        var cod = FILTER_MODE;
        switch (this.filterMode) {
            case cod.none:
                return true;
            case cod["=="]:
                if (a == b)
                    return true;
                break;
            case cod["!="]:
                if (a != b)
                    return true;
                break;
            case cod["<"]:
                if (a < b)
                    return true;
                break;
            case cod[">"]:
                if (a > b)
                    return true;
                break;
            case cod[">="]:
                if (a >= b)
                    return true;
                break;
            case cod["<"]:
                if (a < b)
                    return true;
                break;
            case cod["<="]:
                if (a <= b)
                    return true;
                break;
            default:
                break;
        }
        return false;
    };
    __decorate([
        property({
            tooltip: '使用模板模式，可以使用多路径监听'
        })
    ], VMEvent.prototype, "templateMode", void 0);
    __decorate([
        property({
            tooltip: '监听获取值的路径',
            visible: function () { return this.templateMode === false; }
        })
    ], VMEvent.prototype, "watchPath", void 0);
    __decorate([
        property({
            tooltip: '触发一次后会自动关闭该事件'
        })
    ], VMEvent.prototype, "triggerOnce", void 0);
    __decorate([
        property({
            tooltip: '监听获取值的多条路径,这些值的改变都会通过这个函数回调,请使用 pathArr 区分获取的值 ',
            type: [cc.String],
            visible: function () { return this.templateMode === true; }
        })
    ], VMEvent.prototype, "watchPathArr", void 0);
    __decorate([
        property({
            tooltip: '过滤模式，会根据条件过滤掉时间的触发',
            type: cc.Enum(FILTER_MODE)
        })
    ], VMEvent.prototype, "filterMode", void 0);
    __decorate([
        property({
            visible: function () { return this.filterMode !== FILTER_MODE.none; }
        })
    ], VMEvent.prototype, "compareValue", void 0);
    __decorate([
        property([cc.Component.EventHandler])
    ], VMEvent.prototype, "changeEvents", void 0);
    VMEvent = __decorate([
        ccclass,
        executeInEditMode,
        menu('ModelViewer/VM-EventCall(调用函数)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMEvent.md')
    ], VMEvent);
    return VMEvent;
}(VMBase_1.default));
exports.default = VMEvent;
