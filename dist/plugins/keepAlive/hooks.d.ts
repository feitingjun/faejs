type NoParamsFn = () => void;
export declare function useActivation(name: string): import("./activation").default;
/**获取操作缓存的api */
export declare function useAliveController(): {
    destroy: (name: string | string[]) => void;
    destroyAll: () => void;
    cachingNodes: {
        name: string;
        active: boolean;
        props: {
            [key: string]: any;
        };
    }[];
};
/**激活时执行的hooks */
export declare function useActivate(fn: NoParamsFn): void;
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export declare function useUnactivate(fn: NoParamsFn): void;
export declare function useLoadedEffect(fn: NoParamsFn, deps: any[]): void;
export declare function useLoadedLayoutEffect(fn: NoParamsFn, deps: any[]): void;
export {};
