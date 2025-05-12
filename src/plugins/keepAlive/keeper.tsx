import { memo, useMemo } from 'react'
import { KeepAliveContext } from './context'
import { useGetActivation, useLoadedEffect } from './hooks'

export default memo(({
  name
}: {
  name:string
}) => {
  // 获取最新的Activation实例
  const at = useGetActivation(name)
  useLoadedEffect(() => {
    if(at.active){
      at.activateHooks.forEach(fn => fn())
      at.restoreScroll(at.dom)
    }else{
      at.unactivateHooks.forEach(fn => fn())
    }
  }, [at.active])

  /**
   * 路由变更时，因为bridges内有路由相关的context会导致组件重新渲染
   * 这种情况不能重新创建div，会因为时机问题导致无法正确的获取at.dom的滚动条位置
   */
  const div = useMemo(() => { /**
    * 第一层一层div是为了让组件在卸载后能正确的销毁，不然会报错
    * 第二次div是为了防止children的根节点不是实际的dom，不能正确的操作dom
    */
    return (
      <div data-ka={at.name}>
        <div className='ka-alive' ref={dom => {
          dom ? at.wrapper?.appendChild(dom) : at.dom?.remove()
          at.dom = dom
        }}>{at.children}</div>
      </div>
    )
  }, [at.active, at.children])

  // 重建桥接的context
  const providers = at.bridges.reduce((acc, b) => {
    const Provider = b.context.Provider
    return <Provider value={b.value}>{acc}</Provider>
  }, div)

  // 为子组件提供激活/失活监听hooks的context
  return <KeepAliveContext.Provider value={{
    addActiveListeners: fn => {
      at.activeListeners.add(fn)
      return () => at.activeListeners.delete(fn)
    },
    addActivateHooks: fn => {
      at.activateHooks.add(fn)
      return () => at.activateHooks.delete(fn)
    },
    addUnactivateHooks(fn) {
      at.unactivateHooks.add(fn)
      return () => at.unactivateHooks.delete(fn)
    },
  }}>{providers}</KeepAliveContext.Provider>
})