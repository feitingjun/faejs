import { useLayoutEffect, useState, useContext, useRef, useEffect } from 'react'
import { ScopeContext } from './context'
import { KeepAliveContext } from './context'

type NoParamsFn = () => void

export function useGetActivation(name: string){
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
export function useAliveController(){
  const ctx = useContext(ScopeContext)
  if(!ctx) return {
    destroy: () => {},
    destroyAll: () => {},
    cachingNodes: []
  }
  const { destroy, destroyAll, getCachingNodes } = ctx
  return { destroy, destroyAll, getCachingNodes }
}

/**激活时执行的hooks */
export function useActivate(fn:NoParamsFn){
  const at = useContext(KeepAliveContext)
  if(!at) return
  useLayoutEffect(() => {
    const removeListener = at.addActivateHooks(fn)
    return () => removeListener()
  }, [fn])
}
/**失活时执行的hooks(缓存完全卸载时不触发)
 * 缓存完全卸载时没有办法触发，因为如果卸载时处于失活状态时，没办法触发KeepAlive组件的useEffect
 */
export function useUnactivate(fn:NoParamsFn){
  const at = useContext(KeepAliveContext)
  if(!at) return
  useLayoutEffect(() => {
    const removeListener = at.addUnactivateHooks(fn)
    return () => removeListener()
  }, [fn])
}

export function useLoadedEffect(fn:NoParamsFn, deps:any[]){
  const loaded = useRef(false)
  useEffect(() => {
    if(loaded.current) {
      return fn()
    }else {
      loaded.current = true
    }
  }, deps)
}

export function useLoadedLayoutEffect(fn:NoParamsFn, deps:any[]){
  const loaded = useRef(false)
  useLayoutEffect(() => {
    if(loaded.current) {
      return fn()
    }else {
      loaded.current = true
    }
  }, deps)
}