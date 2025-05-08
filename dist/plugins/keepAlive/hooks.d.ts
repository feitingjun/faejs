export declare const useActivation: (name: string) => import("./activation").default;
/**获取操作缓存的api */
export declare const useAliveController: () => {
    destroy: (name: string | string[]) => void;
    destroyAll: () => void;
    cachingNodes: import("./activation").default[];
};
/**激活时执行的hooks */
export declare const useActivate: (fn: () => void) => void;
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export declare const useUnactivate: (fn: () => void) => void;
