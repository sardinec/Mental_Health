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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, menu = _a.menu, help = _a.help;
/**限制值边界范围的模式 */
var CLAMP_MODE;
(function (CLAMP_MODE) {
    CLAMP_MODE[CLAMP_MODE["MIN"] = 0] = "MIN";
    CLAMP_MODE[CLAMP_MODE["MAX"] = 1] = "MAX";
    CLAMP_MODE[CLAMP_MODE["MIN_MAX"] = 2] = "MIN_MAX";
})(CLAMP_MODE || (CLAMP_MODE = {}));
/**
 * [VM-Modify]
 * 动态快速的修改模型的数值,使用按钮 绑定该组件上的函数，即可动态调用
 * 修改 Model 的值
 */
var VMModify = /** @class */ (function (_super) {
    __extends(VMModify, _super);
    function VMModify() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.watchPath = "";
        _this.valueClamp = false;
        _this.valueClampMode = CLAMP_MODE.MIN_MAX;
        _this.valueMin = 0;
        _this.valueMax = 1;
        return _this;
        // update (dt) {}
    }
    // LIFE-CYCLE CALLBACKS:
    VMModify.prototype.start = function () {
    };
    //限制最终结果的取值范围
    VMModify.prototype.clampValue = function (res) {
        var min = this.valueMin;
        var max = this.valueMax;
        if (this.valueClamp == false)
            return res;
        switch (this.valueClampMode) {
            case CLAMP_MODE.MIN_MAX:
                if (res > max)
                    res = max;
                if (res < min)
                    res = min;
                break;
            case CLAMP_MODE.MIN:
                if (res < min)
                    res = min;
                break;
            case CLAMP_MODE.MAX:
                if (res > max)
                    res = max;
                break;
            default:
                break;
        }
        return res;
    };
    VMModify.prototype.vAddInt = function (e, data) {
        this.vAdd(e, data, true);
    };
    VMModify.prototype.vSubInt = function (e, data) {
        this.vSub(e, data, true);
    };
    VMModify.prototype.vMulInt = function (e, data) {
        this.vMul(e, data, true);
    };
    VMModify.prototype.vDivInt = function (e, data) {
        this.vDiv(e, data, true);
    };
    VMModify.prototype.vAdd = function (e, data, int) {
        if (int === void 0) { int = false; }
        var a = parseFloat(data);
        var res = this.VM.getValue(this.watchPath, 0) + a;
        if (int) {
            res = Math.round(res);
        }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    };
    VMModify.prototype.vSub = function (e, data, int) {
        if (int === void 0) { int = false; }
        var a = parseFloat(data);
        var res = this.VM.getValue(this.watchPath, 0) - a;
        if (int) {
            res = Math.round(res);
        }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    };
    VMModify.prototype.vMul = function (e, data, int) {
        if (int === void 0) { int = false; }
        var a = parseFloat(data);
        var res = this.VM.getValue(this.watchPath, 0) * a;
        if (int) {
            res = Math.round(res);
        }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    };
    VMModify.prototype.vDiv = function (e, data, int) {
        if (int === void 0) { int = false; }
        var a = parseFloat(data);
        var res = this.VM.getValue(this.watchPath, 0) / a;
        if (int) {
            res = Math.round(res);
        }
        this.VM.setValue(this.watchPath, this.clampValue(res));
    };
    VMModify.prototype.vString = function (e, data) {
        var a = data;
        this.VM.setValue(this.watchPath, a);
    };
    VMModify.prototype.vNumberInt = function (e, data) {
        this.vNumber(e, data, true);
    };
    VMModify.prototype.vNumber = function (e, data, int) {
        if (int === void 0) { int = false; }
        var a = parseFloat(data);
        if (int) {
            a = Math.round(a);
        }
        this.VM.setValue(this.watchPath, this.clampValue(a));
    };
    __decorate([
        property
    ], VMModify.prototype, "watchPath", void 0);
    __decorate([
        property()
    ], VMModify.prototype, "valueClamp", void 0);
    __decorate([
        property({
            type: cc.Enum(CLAMP_MODE),
            visible: function () { return this.valueClamp === true; }
        })
    ], VMModify.prototype, "valueClampMode", void 0);
    __decorate([
        property({
            visible: function () { return this.valueClamp === true && this.valueClampMode !== CLAMP_MODE.MAX; }
        })
    ], VMModify.prototype, "valueMin", void 0);
    __decorate([
        property({
            visible: function () { return this.valueClamp === true && this.valueClampMode !== CLAMP_MODE.MIN; }
        })
    ], VMModify.prototype, "valueMax", void 0);
    VMModify = __decorate([
        ccclass,
        menu('ModelViewer/VM-Modify(修改Model)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMModify.md')
    ], VMModify);
    return VMModify;
}(VMBase_1.default));
exports.default = VMModify;
