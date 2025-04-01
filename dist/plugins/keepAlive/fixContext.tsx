import React, { ProviderProps, useContext } from 'react'
import { ScopeContext, BridgeContext } from './context'

// const createReactContext = React.createContext
const originalCreateElement = React.createElement

// @ts-ignore
React.createElement = function(type, props, ...children) {
  if(typeof type === 'object' && type['$$typeof'] === Symbol.for('react.context')){
    const OriginalProvider = type.Provider
    /**
     * 劫持Provider组件，给AliveScope组件内部的Provider包裹一层BridgeContext.Provider
     * 用于逐级记录并传递keepAlive组件父级的context，然后在keepAlive组件重建上下文
     * 以此修复keepAlive组件导致的context丢失问题
     * */
    const Provider = ({ value, ...props }:ProviderProps<any>) => {
      const scope = useContext(ScopeContext)
      const bridgeCtxs = useContext(BridgeContext)
      if(!scope) return <OriginalProvider value={value} {...props} />
      return <BridgeContext.Provider value={[...bridgeCtxs, { context: type, value }]}>
        <OriginalProvider value={value} {...props} />
      </BridgeContext.Provider>
    }
    Provider['$$typeof'] = Symbol.for('react.context')
    type.Provider = Provider
  }
  return originalCreateElement(
    type,
    props,
    ...children
  )
}

// React.createContext = function<T>(value:T){
//   const context = createReactContext(value)
//   const OriginalProvider = context.Provider
//   /**
//    * 劫持Provider组件，给AliveScope组件内部的Provider包裹一层BridgeContext.Provider
//    * 用于逐级记录并传递keepAlive组件父级的context，然后在keepAlive组件重建上下文
//    * 以此修复keepAlive组件导致的context丢失问题
//    * */
//   const Provider = ({ value, ...props }:ProviderProps<T>) => {
//     const scope = useContext(ScopeContext)
//     const bridgeCtxs = useContext(BridgeContext)
//     if(!scope) return <OriginalProvider value={value} {...props} />
//     return <BridgeContext.Provider value={[...bridgeCtxs, { context, value }]}>
//       <OriginalProvider value={value} {...props} />
//     </BridgeContext.Provider>
//   }
//   Provider['$$typeof'] = Symbol.for('react.context')
//   context.Provider = Provider
//   return context
// }