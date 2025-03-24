/**
 * 仿jotai的轻量级全局状态管理库
 */
declare class Atom<T> {
    private value;
    private listeners;
    private atoms;
    private combine;
    constructor(initValue: T);
    getCombineValue: () => Promise<void>;
    get: () => T;
    set: (value: T) => void;
    subscribe: (cb: () => void) => () => void;
}
/**
 * 创建一个atom
 * @param initValue
 ** initValue 为函数时，提供一个get方法，用于获取其他atom的state，initValue的返回值为atom的state，
 这个函数会在组件挂载和依赖的atom变更时执行
 ** initValue 不为函数时，以initValue为atom的state
 * @returns atom
 */
export declare function atom<T>(initValue: (get: <D>(atom: Atom<D>) => D) => T): Atom<T>;
export declare function atom<T>(initValue: T): Atom<T>;
/**
 * 用于获取atom的state和setState方法
 * @param atom atom方法创建的实例
 */
export declare function useAtom<T>(atom: Atom<T>): readonly [T, (value: T) => void];
export {};
