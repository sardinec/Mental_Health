export function Tween_ExitUI(self, tweenNode, callback) {
    cc.tween(tweenNode)
        .to(0.2, { opacity: 0, scale: 0.9 }, { easing: "sineIn" })
        // 当前面的动作都执行完毕后才会调用这个回调函数
        .call(() => {
            callback(self);
        })
        .start(tweenNode)


}