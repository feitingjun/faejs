import { useSyncExternalStore, use } from 'react'

type GetAtom = <T>(atom:Atom<T>) => T
type SetAtom = <T>(atom:Atom<T>, value:T|((oldV:T) => T)) => void
type GetCombine<T> = (get: GetAtom) => T | Promise<T>
type SetCombine<T> = (value: T, get: GetAtom, set: SetAtom) => void

/**根据传入的atom获取值 */
const getAtom:GetAtom = atom => atom.get()
/**根据传入的atom设置值 */
const setAtom:SetAtom = (atom, value) => atom.onlySet(value)

/** 仿 jotai 的轻量级全局状态管理库 */
class BaseAtom<T> {
  /** 原子的状态 */
  protected state!: T
  /** 订阅者列表 */
  protected listeners: Set<() => void> = new Set()
  /**当前atom的自定义set函数，如果存在setCombine方法，state的变更由用户完全接管 */
  protected setCombine: SetCombine<T> | undefined
  
  constructor(_: T|GetCombine<T>, setCombine?: SetCombine<T>) {
    this.setCombine = setCombine
  }
  get = (): T => {
    return this.state
  }
  // 仅更新state值，不触发setCombine(在setCombine内部使用，避免死循环)
  onlySet = (value: T | ((oldV: T) => T)) => {
    const newV = typeof value === 'function'? (value as (oldV:T) => T)(this.state) : value
    this.state = newV
    this.listeners.forEach(cb => cb())
  }
  // 更新state值，触发setCombine
  set = (value: T | ((oldV: T) => T)) => {
    const newV = typeof value === 'function'? (value as (oldV:T) => T)(this.state) : value
    if(this.setCombine){
      this.setCombine(newV, getAtom, setAtom)
      return
    }
    this.state = newV
    this.listeners.forEach(cb => cb())
  }
  subscribe = (cb: () => void) => {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
}

/**基本atom */
class Atom<T> extends BaseAtom<T> {
  constructor(initValue: T, setCombine?: SetCombine<T>) {
    super(initValue, setCombine)
    this.state = initValue
  }
}

/**组合atom */
class CombineAtom<T> extends BaseAtom<T> {
  /** 依赖atom列表，任意一个atom变更，都会触发getCombine方法 */
  private atoms: Set<Atom<any>> = new Set()
  /**当前atom的自定义get函数，通常用来从其他一个或多个atom获取组合数据，如果存在此方法，此atom的state不能手动变更 */
  private getCombine: GetCombine<T>
  /**初始异步加载数据的promise(供react的use方法使用，以此使组件在数据为加载完成时等待) */
  promise: Promise<void>
  
  constructor(initValue: GetCombine<T>, setCombine?: SetCombine<T>) {
    super(initValue, setCombine)
    this.getCombine = initValue
    this.promise = this.getCombineValue(true)
  }
  getCombineValue = async (first?:boolean) => {
    const combines = this.getCombine(<D>(atom:Atom<D>) => {{
      this.atoms.add(atom)
      return atom.get()
    }})
    if(first) this.atoms.forEach(atom => atom.subscribe(this.getCombineValue))
    const value = await combines
    this.onlySet(value)
  }
  set = (value: any | ((oldV: T) => any)) => {
    const newV = typeof value === 'function' ? (value as (oldV:T) => T)(this.state) : value
    if(this.setCombine) this.setCombine(newV, getAtom, setAtom)
  }
}

/**
 * 创建一个atom
 * @param initValue 
 ** initValue 为函数时，提供一个get方法，用于获取其他atom的state，initValue的返回值为atom的state，这个函数会在组件挂载和依赖的atom变更时执行
 ** initValue 不为函数时，以initValue为atom的state
 * @param setCombine 
 ** 当state变更时，会执行此方法，可在此方法内变更其他atom的state， 且当前atom的state需要在此函数内部手动接管
 * @returns atom
 */
export function atom<T>(initValue: GetCombine<T>, setCombine?: SetCombine<any>): CombineAtom<T>;
export function atom<T>(initValue: T, setCombine?: SetCombine<T>): Atom<T>;
export function atom<T>(initValue: T | GetCombine<T>, setCombine?: SetCombine<T>){
  if(typeof initValue === 'function'){
    return new CombineAtom(initValue as GetCombine<T>, setCombine)
  }
  return new Atom(initValue, setCombine)
}

/**
 * 用于获取atom的state和setState方法
 * @param atom atom方法创建的实例
 */
export function useAtom<T>(atom: Atom<T>): [T, Atom<T>['set']]
export function useAtom<T>(atom: CombineAtom<T>): [T, CombineAtom<T>['set']]
export function useAtom<T>(atom: Atom<T>|CombineAtom<T>){
  if(atom instanceof CombineAtom && atom.promise) use(atom.promise)
  const state = useSyncExternalStore(
    atom.subscribe,
    atom.get
  )
  return [state, atom.set]
}