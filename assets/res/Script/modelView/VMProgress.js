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
var VMCustom_1 = __importDefault(require("./VMCustom"));
var StringFormat_1 = require("./StringFormat");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, menu = _a.menu, help = _a.help;
var VMProgress = /** @class */ (function (_super) {
    __extends(VMProgress, _super);
    function VMProgress() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.watchPath = '';
        _this.watchPathArr = ['[min]', '[max]'];
        _this.templateMode = true;
        _this.stringFormat = '';
        return _this;
    }
    // LIFE-CYCLE CALLBACKS:
    VMProgress.prototype.onLoad = function () {
        //cc.log(this.watchPathArr)
        if (this.watchPathArr.length < 2 || this.watchPathArr[0] == '[min]' || this.watchPathArr[1] == '[max]') {
            console.error('VMProgress must have two values!');
        }
        _super.prototype.onLoad.call(this);
    };
    VMProgress.prototype.start = function () {
        if (!CC_EDITOR) {
            this.onValueInit();
        }
    };
    VMProgress.prototype.onValueInit = function () {
        var max = this.watchPathArr.length;
        for (var i = 0; i < max; i++) {
            this.templateValueArr[i] = this.VM.getValue(this.watchPathArr[i]);
        }
        var value = this.templateValueArr[0] / this.templateValueArr[1];
        this.setComponentValue(value);
    };
    VMProgress.prototype.setComponentValue = function (value) {
        if (this.stringFormat !== '') {
            var res = StringFormat_1.StringFormatFunction.deal(value, this.stringFormat);
            _super.prototype.setComponentValue.call(this, res);
        }
        else {
            _super.prototype.setComponentValue.call(this, value);
        }
    };
    VMProgress.prototype.onValueController = function (n, o) {
        var value = Math.round(n * this.templateValueArr[1]);
        if (Number.isNaN(value))
            value = 0;
        this.VM.setValue(this.watchPathArr[0], value);
    };
    /**初始化改变数据 */
    VMProgress.prototype.onValueChanged = function (n, o, pathArr) {
        if (this.templateMode === false)
            return;
        var path = pathArr.join('.');
        //寻找缓存位置
        var index = this.watchPathArr.findIndex(function (v) { return v === path; });
        if (index >= 0) {
            //如果是所属的路径，就可以替换文本了
            this.templateValueArr[index] = n; //缓存值
        }
        var value = this.templateValueArr[0] / this.templateValueArr[1];
        if (value > 1)
            value = 1;
        if (value < 0 || Number.isNaN(value))
            value = 0;
        this.setComponentValue(value);
    };
    __decorate([
        property({
            visible: false,
            override: true
        })
    ], VMProgress.prototype, "watchPath", void 0);
    __decorate([
        property({
            type: [cc.String],
            tooltip: '第一个值是min 值，第二个值 是 max 值，会计算出两者的比例'
        })
    ], VMProgress.prototype, "watchPathArr", void 0);
    __decorate([
        property({
            visible: function () { return this.componentProperty === 'string'; },
            tooltip: '字符串格式化，和 VMLabel 的字段一样，需要填入对应的格式化字符串'
        })
    ], VMProgress.prototype, "stringFormat", void 0);
    VMProgress = __decorate([
        ccclass,
        menu('ModelViewer/VM-Progress (VM-进度条)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMProgress.md')
    ], VMProgress);
    return VMProgress;
}(VMCustom_1.default));
exports.default = VMProgress;
