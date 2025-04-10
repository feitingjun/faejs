import { useRef, ReactNode, useContext, useEffect, Context, ReactElement, cloneElement, useLayoutEffect } from 'react'
import { ScopeContext, useActivate, useUnactivate } from './context'
import { getFixedContext } from './fixContext'

interface Bridge<T=any> {
  context: Context<T>,
  value: T
}

export class Activation {
  name: string
  /**组件的dom */
  dom: HTMLDivElement|null = null
  /**组件是否激活 */
  active: boolean = false
  /**组件的props */
  props: Record<string, any> = {}
  /**桥接的bridges列表 */
  bridges: { context: Context<any>, value: any }[] = []
  /**这个组件实际的容器 */
  wrapper: HTMLDivElement|null = null
  /**滚动位置缓存 */
  scroll: Map<HTMLElement, { x: number, y: number }> = new Map()
  /**当前组件的children */
  children: ReactNode|null = null
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
      setTimeout(() => {
        this.restoreScroll(this.dom)
        this.scroll.clear()
      }, 10);
      this.activateListeners.forEach(fn => fn())
    }else{
      this.unactivateListeners.forEach(fn => fn())
    }
  }
  /**更新组件 */
  update = (
    bridge: { context: Context<any>, value: any }[],
    children: ReactNode,
    wrapper: HTMLDivElement|null
  ) => {
    this.children = children
    this.wrapper = wrapper
    this.bridges = bridge
  }
  /**保存滚动位置 */
  saveScroll = (ele: HTMLElement|null) => {
    if(!ele) return
    this.scroll.set(ele, {
      x: ele.scrollLeft,
      y: ele.scrollTop
    })
    if(ele.childNodes.length  > 0){
      ele.childNodes.forEach(child => {
        if(child instanceof HTMLElement){
          this.saveScroll(child)
        }
      })
    }
  }
  /**恢复滚动位置 */
  restoreScroll = (ele: HTMLElement|null) => {
    if(!ele) return
    const scroll = this.scroll.get(ele)
    if(scroll){
      ele.scrollTo(scroll.x, scroll.y)
    }
    if(ele.childNodes.length  > 0){
      ele.childNodes.forEach(child => {
        if(child instanceof HTMLElement){
          this.restoreScroll(child)
        }
      })
    }
  }
}

function Wrapper({
  name,
  children,
  bridges,
  ...props
}: {
  name: string
  children: ReactNode
  bridges: Bridge[]
  [prop: string]: any
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scope = useContext(ScopeContext)
  if(!scope) return children
  const { getActivation, setActivation } = scope
  useEffect(() => {
    let activation = getActivation(name) || new Activation(name)
    activation.props = props
    activation.update(bridges, children, wrapperRef.current)
    setActivation(activation)
    if(!activation.active) activation.toggle(true)
  }, bridges.map(v => v.value))
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
  // 在组件卸载前保存滚动位置
  useLayoutEffect(() => {
    return () => {
      const activation = getActivation(name)
      if(!activation) return
      activation.saveScroll(activation.dom)
    }
  }, [])
  /**如果存在父级keepAlive，因为父级被缓存，会导致当前的useEffect不会触发，
   * 所以使用useActivate和useUnactivate触发当前keepAlive的状态变更
   * */
  useActivate(() => {
    const activation = getActivation(name)
    if(!activation) return
    activation.toggle(true)
  })
  useUnactivate(() => {
    const activation = getActivation(name)
    if(!activation) return
    activation.toggle(false)
  })
  return <div className='ka-wrapper' ref={wrapperRef} />
}

const Bridge = ({children, bridges, ctx}:{children: ReactElement<{bridges:Bridge[]}>, bridges: Bridge[], ctx: Context<any>}) => {
  const value = useContext(ctx)
  return cloneElement(children, { bridges: [{ context: ctx, value }, ...bridges] })
}

export default function KeepAlive({
  name,
  children,
  ...props
}:{
  name: string
  children: ReactNode
  [prop: string]: any
}){
  const scope = useContext(ScopeContext)
  if(!scope) return children
  return getFixedContext(name)!.reduce((prev, ctx) => {
    return <Bridge bridges={prev.props.bridges} ctx={ctx}>{prev}</Bridge> 
  }, <Wrapper bridges={[]} name={name} {...props}>{children}</Wrapper>)
}