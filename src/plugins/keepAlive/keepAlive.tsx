import { useRef, ReactNode, useContext, useEffect, useLayoutEffect, Context } from 'react'
import { ScopeContext, BridgeContext, KeepAliveContext } from './context'

export class Activation {
  name: string
  /**组件实例 */
  instance: ReactNode
  /**组件dom */
  dom: HTMLElement | null = null
  /**组件是否激活 */
  active: boolean = false
  /**组件的props */
  props: Record<string, any> = {}
  /**激活监听器列表 */
  activateListeners: Set<() => void> = new Set()
  /**失活监听器列表 */
  unactivateListeners: Set<() => void> = new Set()
  constructor(name: string){
    this.name = name
    /**初始化时设置为true，则使useActivate只在激活时触发(首次页面加载时不触发) */
    this.active = true
  }
  /**切换激活状态 */
  toggle = (active: boolean) => {
    this.active = active
    if(active){
      this.activateListeners.forEach(fn => fn())
    }else{
      this.unactivateListeners.forEach(fn => fn())
    }
  }
  /**更新组件实例 */
  render = (
    bridge: { context: Context<any>, value: any }[],
    children:ReactNode,
    wrapper: HTMLDivElement|null
  ) => {
    // 加一层div用来获取实际的dom
    const div = <div ref={dom => {
      if(!dom) return
      this.dom = dom
      wrapper?.appendChild(dom)
      if(!this.active) this.toggle(true)
    }}>{children}</div>
    // 加一层Provider用来给子级触发自定义的hooks
    const providers = bridge.reduce((acc, { context, value }) => {
      const Provider = context.Provider
      return <Provider value={value}>{acc}</Provider>
    }, div)
    // 更新组件实例
    this.instance = <KeepAliveContext.Provider key={this.name} value={{
      addListener: (fn:() => void) => {
        this.activateListeners.add(fn)
        return () => this.activateListeners.delete(fn)
      },
      addDeactivateListener: (fn:() => void) => {
        this.unactivateListeners.add(fn)
        return () => this.unactivateListeners.delete(fn)
      },
    }}>{providers}</KeepAliveContext.Provider>
    
  }
}

export default function KeepAlive({
  name,
  children,
  ...props
}: {
  name: string,
  children: ReactNode
}) {
  const keepRef = useRef<HTMLDivElement>(null)
  const scope = useContext(ScopeContext)
  const bridge = useContext(BridgeContext)
  if(!scope) return children
  const { getActivation, setActivation } = scope
  useEffect(() => {
    let activation = getActivation(name) || new Activation(name)
    activation.props = props
    activation.render(bridge, children, keepRef.current)
    setActivation(activation)
  }, bridge.map(v => v.value))
  /**
   * 不能使用useLayoutEffect
   * 由于完全卸载缓存时，当前组件useLayoutEffect的return函数会在useUnactivate内useLayoutEffect的return函数之前执行，
   * 此时失活监听函数还没有注销，若此时组件处于活动状态，会导致useUnactivate注册的函数执行，
   * 而若函数处于失活状态，因为此KeepAlive组件没有加载，无论如何useUnactivate注册的函数都不会执行，
   * 会导致useUnactivate的表现不一致，所以使用useEffect，让其都不执行(useEffect的return函数执行时，useUnactivate内useLayoutEffect的return函数已经删除注册的监听函数了)
   */
  useEffect(() => {
    return () => {
      const activation = getActivation(name)
      if(!activation) return
      activation.toggle(false)
    }
  }, [])
  return <div className='keep-alive' ref={keepRef} />
}