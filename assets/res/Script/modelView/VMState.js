"use strict";
var __extends = (this && this.__extends) || (function() {
    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] }
                instanceof Array && function(d, b) { d.__proto__ = b; }) ||
            function(d, b) { for (var p in b)
                    if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function(d, b) {
        extendStatics(d, b);

        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ViewModel_1 = require("./ViewModel");
var VMBase_1 = __importDefault(require("./VMBase"));
var _a = cc._decorator,
    ccclass = _a.ccclass,
    property = _a.property,
    menu = _a.menu,
    help = _a.help;
/**比较条件 */
var CONDITION;
(function(CONDITION) {
    CONDITION[CONDITION["=="] = 0] = "==";
    CONDITION[CONDITION["!="] = 1] = "!=";
    CONDITION[CONDITION[">"] = 2] = ">";
    CONDITION[CONDITION[">="] = 3] = ">=";
    CONDITION[CONDITION["<"] = 4] = "<";
    CONDITION[CONDITION["<="] = 5] = "<=";
    CONDITION[CONDITION["range"] = 6] = "range"; //计算在范围内
})(CONDITION || (CONDITION = {}));
var ACTION;
(function(ACTION) {
    ACTION[ACTION["NODE_ACTIVE"] = 0] = "NODE_ACTIVE";
    ACTION[ACTION["NODE_VISIBLE"] = 1] = "NODE_VISIBLE";
    ACTION[ACTION["NODE_OPACITY"] = 2] = "NODE_OPACITY";
    ACTION[ACTION["NODE_COLOR"] = 3] = "NODE_COLOR";
    ACTION[ACTION["COMPONENT_CUSTOM"] = 4] = "COMPONENT_CUSTOM";
})(ACTION || (ACTION = {}));
var CHILD_MODE_TYPE;
(function(CHILD_MODE_TYPE) {
    CHILD_MODE_TYPE[CHILD_MODE_TYPE["NODE_INDEX"] = 0] = "NODE_INDEX";
    CHILD_MODE_TYPE[CHILD_MODE_TYPE["NODE_NAME"] = 1] = "NODE_NAME";
})(CHILD_MODE_TYPE || (CHILD_MODE_TYPE = {}));
/**
 * [VM-State]
 * 监听数值状态,根据数值条件设置节点是否激活
 */
var VMState = /** @class */ (function(_super) {
    __extends(VMState, _super);

    function VMState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.watchPath = "";
        _this.foreachChildMode = false;
        _this.condition = CONDITION["=="];
        _this.foreachChildType = CHILD_MODE_TYPE.NODE_INDEX;
        _this.valueA = 0;
        _this.valueB = 0;
        _this.valueAction = ACTION.NODE_ACTIVE;
        _this.valueActionOpacity = 0;
        _this.valueActionColor = cc.color(155, 155, 155);
        _this.valueComponentName = '';
        _this.valueComponentProperty = '';
        _this.valueComponentDefaultValue = '';
        _this.valueComponentActionValue = '';
        _this.watchNodes = [];
        return _this;
        // update (dt) {}
    }
    // LIFE-CYCLE CALLBACKS:
    VMState.prototype.onLoad = function() {
        _super.prototype.onLoad.call(this);
        //如果数组里没有监听值，那么默认把所有子节点给监听了
        if (this.watchNodes.length == 0) {
            if (this.valueAction !== ACTION.NODE_ACTIVE && this.foreachChildMode === false) {
                this.watchNodes.push(this.node);
            }
            this.watchNodes = this.watchNodes.concat(this.node.children);
        }
    };
    VMState.prototype.start = function() {
        if (this.enabled) {
            this.onValueInit();
        }
    };
    //当值初始化时
    VMState.prototype.onValueInit = function() {
        var value = ViewModel_1.VM.getValue(this.watchPath);
        this.checkNodeFromValue(value);
    };
    //当值被改变时
    VMState.prototype.onValueChanged = function(newVar, oldVar, pathArr) {
        this.checkNodeFromValue(newVar);
    };
    //检查节点值更新
    VMState.prototype.checkNodeFromValue = function(value) {
        var _this = this;
        if (this.foreachChildMode) {
            this.watchNodes.forEach(function(node, index) {
                var v = (_this.foreachChildType === CHILD_MODE_TYPE.NODE_INDEX) ? index : node.name;
                var check = _this.conditionCheck(value, v);
                //cc.log('遍历模式',value,node.name,check);
                _this.setNodeState(node, check);
            });
        } else {
            var check = this.conditionCheck(value, this.valueA, this.valueB);
            this.setNodesStates(check);
        }
    };
    //更新 多个节点 的 状态
    VMState.prototype.setNodesStates = function(checkState) {
        var _this = this;
        var nodes = this.watchNodes;
        var check = checkState;
        nodes.forEach(function(node) {
            _this.setNodeState(node, check);
        });
    };
    /**更新单个节点的状态 */
    VMState.prototype.setNodeState = function(node, checkState) {
        var n = this.valueAction;
        var check = checkState;
        var a = ACTION;
        switch (n) {
            case a.NODE_ACTIVE:
                node.active = check ? true : false;
                break;
            case a.NODE_VISIBLE:
                node.opacity = check ? 255 : 0;
                break;
            case a.NODE_COLOR:
                node.color = check ? this.valueActionColor : cc.color(255, 255, 255);
                break;
            case a.NODE_OPACITY:
                node.opacity = check ? this.valueActionOpacity : 255;
                break;
            case a.COMPONENT_CUSTOM:
                var comp = node.getComponent(this.valueComponentName);
                if (comp == null)
                    return;
                if (this.valueComponentProperty in comp) {
                    comp[this.valueComponentProperty] = check ? this.valueComponentActionValue : this.valueComponentDefaultValue;
                }
                break;
            default:
                break;
        }
    };
    /**条件检查 */
    VMState.prototype.conditionCheck = function(v, a, b) {
        var cod = CONDITION;
        switch (this.condition) {
            case cod["=="]:
                if (v == a)
                    return true;
                break;
            case cod["!="]:
                if (v != a)
                    return true;
                break;
            case cod["<"]:
                if (v < a)
                    return true;
                break;
            case cod[">"]:
                if (v > a)
                    return true;
                break;
            case cod[">="]:
                if (v >= a)
                    return true;
                break;
            case cod["<"]:
                if (v < a)
                    return true;
                break;
            case cod["<="]:
                if (v <= a)
                    return true;
                break;
            case cod["range"]:
                if (v >= a && v <= b)
                    return true;
                break;
            default:
                break;
        }
        return false;
    };
    __decorate([
        property
    ], VMState.prototype, "watchPath", void 0);
    __decorate([
        property({
            tooltip: '遍历子节点,根据子节点的名字或名字转换为值，判断值满足条件 来激活'
        })
    ], VMState.prototype, "foreachChildMode", void 0);
    __decorate([
        property({
            type: cc.Enum(CONDITION),
        })
    ], VMState.prototype, "condition", void 0);
    __decorate([
        property({
            type: cc.Enum(CHILD_MODE_TYPE),
            tooltip: '遍历子节点,根据子节点的名字转换为值，判断值满足条件 来激活',
            visible: function() { return this.foreachChildMode === true; }
        })
    ], VMState.prototype, "foreachChildType", void 0);
    __decorate([
        property({
            displayName: 'Value: a',
            visible: function() { return this.foreachChildMode === false; }
        })
    ], VMState.prototype, "valueA", void 0);
    __decorate([
        property({
            displayName: 'Value: b',
            visible: function() { return this.foreachChildMode === false && this.condition === CONDITION.range; }
        })
    ], VMState.prototype, "valueB", void 0);
    __decorate([
        property({
            type: cc.Enum(ACTION),
            tooltip: '一旦满足条件就对节点执行操作'
        })
    ], VMState.prototype, "valueAction", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.NODE_OPACITY; },
            range: [0, 255],
            type: cc.Integer,
            displayName: 'Action Opacity'
        })
    ], VMState.prototype, "valueActionOpacity", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.NODE_COLOR; },
            displayName: 'Action Color'
        })
    ], VMState.prototype, "valueActionColor", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.COMPONENT_CUSTOM; },
            displayName: 'Component Name'
        })
    ], VMState.prototype, "valueComponentName", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.COMPONENT_CUSTOM; },
            displayName: 'Component Property'
        })
    ], VMState.prototype, "valueComponentProperty", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.COMPONENT_CUSTOM; },
            displayName: 'Default Value'
        })
    ], VMState.prototype, "valueComponentDefaultValue", void 0);
    __decorate([
        property({
            visible: function() { return this.valueAction === ACTION.COMPONENT_CUSTOM; },
            displayName: 'Action Value'
        })
    ], VMState.prototype, "valueComponentActionValue", void 0);
    __decorate([
        property({
            type: [cc.Node],
            tooltip: '需要执行条件的节点，如果不填写则默认会执行本节点以及本节点的所有子节点 的状态'
        })
    ], VMState.prototype, "watchNodes", void 0);
    VMState = __decorate([
        ccclass,
        menu('ModelViewer/VM-State (VM状态控制)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMState.md')
    ], VMState);
    return VMState;
}(VMBase_1.default));
exports.default = VMState;