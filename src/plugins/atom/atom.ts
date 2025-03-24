import { useSyncExternalStore } from 'react'

/**
 * 仿jotai的轻量级全局状态管理库
 */
class Atom<T> {
  private value!: T
  private listeners: Set<() => void> = new Set()
  private atoms: Set<Atom<any>> = new Set()
  private combine: Function|undefined
  constructor(initValue: T) {
    if(typeof initValue === 'function') {
      this.combine = initValue
      this.getCombineValue()
    }else{
      this.value = initValue
    }
  }
  getCombineValue = async () => {
    const value = await this.combine!(<D>(atom:Atom<D>) => {{
      this.atoms.add(atom)
      return atom.get()
    }})
    this.set(value)
  }
  get = (): T => {
    return this.value
  }
  set = (value: T) => {
    this.value = value
    this.listeners.forEach(cb => cb())
  }
  subscribe = (cb: () => void) => {
    if(this.combine instanceof Function){
      const ubsubs:(()=> void)[] = []
      this.getCombineValue()
      this.atoms.forEach(atom => ubsubs.push(atom.subscribe(this.getCombineValue)))
      this.listeners.add(cb)
      ubsubs.push(() => this.listeners.delete(cb))
      return () => ubsubs.forEach(ubsub => ubsub())
    }
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
}

/**
 * 创建一个atom
 * @param initValue 
 ** initValue 为函数时，提供一个get方法，用于获取其他atom的state，initValue的返回值为atom的state，
 这个函数会在组件挂载和依赖的atom变更时执行
 ** initValue 不为函数时，以initValue为atom的state
 * @returns atom
 */
export function atom<T>(initValue: (get: <D>(atom: Atom<D>) => D) => T): Atom<T>;
export function atom<T>(initValue: T): Atom<T>;
export function atom<T>(initValue: T){
  return new Atom(initValue)
}

/**
 * 用于获取atom的state和setState方法
 * @param atom atom方法创建的实例
 */
export function useAtom<T>(atom: Atom<T>){
  const state = useSyncExternalStore(
    atom.subscribe,
    atom.get
  )
  return [state, atom.set] as const
}