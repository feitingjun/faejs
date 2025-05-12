import { jsx as _jsx } from "react/jsx-runtime";
import { memo, useMemo } from 'react';
import { KeepAliveContext } from "./context.js";
import { useGetActivation, useLoadedEffect } from "./hooks.js";
export default memo(({ name }) => {
    // 获取最新的Activation实例
    const at = useGetActivation(name);
    useLoadedEffect(() => {
        if (at.active) {
            at.activateHooks.forEach(fn => fn());
            at.restoreScroll(at.dom);
        }
        else {
            at.unactivateHooks.forEach(fn => fn());
        }
    }, [at.active]);
    /**
     * 路由变更时，因为bridges内有路由相关的context会导致组件重新渲染
     * 这种情况不能重新创建div，会因为时机问题导致无法正确的获取at.dom的滚动条位置
     */
    const div = useMemo(() => {
        return (_jsx("div", { "data-ka": at.name, children: _jsx("div", { className: 'ka-alive', ref: dom => {
                    dom ? at.wrapper?.appendChild(dom) : at.dom?.remove();
                    at.dom = dom;
                }, children: at.children }) }));
    }, [at.active, at.children]);
    // 重建桥接的context
    const providers = at.bridges.reduce((acc, b) => {
        const Provider = b.context.Provider;
        return _jsx(Provider, { value: b.value, children: acc });
    }, div);
    // 为子组件提供激活/失活监听hooks的context
    return _jsx(KeepAliveContext.Provider, { value: {
            addActiveListeners: fn => {
                at.activeListeners.add(fn);
                return () => at.activeListeners.delete(fn);
            },
            addActivateHooks: fn => {
                at.activateHooks.add(fn);
                return () => at.activateHooks.delete(fn);
            },
            addUnactivateHooks(fn) {
                at.unactivateHooks.add(fn);
                return () => at.unactivateHooks.delete(fn);
            },
        }, children: providers });
});
//# sourceMappingURL=keeper.js.map