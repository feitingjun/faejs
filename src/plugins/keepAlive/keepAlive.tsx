import { useRef, ReactNode, useContext, Context, ReactElement, cloneElement, useLayoutEffect } from 'react'
import { ScopeContext } from './context'
import { getFixedContext } from './fixContext'
import Activation, { Bridge } from './activation'

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
  
  useLayoutEffect(() => {
    let active = getActivation(name)
    if(!active) {
      active = new Activation(name)
      addActivation(active)
    }
    return () => {
      active.active = false
      active.saveScroll(active.dom)
      active.update()
    }
  }, [])

  useLayoutEffect(() => {
    let active = getActivation(name)!
    active.props = args
    active.bridges = bridges
    active.children = children
    active.wrapper = wrapperRef.current
    // 能进这里说明当前组件必定是激活状态(不是不会加载当前组件)
    if(!active.active) active.active = true
    active.update()
  }, [props])

  return <div className='ka-wrapper' ref={wrapperRef} />
}

// 获取上级context的value，然后传递给缓存组件的桥接器
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
  // 按顺序获取上级的context及其value，然后传递给缓存组件
  return getFixedContext(name)!.reduce((prev, ctx) => {
    return <Bridge bridges={prev.props.bridges} ctx={ctx}>{prev}</Bridge> 
  }, <Wrapper bridges={[]} name={name} {...props}>{children}</Wrapper>)
}