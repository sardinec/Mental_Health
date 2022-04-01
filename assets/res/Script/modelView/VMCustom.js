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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, executeInEditMode = _a.executeInEditMode, menu = _a.menu, help = _a.help;
/**自动检查识别的数组,你可以准备自己的组件放上去自动识别 */
var COMP_ARRAY_CHECK = [
    ['BhvFrameIndex', 'index', false],
    ['BhvGroupToggle', 'index', false],
    ['BhvRollNumber', 'targetValue', false],
    //组件名、默认属性、controller值
    ['cc.Label', 'string', false],
    ['cc.RichText', 'string', false],
    ['cc.EditBox', 'string', true],
    ['cc.Slider', 'progress', true],
    ['cc.ProgressBar', 'progress', false],
    ['cc.Toggle', 'isChecked', true]
];
/**
 * [VM-Custom]
 * 自定义数值监听, 可以快速对该节点上任意一个组件上的属性进行双向绑定
 */
var VMCustom = /** @class */ (function (_super) {
    __extends(VMCustom, _super);
    function VMCustom() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.controller = false;
        _this.watchPath = "";
        _this.componentName = "";
        _this.componentProperty = "";
        _this.refreshRate = 0.1;
        //计时器
        _this._timer = 0;
        /**监听的组件对象 */
        _this._watchComponent = null;
        /**是否能监听组件的数据 */
        _this._canWatchComponent = false;
        /**检查的值 */
        _this._oldValue = null;
        return _this;
    }
    // LIFE-CYCLE CALLBACKS:
    VMCustom.prototype.onLoad = function () {
        _super.prototype.onLoad.call(this);
        //只在运行时检查组件是否缺失可用
        this.checkEditorComponent(); //编辑器检查
        if (!CC_EDITOR) {
            this._watchComponent = this.node.getComponent(this.componentName);
            this.checkComponentState();
        }
    };
    VMCustom.prototype.onRestore = function () {
        this.checkEditorComponent();
    };
    VMCustom.prototype.start = function () {
        //从 watch 的路径中获取一个初始值
        this.onValueInit();
    };
    //挂在对应节点后，自动获取组件属性和名字
    VMCustom.prototype.checkEditorComponent = function () {
        if (CC_EDITOR) {
            var checkArray = COMP_ARRAY_CHECK;
            this.controller = false;
            for (var i = 0; i < checkArray.length; i++) {
                var params = checkArray[i];
                var comp = this.node.getComponent(params[0]);
                if (comp) {
                    if (this.componentName == '')
                        this.componentName = params[0];
                    if (this.componentProperty == '')
                        this.componentProperty = params[1];
                    if (params[2] !== null)
                        this.controller = params[2];
                    break;
                }
            }
        }
    };
    VMCustom.prototype.checkComponentState = function () {
        this._canWatchComponent = false;
        if (!this._watchComponent) {
            console.error('未设置需要监听的组件');
            return;
        }
        if (!this.componentProperty) {
            console.error('未设置需要监听的组件 的属性');
            return;
        }
        if (this.componentProperty in this._watchComponent === false) {
            console.error('需要监听的组件的属性不存在');
            return;
        }
        this._canWatchComponent = true;
    };
    VMCustom.prototype.getComponentValue = function () {
        return this._watchComponent[this.componentProperty];
    };
    VMCustom.prototype.setComponentValue = function (value) {
        //如果遇到cc.Toggle 组件就调用上面的方法解决
        if (this.componentName == "cc.Toggle") {
            if (value == true) {
                this.node.getComponent(cc.Toggle).check();
            }
            if (value == false) {
                this.node.getComponent(cc.Toggle).uncheck();
            }
        }
        else {
            this._watchComponent[this.componentProperty] = value;
        }
    };
    /**初始化获取数据 */
    VMCustom.prototype.onValueInit = function () {
        if (CC_EDITOR)
            return; //编辑器模式不初始化
        //更新信息
        this.setComponentValue(this.VM.getValue(this.watchPath));
    };
    /**[可重写]组件的值发生变化后，触发更新此值 */
    VMCustom.prototype.onValueController = function (newValue, oldValue) {
        this.VM.setValue(this.watchPath, newValue);
    };
    /**[可重写]初始化改变数据 */
    VMCustom.prototype.onValueChanged = function (n, o, pathArr) {
        this.setComponentValue(n);
    };
    VMCustom.prototype.update = function (dt) {
        //脏检查（组件是否存在，是否被激活）
        if (CC_EDITOR == true)
            return;
        //if (this.templateMode == true) return; //todo 模板模式下不能计算  
        if (!this.controller)
            return;
        if (!this._canWatchComponent || this._watchComponent['enabled'] === false)
            return;
        //刷新频率检查
        this._timer += dt;
        if (this._timer < this.refreshRate)
            return;
        this._timer = 0;
        var oldValue = this._oldValue;
        var newValue = this.getComponentValue();
        if (this._oldValue === newValue)
            return;
        this._oldValue = this.getComponentValue();
        this.onValueController(newValue, oldValue);
    };
    __decorate([
        property({
            tooltip: '激活controller,以开启双向绑定，否则只能接收消息'
        })
    ], VMCustom.prototype, "controller", void 0);
    __decorate([
        property
    ], VMCustom.prototype, "watchPath", void 0);
    __decorate([
        property({
            tooltip: '绑定组件的名字'
        })
    ], VMCustom.prototype, "componentName", void 0);
    __decorate([
        property({
            tooltip: '组件上需要监听的属性'
        })
    ], VMCustom.prototype, "componentProperty", void 0);
    __decorate([
        property({
            tooltip: '刷新间隔频率(只影响脏检查的频率)',
            step: 0.01,
            range: [0, 1],
            visible: function () { return this.controller === true; }
        })
    ], VMCustom.prototype, "refreshRate", void 0);
    VMCustom = __decorate([
        ccclass,
        executeInEditMode,
        menu('ModelViewer/VM-Custom (自定义VM)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMCustom.md')
    ], VMCustom);
    return VMCustom;
}(VMBase_1.default));
exports.default = VMCustom;
