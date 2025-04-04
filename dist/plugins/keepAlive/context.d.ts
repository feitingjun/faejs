import { Context } from 'react';
import { Activation } from './keepAlive';
/**用于记录并向下级传递父级context的桥接context */
export declare const BridgeContext: Context<{
    context: Context<any>;
    value: any;
}[]>;
/**用来记录Scope缓存数据的context */
export declare const ScopeContext: Context<{
    /**根据name获取Activation */
    getActivation: (name: string) => Activation | undefined;
    /**设置Activation */
    setActivation: (activation: Activation) => void;
    /**销毁Activation */
    destroy: (name: string | string[]) => void;
    /**销毁所有Activation */
    destroyAll: () => void;
    /**所有已缓存节点 */
    cachingNodes: Activation[];
} | null>;
/**KeepAlive的context，用来给响应自己的激活/失活hooks */
export declare const KeepAliveContext: Context<{
    addListener: (fn: () => void) => () => void;
    addDeactivateListener: (fn: () => void) => () => void;
}>;
/**获取操作缓存的api */
export declare const useAliveController: () => {
    destroy: (name: string | string[]) => void;
    destroyAll: () => void;
    cachingNodes: Activation[];
};
/**激活时执行的hooks */
export declare const useActivate: (fn: () => void) => void;
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export declare const useUnactivate: (fn: () => void) => void;
