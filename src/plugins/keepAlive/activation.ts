import { Context, ReactNode } from 'react'

export interface Bridge<T=any> {
  context: Context<T>,
  value: T
}

export default class Activation {
  name: string
  /**组件的dom */
  dom: HTMLDivElement|null = null
  /**组件是否激活 */
  active: boolean = false
  /**组件的props */
  props: Record<string, any> = {}
  /**桥接的bridges列表 */
  bridges: Bridge[] = []
  /**这个组件实际的容器 */
  wrapper: HTMLDivElement|null = null
  /**滚动位置缓存 */
  scroll: Map<HTMLElement, { x: number, y: number }> = new Map()
  /**当前组件的children */
  children: ReactNode|null = null
  /**当前组件变更监听 */
  listeners: Set<() => void> = new Set()
  /**激活监听器列表 */
  activateListeners: Set<() => void> = new Set()
  /**失活监听器列表 */
  unactivateListeners: Set<() => void> = new Set()
  constructor(name: string){
    this.name = name
    /**初始化时设置为true，则使useActivate只在激活时触发(首次页面加载时不触发) */
    this.active = true
  }
  /**添加变更监听器 */
  subscribe = (cb: () => void) => {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
  /**触发变更 */
  update = () => {
    this.listeners.forEach(fn => fn())
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