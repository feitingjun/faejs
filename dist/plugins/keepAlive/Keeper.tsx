import { Activation } from './keepAlive'
import { KeepAliveContext } from './context'

export default function Keeper ({
  activation: at
}: {
  activation: Activation
}) {
  // 多加一层div是为了让组件在卸载后能正确的销毁，不然会报错
  const div = (
    <div data-ka={at.name}>
      <div className={'ka-alive'} ref={dom => {
        dom ? at.wrapper?.appendChild(dom) : at.dom?.remove()
        at.dom = dom
      }}>{at.children}</div>
    </div>
  )

  // 重建桥接的context
  const providers= at.bridges.reduce((acc, b) => {
    const Provider = b.context.Provider
    return <Provider value={b.value}>{acc}</Provider>
  }, div)

  // 为子组件提供激活/失活监听hooks的content
  return <KeepAliveContext.Provider value={{
    addListener: fn => {
      at.activateListeners.add(fn)
      return () => at.activateListeners.delete(fn)
    },
    addDeactivateListener(fn) {
      at.unactivateListeners.add(fn)
      return () => at.unactivateListeners.delete(fn)
    },
  }}>{providers}</KeepAliveContext.Provider>
}