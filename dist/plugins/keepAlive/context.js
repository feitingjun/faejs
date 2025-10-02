import { createContext } from 'react';
/**用于记录并向下级传递父级context的桥接context */
export const BridgeContext = createContext([]);
/**用来记录Scope缓存数据的context */
export const ScopeContext = createContext(null);
/**KeepAlive的context，用来给响应自己的激活/失活hooks */
export const KeepAliveContext = createContext(null);
