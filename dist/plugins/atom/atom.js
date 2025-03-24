import { useSyncExternalStore } from 'react';
/**
 * 仿jotai的轻量级全局状态管理库
 */
class Atom {
    value;
    listeners = new Set();
    atoms = new Set();
    combine;
    constructor(initValue) {
        if (typeof initValue === 'function') {
            this.combine = initValue;
            this.getCombineValue();
        }
        else {
            this.value = initValue;
        }
    }
    getCombineValue = async () => {
        const value = await this.combine((atom) => {
            {
                this.atoms.add(atom);
                return atom.get();
            }
        });
        this.set(value);
    };
    get = () => {
        return this.value;
    };
    set = (value) => {
        this.value = value;
        this.listeners.forEach(cb => cb());
    };
    subscribe = (cb) => {
        if (this.combine instanceof Function) {
            const ubsubs = [];
            this.getCombineValue();
            this.atoms.forEach(atom => ubsubs.push(atom.subscribe(this.getCombineValue)));
            this.listeners.add(cb);
            ubsubs.push(() => this.listeners.delete(cb));
            return () => ubsubs.forEach(ubsub => ubsub());
        }
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    };
}
export function atom(initValue) {
    return new Atom(initValue);
}
/**
 * 用于获取atom的state和setState方法
 * @param atom atom方法创建的实例
 */
export function useAtom(atom) {
    const state = useSyncExternalStore(atom.subscribe, atom.get);
    return [state, atom.set];
}
//# sourceMappingURL=atom.js.map