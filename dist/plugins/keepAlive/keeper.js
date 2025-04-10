import { jsx as _jsx } from "react/jsx-runtime";
import { KeepAliveContext } from "./context.js";
export default function Keeper({ activation: at }) {
    /**
     * 第一层一层div是为了让组件在卸载后能正确的销毁，不然会报错
     * 第二次div是为了防止children的根节点不是实际的dom，不能正确的操作dom
     */
    const div = (_jsx("div", { "data-ka": at.name, children: _jsx("div", { className: 'ka-alive', ref: dom => {
                dom ? at.wrapper?.appendChild(dom) : at.dom?.remove();
                at.dom = dom;
            }, children: at.children }) }));
    // 重建桥接的context
    const providers = at.bridges.reduce((acc, b) => {
        const Provider = b.context.Provider;
        return _jsx(Provider, { value: b.value, children: acc });
    }, div);
    // 为子组件提供激活/失活监听hooks的content
    return _jsx(KeepAliveContext.Provider, { value: {
            addListener: fn => {
                at.activateListeners.add(fn);
                return () => at.activateListeners.delete(fn);
            },
            addDeactivateListener(fn) {
                at.unactivateListeners.add(fn);
                return () => at.unactivateListeners.delete(fn);
            },
        }, children: providers });
}
//# sourceMappingURL=keeper.js.map