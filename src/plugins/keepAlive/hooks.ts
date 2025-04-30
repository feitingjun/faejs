import { useLayoutEffect, useState, useContext } from 'react'
import { ScopeContext } from './context'
import { KeepAliveContext } from './context'

export const useActive = (name: string) => {
  /**
   * 为了在Active变更时触发组件更新
   * 不能使用useSyncExternalStore，因为只是Active的属性变更，而不是Active的引用变更，
   * useSyncExternalStore在获取的值不变时不会触发更新
   */
  const [_, setCount] = useState(0)
  const { getActivation } = useContext(ScopeContext)!
  useLayoutEffect(() => {
    const unsubscribe = getActivation(name)!.subscribe(() => {
      setCount(c => c + 1)
    })
    return () => { unsubscribe() }
  }, [name])
  return getActivation(name)!
}

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