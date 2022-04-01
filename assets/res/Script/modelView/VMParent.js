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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, help = _a.help, executionOrder = _a.executionOrder;
/**
 * 提供VM环境，控制旗下所有VM节点
 * 一般用于 非全局的 VM绑定,VM 环境与 组件紧密相连
 * （Prefab 模式绑定）
 * VMParent 必须必其他组件优先执行
 * v0.1 修复bug ，现在可以支持 Parent 嵌套 （但是注意性能问题，不要频繁嵌套）
 */
var VMParent = /** @class */ (function (_super) {
    __extends(VMParent, _super);
    function VMParent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**绑定的标签，可以通过这个tag 获取 当前的 vm 实例 */
        _this.tag = '_temp';
        /**需要绑定的私有数据 */
        _this.data = {};
        /**VM 管理 */
        _this.VM = ViewModel_1.VM;
        return _this;
        // update (dt) {}
    }
    /**
     * [注意]不能直接覆盖此方法，如果需要覆盖。
     * 只能在该方法内部调用父类的实现
    ```ts
        onLoad(){
            super.onLoad();
        }
    ```
     *
     */
    VMParent.prototype.onLoad = function () {
        if (this.data == null)
            return;
        this.tag = '_temp' + '<' + this.node.uuid.replace('.', '') + '>';
        ViewModel_1.VM.add(this.data, this.tag);
        //cc.log(VM['_mvs'],tag)
        //搜寻所有节点：找到 watch path
        var comps = this.getVMComponents();
        //console.group();
        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            this.replaceVMPath(comp, this.tag);
        }
        //console.groupEnd()
        this.onBind();
    };
    /**在 onLoad 完成 和 start() 之前调用，你可以在这里进行初始化数据等操作 */
    VMParent.prototype.onBind = function () {
    };
    /**在 onDestroy() 后调用,此时仍然可以获取绑定的 data 数据*/
    VMParent.prototype.onUnBind = function () {
    };
    VMParent.prototype.replaceVMPath = function (comp, tag) {
        var path = comp['watchPath'];
        //let comp_name: string = comp.name;
        if (comp['templateMode'] == true) {
            var pathArr = comp['watchPathArr'];
            if (pathArr) {
                for (var i = 0; i < pathArr.length; i++) {
                    var path_1 = pathArr[i];
                    pathArr[i] = path_1.replace('*', tag);
                }
            }
        }
        else {
            //VMLabel
            //遇到特殊 path 就优先替换路径
            if (path.split('.')[0] === '*') {
                comp['watchPath'] = path.replace('*', tag);
            }
        }
    };
    /**未优化的遍历节点，获取VM 组件 */
    VMParent.prototype.getVMComponents = function () {
        var _this = this;
        var comps = this.node.getComponentsInChildren('VMBase');
        var parents = this.node.getComponentsInChildren('VMParent').filter(function (v) { return v.uuid !== _this.uuid; }); //过滤掉自己
        //过滤掉不能赋值的parent
        var filters = [];
        parents.forEach(function (node) {
            filters = filters.concat(node.getComponentsInChildren('VMBase'));
        });
        comps = comps.filter(function (v) { return filters.indexOf(v) < 0; });
        return comps;
    };
    /**
     * [注意]不能覆盖此方法，如果需要覆盖。
     * 需要在该方法内部调用父类的实现，再定义自己的方法
      ```ts
        onDestroy(){
            super.onDestroy();
        }
      ```
     */
    VMParent.prototype.onDestroy = function () {
        this.onUnBind();
        //解除全部引用
        ViewModel_1.VM.remove(this.tag);
        this.data = null;
    };
    VMParent = __decorate([
        ccclass,
        executionOrder(-1),
        help('https://github.com/wsssheep/cocos_creator_mvvm_tools/blob/master/docs/VMParent.md')
    ], VMParent);
    return VMParent;
}(cc.Component));
exports.default = VMParent;
