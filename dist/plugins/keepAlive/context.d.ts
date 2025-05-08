import { Context } from 'react';
import Activation from './activation';
/**用于记录并向下级传递父级context的桥接context */
export declare const BridgeContext: Context<{
    context: Context<any>;
    value: any;
}[]>;
/**用来记录Scope缓存数据的context */
export declare const ScopeContext: Context<{
    /**设置Activation */
    addActivation: (at: Activation) => void;
    /**获取Activation */
    getActivation: (name: string) => Activation | undefined;
    /**销毁Activation */
    destroy: (name: string | string[]) => void;
    /**销毁所有Active */
    destroyAll: () => void;
    /**所有已缓存节点 */
    cachingNodes: Activation[];
} | null>;
/**KeepAlive的context，用来给响应自己的激活/失活hooks */
export declare const KeepAliveContext: Context<{
    addActiveListener: (fn: () => void) => () => void;
    addUnactiveListener: (fn: () => void) => () => void;
}>;
