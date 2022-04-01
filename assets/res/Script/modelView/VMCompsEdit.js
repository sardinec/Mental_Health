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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, executeInEditMode = _a.executeInEditMode, menu = _a.menu, help = _a.help;
var ACTION_MODE;
(function (ACTION_MODE) {
    ACTION_MODE[ACTION_MODE["SEARCH_COMPONENT"] = 0] = "SEARCH_COMPONENT";
    ACTION_MODE[ACTION_MODE["ENABLE_COMPONENT"] = 1] = "ENABLE_COMPONENT";
    ACTION_MODE[ACTION_MODE["REPLACE_WATCH_PATH"] = 2] = "REPLACE_WATCH_PATH";
    ACTION_MODE[ACTION_MODE["DELETE_COMPONENT"] = 3] = "DELETE_COMPONENT";
})(ACTION_MODE || (ACTION_MODE = {}));
/**
 * 用于搜索的MV 组件列表，挂载在父节点后，
 * 会遍历搜索下面的所有MV组件, 并且显示其观察值的路径
 */
var MVCompsEdit = /** @class */ (function (_super) {
    __extends(MVCompsEdit, _super);
    function MVCompsEdit() {
        // LIFE-CYCLE CALLBACKS:
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.findList = ["VMBase", "VMParent"];
        _this.actionType = ACTION_MODE.SEARCH_COMPONENT;
        _this.allowDelete = false;
        _this.targetPath = 'game';
        _this.replacePath = '*';
        _this.canCollectNodes = false;
        _this.collectNodes = [];
        return _this;
        // update (dt) {}
    }
    Object.defineProperty(MVCompsEdit.prototype, "findTrigger", {
        get: function () {
            return false;
        },
        set: function (v) {
            this.setComponents(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MVCompsEdit.prototype, "enableTrigger", {
        get: function () {
            return false;
        },
        set: function (v) {
            this.setComponents(1);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MVCompsEdit.prototype, "disableTrigger", {
        get: function () {
            return false;
        },
        set: function (v) {
            this.setComponents(2);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MVCompsEdit.prototype, "deleteTrigger", {
        get: function () {
            return false;
        },
        set: function (v) {
            this.setComponents(3);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MVCompsEdit.prototype, "replaceTrigger", {
        get: function () {
            return false;
        },
        set: function (v) {
            this.setComponents(4);
        },
        enumerable: false,
        configurable: true
    });
    MVCompsEdit.prototype.onLoad = function () {
        //不要把脚本挂载运行时的提示
        if (!CC_EDITOR) {
            var path = this.getNodePath(this.node);
            console.error('you forget delete MVEditFinder,[path]', path);
        }
    };
    MVCompsEdit.prototype.setComponents = function (state) {
        var _this = this;
        var array = this.findList;
        var title = '搜索到当前节点下面的组件';
        switch (state) {
            case 0:
                title = '搜索到当前节点下面的组件';
                break;
            case 1:
                title = '激活以下节点的组件';
                break;
            case 2:
                title = '关闭以下节点的组件';
                break;
            case 3:
                title = '删除以下节点的组件';
                break;
            case 4:
                title = '替换以下节点的路径';
                break;
            default:
                break;
        }
        cc.log(title);
        cc.log('______________________');
        array.forEach(function (name) {
            _this.searchComponent(name, state);
        });
        cc.log('______________________');
    };
    /**
     *
     * @param className
     * @param state 0-查找节点组件 1-激活节点组件 2-关闭节点组件 3-移除节点组件
     */
    MVCompsEdit.prototype.searchComponent = function (className, state) {
        var _this = this;
        if (state === void 0) { state = 0; }
        /**收集节点清空 */
        this.collectNodes = [];
        var comps = this.node.getComponentsInChildren(className);
        if (comps == null || comps.length < 1)
            return;
        cc.log('[' + className + ']:');
        comps.forEach(function (v) {
            var ext = '';
            if (state <= 3) {
                //区分模板模式路径
                if (v.templateMode === true) {
                    ext = v.watchPathArr ? ':[Path:' + v.watchPathArr.join('|') + ']' : '';
                }
                else {
                    ext = v.watchPath ? ':[Path:' + v.watchPath + ']' : '';
                }
            }
            cc.log(_this.getNodePath(v.node) + ext);
            switch (state) {
                case 0: //寻找组件
                    if (_this.canCollectNodes) {
                        if (_this.collectNodes.indexOf(v.node) === -1) {
                            _this.collectNodes.push(v.node);
                        }
                    }
                    break;
                case 1: //激活组件
                    v.enabled = true;
                    break;
                case 2: //关闭组件
                    v.enabled = false;
                    break;
                case 3: //删除组件
                    v.node.removeComponent(v);
                    break;
                case 4: //替换指定路径
                    var targetPath = _this.targetPath;
                    var replacePath = _this.replacePath;
                    if (v.templateMode === true) {
                        for (var i = 0; i < v.watchPathArr.length; i++) {
                            var path = v.watchPathArr[i];
                            v.watchPathArr[i] = _this.replaceNodePath(path, targetPath, replacePath);
                        }
                    }
                    else {
                        v.watchPath = _this.replaceNodePath(v.watchPath, targetPath, replacePath);
                    }
                default:
                    break;
            }
        });
    };
    MVCompsEdit.prototype.replaceNodePath = function (path, search, replace) {
        var pathArr = path.split('.');
        var searchArr = search.split('.');
        var replaceArr = replace.split('.');
        var match = true;
        for (var i = 0; i < searchArr.length; i++) {
            //未匹配上
            if (pathArr[i] !== searchArr[i]) {
                match = false;
                break;
            }
        }
        //匹配成功准备替换路径
        if (match === true) {
            for (var i = 0; i < replaceArr.length; i++) {
                pathArr[i] = replaceArr[i];
            }
            cc.log(' 路径更新:', path, '>>>', pathArr.join('.'));
        }
        return pathArr.join('.');
    };
    MVCompsEdit.prototype.getNodePath = function (node) {
        var parent = node;
        var array = [];
        while (parent) {
            var p = parent.getParent();
            if (p) {
                array.push(parent.name);
                parent = p;
            }
            else {
                break;
            }
        }
        return array.reverse().join('/');
    };
    __decorate([
        property({
            type: [cc.String]
        })
    ], MVCompsEdit.prototype, "findList", void 0);
    __decorate([
        property({
            type: cc.Enum(ACTION_MODE)
        })
    ], MVCompsEdit.prototype, "actionType", void 0);
    __decorate([
        property({
            tooltip: '勾选后,会自动查找 find list 中填写的组件',
            visible: function () { return this.actionType === ACTION_MODE.SEARCH_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "findTrigger", null);
    __decorate([
        property({
            tooltip: '勾选后,会批量激活 find list 中填写的组件',
            visible: function () { return this.actionType === ACTION_MODE.ENABLE_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "enableTrigger", null);
    __decorate([
        property({
            tooltip: '勾选后,会批量关闭 find list 中填写的组件',
            visible: function () { return this.actionType === ACTION_MODE.ENABLE_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "disableTrigger", null);
    __decorate([
        property({
            tooltip: '允许删除节点的组件,确定需要移除请勾选,防止误操作',
            visible: function () { return this.actionType === ACTION_MODE.DELETE_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "allowDelete", void 0);
    __decorate([
        property({
            tooltip: '勾选后,会批量删除 find list 中填写的组件',
            displayName: '[ X DELETE X ]',
            visible: function () { return this.allowDelete && this.actionType === ACTION_MODE.DELETE_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "deleteTrigger", null);
    __decorate([
        property({
            tooltip: '勾选后,会批量替换掉指定的路径',
            visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH; }
        })
    ], MVCompsEdit.prototype, "replaceTrigger", null);
    __decorate([
        property({
            tooltip: '匹配的路径,匹配规则: 搜索开头为 game的路径',
            visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH; }
        })
    ], MVCompsEdit.prototype, "targetPath", void 0);
    __decorate([
        property({
            tooltip: '替换的路径,将匹配到的路径替换',
            visible: function () { return this.actionType === ACTION_MODE.REPLACE_WATCH_PATH; }
        })
    ], MVCompsEdit.prototype, "replacePath", void 0);
    __decorate([
        property({
            tooltip: '是否搜集绑定VM组件的节点?',
            visible: function () { return this.actionType === ACTION_MODE.SEARCH_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "canCollectNodes", void 0);
    __decorate([
        property({
            type: [cc.Node],
            readonly: true,
            tooltip: '收集到绑定了VM组件相关的节点，可以自己跳转过去',
            visible: function () { return this.canCollectNodes && this.actionType === ACTION_MODE.SEARCH_COMPONENT; }
        })
    ], MVCompsEdit.prototype, "collectNodes", void 0);
    MVCompsEdit = __decorate([
        ccclass,
        executeInEditMode,
        menu('ModelViewer/Edit-Comps (快速组件操作)'),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMCompsEdit.md')
    ], MVCompsEdit);
    return MVCompsEdit;
}(cc.Component));
exports.default = MVCompsEdit;
