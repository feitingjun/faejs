import { useSyncExternalStore, use } from 'react';
/**根据传入的atom获取值 */
const getAtom = atom => atom.get();
/**根据传入的atom设置值 */
const setAtom = (atom, value) => atom.set(value);
/** 仿 jotai 的轻量级全局状态管理库 */
class BaseAtom {
    /** 原子的状态 */
    state;
    /** 订阅者列表 */
    listeners = new Set();
    /**当前atom的自定义set函数，如果存在setCombine方法，state的变更由用户完全接管 */
    setCombine;
    constructor(_, setCombine) {
        this.setCombine = setCombine;
    }
    get = () => {
        return this.state;
    };
    subscribe = (cb) => {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    };
}
/**基本atom */
class Atom extends BaseAtom {
    constructor(initValue, setCombine) {
        super(initValue, setCombine);
        this.state = initValue;
    }
    // 更新state值，触发setCombine
    set = (value) => {
        let newV = typeof value === 'function' ? value(this.state) : value;
        if (this.setCombine) {
            newV = this.setCombine(newV, getAtom, setAtom);
        }
        this.state = newV;
        this.listeners.forEach(cb => cb());
    };
}
/**组合atom */
class CombineAtom extends BaseAtom {
    /** 依赖atom列表，任意一个atom变更，都会触发getCombine方法 */
    atoms = new Set();
    /**当前atom的自定义get函数，通常用来从其他一个或多个atom获取组合数据，如果存在此方法，此atom的state不能手动变更 */
    getCombine;
    /**初始异步加载数据的promise(供react的use方法使用，以此使组件在数据为加载完成时等待) */
    promise;
    constructor(initValue, setCombine) {
        super(initValue, setCombine);
        this.getCombine = initValue;
        this.promise = this.getCombineValue(true);
    }
    getCombineValue = async (first) => {
        const combines = this.getCombine((atom) => {
            {
                this.atoms.add(atom);
                return atom.get();
            }
        });
        if (first)
            this.atoms.forEach(atom => atom.subscribe(this.getCombineValue));
        const value = await combines;
        this.state = value;
        this.listeners.forEach(cb => cb());
    };
    set = (value) => {
        const newV = typeof value === 'function' ? value(this.state) : value;
        if (this.setCombine)
            this.setCombine(newV, getAtom, setAtom);
    };
}
export function atom(initValue, setCombine) {
    if (typeof initValue === 'function') {
        return new CombineAtom(initValue, setCombine);
    }
    return new Atom(initValue, setCombine);
}
export function useAtom(atom) {
    if (atom instanceof CombineAtom && atom.promise)
        use(atom.promise);
    const state = useSyncExternalStore(atom.subscribe, atom.get);
    return [state, atom.set];
}
/**
 * 用于获取组合atom的state
 * @param atom atom方法创建的实例
 */
export function useAtomValue(atom) {
    if (atom instanceof CombineAtom && atom.promise)
        use(atom.promise);
    return useSyncExternalStore(atom.subscribe, atom.get);
}
/**
 * 用于获取atom的setState方法
 * @param atom atom方法创建的实例
 */
export function useSetAtom(atom) {
    return atom.set;
}
//# sourceMappingURL=atom.js.map