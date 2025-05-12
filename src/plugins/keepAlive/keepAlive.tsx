import {
  useRef,
  ReactNode,
  useContext,
  Context,
  ReactElement,
  cloneElement,
  useLayoutEffect,
  useMemo
} from 'react'
import { ScopeContext, KeepAliveContext } from './context'
import { getFixedContext } from './fixContext'
import Activation, { Bridge } from './activation'
import { useLoadedLayoutEffect } from './hooks'

function Wrapper(props: {
  name: string
  children: ReactNode
  bridges: Bridge[]
  [prop: string]: any
}) {
  const { name, children, bridges, ...args } = props
  const wrapperRef = useRef<HTMLDivElement>(null)
  const scope = useContext(ScopeContext)
  if(!scope) return children
  const { addActivation, getActivation } = scope
  // 获取父keep-alive的状态
  const pctx = useContext(KeepAliveContext)
  const { addActiveListeners } = pctx || {}
  
  // 激活时执行函数
  const handleActivate = () => {
    let at = getActivation(name)
    if(!at) {
      at = new Activation(name)
      at.props = args
      at.bridges = bridges
      at.children = children
      addActivation(at)
    }
    at.wrapper = wrapperRef.current
    at.active = true
    at.update()
  }
  // 失活时执行函数
  const handleUnactivate = () => {
    let at = getActivation(name)
    if(!at) return
    at.active = false
    at.saveScroll(at.dom)
    at.update()
  }

  useLayoutEffect(() => {
    handleActivate()
    return () => {
      // 存在父级交给addUpdateListener触发执行
      !pctx && handleUnactivate()
    }
  }, [])
  /**
   * 存在父keep-alive时，子级keep-alive会被缓存导致useLayoutEffect不触发
   * 所以需要使用addUpdateListener监听父级的状态变更
   * 并且需要依赖props以获取最新的bridges、children等
   */
  useLayoutEffect(() => {
    const removeListener = addActiveListeners?.((active) => {
      active ? handleActivate(): handleUnactivate()
    })
    return () => removeListener?.()
  }, [props])

  // props变化时，更新缓存组件的props(避免创建时执行多次update，所以使用useLoadedLayoutEffect)
  useLoadedLayoutEffect(() => {
    let at = getActivation(name)
    if(!at) return
    at.props = args
    at.bridges = bridges
    at.children = children
    at.update()
  }, [props])

  return <div className='ka-wrapper' ref={wrapperRef} />
}

// 获取上级context的value，然后传递给缓存组件的桥接器
const Bridge = ({children, bridges, ctx}:{children: ReactElement<{bridges:Bridge[]}>, bridges: Bridge[], ctx: Context<any>}) => {
  const value = useContext(ctx)
  return cloneElement(children, { bridges: [{ context: ctx, value }, ...bridges] })
}

export default function KeepAlive(props:{
  name: string
  children: ReactNode
  [prop: string]: any
}){
  const { name, children, ...args } = props
  const scope = useContext(ScopeContext)
  if(!scope) return children
  // 按顺序获取上级的context及其value，然后传递给缓存组件
  return useMemo(() => (
    getFixedContext(name)!.reduce((prev, ctx) => {
      return <Bridge bridges={prev.props.bridges} ctx={ctx}>{prev}</Bridge> 
    }, <Wrapper bridges={[]} name={name} {...args}>{children}</Wrapper>)
  ), [props])
}