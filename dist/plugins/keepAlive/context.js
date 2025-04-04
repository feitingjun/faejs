import { createContext, useContext, useLayoutEffect } from 'react';
/**用于记录并向下级传递父级context的桥接context */
export const BridgeContext = createContext([]);
/**用来记录Scope缓存数据的context */
export const ScopeContext = createContext(null);
/**KeepAlive的context，用来给响应自己的激活/失活hooks */
export const KeepAliveContext = createContext({
    addListener: () => () => { },
    addDeactivateListener: () => () => { }
});
/**获取操作缓存的api */
export const useAliveController = () => {
    const ctx = useContext(ScopeContext);
    if (!ctx)
        return {
            destroy: () => { },
            destroyAll: () => { },
            cachingNodes: []
        };
    const { destroy, destroyAll, cachingNodes } = ctx;
    return { destroy, destroyAll, cachingNodes };
};
/**激活时执行的hooks */
export const useActivate = (fn) => {
    const { addListener } = useContext(KeepAliveContext);
    useLayoutEffect(() => {
        const removeListener = addListener(fn);
        return () => removeListener();
    }, [fn]);
};
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export const useUnactivate = (fn) => {
    const { addDeactivateListener } = useContext(KeepAliveContext);
    useLayoutEffect(() => {
        const removeListener = addDeactivateListener(fn);
        return () => removeListener();
    }, [fn]);
};
//# sourceMappingURL=context.js.map