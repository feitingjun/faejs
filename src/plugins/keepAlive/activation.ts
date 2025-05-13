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
  private _active: boolean = false
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
  listeners: Set<(at:Activation) => void> = new Set()
  /**当前组件active状态变更监听 */
  activeListeners: Set<(active: boolean) => void> = new Set()
  /**子组件内的useActivate */
  activateHooks: Set<() => void> = new Set()
  /**子组件内的useUnactivate */
  unactivateHooks: Set<() => void> = new Set()
  constructor(name: string){
    this.name = name
  }
  get active(){
    return this._active
  }
  set active(active: boolean){
    if(active === this._active) return
    this.activeListeners.forEach(fn => fn(active))
    this._active = active
  }
  /**添加变更监听器 */
  subscribe = (cb: () => void) => {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
  /**触发变更 */
  update = () => {
    this.listeners.forEach(fn => fn(this))
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
        if(child instanceof HTMLElement && !child.classList.contains('ka-alive')){
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