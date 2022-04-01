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
var StringFormat_1 = require("./StringFormat");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, menu = _a.menu, executeInEditMode = _a.executeInEditMode, help = _a.help;
var LABEL_TYPE = {
    CC_LABEL: 'cc.Label',
    CC_RICH_TEXT: 'cc.RichText',
    CC_EDIT_BOX: 'cc.EditBox'
};
/**
 *  [VM-Label]
 *  专门处理 Label 相关 的组件，如 ccLabel,ccRichText,ccEditBox
 *  可以使用模板化的方式将数据写入,可以处理字符串格式等
 *  todo 加入stringFormat 可以解析转换常见的字符串格式
 */
var VMLabel = /** @class */ (function (_super) {
    __extends(VMLabel, _super);
    function VMLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.watchPath = "";
        _this.labelType = LABEL_TYPE.CC_LABEL;
        _this.templateMode = false;
        //按照匹配参数顺序保存的 path 数组 （固定）
        _this.watchPathArr = [];
        //按照路径参数顺序保存的 值的数组（固定）
        _this.templateValueArr = [];
        //保存着字符模板格式的数组 (只会影响显示参数)
        _this.templateFormatArr = [];
        _this.originText = null;
        return _this;
        // update (dt) {}
    }
    // LIFE-CYCLE CALLBACKS:
    VMLabel.prototype.onRestore = function () {
        this.checkLabel();
    };
    VMLabel.prototype.onLoad = function () {
        _super.prototype.onLoad.call(this);
        this.checkLabel();
        if (!CC_EDITOR) {
            if (this.templateMode) {
                this.originText = this.getLabelValue();
                this.parseTemplate();
            }
        }
    };
    VMLabel.prototype.start = function () {
        if (CC_EDITOR)
            return;
        this.onValueInit();
    };
    //解析模板 获取初始格式化字符串格式 的信息
    VMLabel.prototype.parseTemplate = function () {
        var regexAll = /\{\{(.+?)\}\}/g; //匹配： 所有的{{value}}
        var regex = /\{\{(.+?)\}\}/; //匹配： {{value}} 中的 value
        var res = this.originText.match(regexAll); //匹配结果数组
        if (res == null)
            return;
        for (var i = 0; i < res.length; i++) {
            var e = res[i];
            var arr = e.match(regex);
            var matchName = arr[1];
            //let paramIndex = parseInt(matchName)||0;
            var matchInfo = matchName.split(':')[1] || '';
            this.templateFormatArr[i] = matchInfo;
        }
        //监听对应的数值变化
        //this.setMultPathEvent(true);
    };
    /**获取解析字符串模板后得到的值 */
    VMLabel.prototype.getReplaceText = function () {
        if (!this.originText)
            return "";
        var regexAll = /\{\{(.+?)\}\}/g; //匹配： 所有的{{value}}
        var regex = /\{\{(.+?)\}\}/; //匹配： {{value}} 中的 value
        var res = this.originText.match(regexAll); //匹配结果数组 [{{value}}，{{value}}，{{value}}]
        if (res == null)
            return ''; //未匹配到文本
        var str = this.originText; //原始字符串模板 "name:{{0}} 或 name:{{0:fix2}}"
        for (var i = 0; i < res.length; i++) {
            var e = res[i];
            var getValue = void 0;
            var arr = e.match(regex); //匹配到的数组 [{{value}}, value]
            var indexNum = parseInt(arr[1] || '0') || 0; //取出数组的 value 元素 转换成整数
            var format = this.templateFormatArr[i]; //格式化字符 的 配置参数
            getValue = this.templateValueArr[indexNum];
            str = str.replace(e, this.getValueFromFormat(getValue, format)); //从路径缓存值获取数据
        }
        return str;
    };
    /** 格式化字符串 */
    VMLabel.prototype.getValueFromFormat = function (value, format) {
        return StringFormat_1.StringFormatFunction.deal(value, format);
    };
    /**初始化获取数据 */
    VMLabel.prototype.onValueInit = function () {
        //更新信息
        if (this.templateMode === false) {
            this.setLabelValue(this.VM.getValue(this.watchPath)); //
        }
        else {
            var max = this.watchPathArr.length;
            for (var i = 0; i < max; i++) {
                this.templateValueArr[i] = this.VM.getValue(this.watchPathArr[i], '?');
            }
            this.setLabelValue(this.getReplaceText()); // 重新解析
        }
    };
    /**监听数据发生了变动的情况 */
    VMLabel.prototype.onValueChanged = function (n, o, pathArr) {
        if (this.templateMode === false) {
            this.setLabelValue(n);
        }
        else {
            var path_1 = pathArr.join('.');
            //寻找缓存位置
            var index = this.watchPathArr.findIndex(function (v) { return v === path_1; });
            if (index >= 0) {
                //如果是所属的路径，就可以替换文本了
                this.templateValueArr[index] = n; //缓存值
                this.setLabelValue(this.getReplaceText()); // 重新解析文本
            }
        }
    };
    VMLabel.prototype.setLabelValue = function (value) {
        this.getComponent(this.labelType).string = value + '';
    };
    VMLabel.prototype.getLabelValue = function () {
        return this.getComponent(this.labelType).string;
    };
    VMLabel.prototype.checkLabel = function () {
        var checkArray = [
            'cc.Label',
            'cc.RichText',
            'cc.EditBox',
        ];
        for (var i = 0; i < checkArray.length; i++) {
            var e = checkArray[i];
            var comp = this.node.getComponent(e);
            if (comp) {
                this.labelType = e;
                return true;
            }
        }
        cc.error('没有挂载任何label组件');
        return false;
    };
    __decorate([
        property({
            visible: function () {
                return this.templateMode === false;
            }
        })
    ], VMLabel.prototype, "watchPath", void 0);
    __decorate([
        property({
            //type:cc.Enum(LABEL_TYPE),
            readonly: true
        })
    ], VMLabel.prototype, "labelType", void 0);
    __decorate([
        property({
            tooltip: '是否启用模板代码,只能在运行时之前设置,\n将会动态解析模板语法 {{0}},并且自动设置监听的路径'
        })
    ], VMLabel.prototype, "templateMode", void 0);
    __decorate([
        property({
            type: [cc.String],
            visible: function () { return this.templateMode === true; }
        })
    ], VMLabel.prototype, "watchPathArr", void 0);
    VMLabel = __decorate([
        ccclass,
        executeInEditMode,
        menu('ModelViewer/VM-Label(文本VM)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMLabel.md')
    ], VMLabel);
    return VMLabel;
}(VMBase_1.default));
exports.default = VMLabel;
