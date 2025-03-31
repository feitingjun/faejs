import { createContext, Context, useContext, useLayoutEffect } from 'react'
import { Activation } from './keepAlive'

/**用于记录并向下级传递父级context的桥接context */
export const BridgeContext = createContext<{
  context: Context<any>,
  value: any
}[]>([])

/**用来记录Scope缓存数据的context */
export const ScopeContext = createContext<{
  /**根据name获取Activation */
  getActivation: (name:string) => Activation|undefined,
  /**设置Activation */
  setActivation: (activation:Activation) => void,
  /**销毁Activation */
  destroy: (name:string|string[]) => void,
  /**销毁所有Activation */
  destroyAll: () => void,
  /**所有已缓存节点 */
  cachingNodes: Activation[]
}|null>(null)

/**KeepAlive的context，用来给响应自己的激活/失活hooks */
export const KeepAliveContext = createContext<{
  addListener: (fn:()=>void) => () => void,
  addDeactivateListener: (fn:()=>void) => () => void
}>({
  addListener: () => () => {},
  addDeactivateListener: () => () => {}
})

/**获取操作缓存的api */
export const useAliveController = () => {
  const ctx = useContext(ScopeContext)
  if(!ctx) return {
    destroy: () => {},
    destroyAll: () => {},
    cachingNodes: []
  }
  const { destroy, destroyAll, cachingNodes } = ctx
  return { destroy, destroyAll, cachingNodes }
}

/**激活时执行的hooks */
export const useActivate = (fn:()=>void) => {
  const { addListener } = useContext(KeepAliveContext)
  useLayoutEffect(() => {
    const removeListener = addListener(fn)
    return () => removeListener()
  }, [fn])
}
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export const useUnactivate = (fn:()=>void) => {
  const { addDeactivateListener } = useContext(KeepAliveContext)
  useLayoutEffect(() => {
    const removeListener = addDeactivateListener(fn)
    return () => removeListener()
  }, [fn])
}