import { useSyncExternalStore, use } from 'react';
/**根据传入的atom获取值 */
const getAtom = atom => atom.get();
/**根据传入的atom设置值 */
const setAtom = (atom, value) => atom.onlySet(value);
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
    // 仅更新state值，不触发setCombine(在setCombine内部使用，避免死循环)
    onlySet = (value) => {
        const newV = typeof value === 'function' ? value(this.state) : value;
        this.state = newV;
        this.listeners.forEach(cb => cb());
    };
    // 更新state值，触发setCombine
    set = (value) => {
        const newV = typeof value === 'function' ? value(this.state) : value;
        if (this.setCombine) {
            this.setCombine(newV, getAtom, setAtom);
            return;
        }
        this.state = newV;
        this.listeners.forEach(cb => cb());
    };
}
/**基本atom */
class Atom extends BaseAtom {
    constructor(initValue, setCombine) {
        super(initValue, setCombine);
        this.state = initValue;
    }
    get = () => {
        return this.state;
    };
    subscribe = (cb) => {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
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
        this.promise = this.getCombineValue();
    }
    getCombineValue = async () => {
        const value = await this.getCombine((atom) => {
            {
                this.atoms.add(atom);
                return atom.get();
            }
        });
        // 不能调用this.set方法，如果setCombine内变更了当前atom依赖的其他atom，可能会导致死循环
        this.state = value;
        this.listeners.forEach(cb => cb());
    };
    set = (value) => {
        const newV = typeof value === 'function' ? value(this.state) : value;
        if (this.setCombine) {
            this.setCombine(newV, getAtom, setAtom);
            return;
        }
    };
    subscribe = (cb) => {
        const ubsubs = [];
        // 没有订阅时，重新订阅需要执行getCombineValue以获取最新值(有订阅时，会触发更新)
        if (this.listeners.size === 0)
            this.getCombineValue();
        this.atoms.forEach(atom => ubsubs.push(atom.subscribe(this.getCombineValue)));
        this.listeners.add(cb);
        ubsubs.push(() => this.listeners.delete(cb));
        return () => ubsubs.forEach(ubsub => ubsub());
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
//# sourceMappingURL=atom.js.map