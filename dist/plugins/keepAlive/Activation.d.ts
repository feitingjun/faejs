import { Context, ReactNode } from 'react';
export interface Bridge<T = any> {
    context: Context<T>;
    value: T;
}
export default class Activation {
    name: string;
    /**组件的dom */
    dom: HTMLDivElement | null;
    /**组件是否激活 */
    private _active;
    /**组件的props */
    props: Record<string, any>;
    /**桥接的bridges列表 */
    bridges: Bridge[];
    /**这个组件实际的容器 */
    wrapper: HTMLDivElement | null;
    /**滚动位置缓存 */
    scroll: Map<HTMLElement, {
        x: number;
        y: number;
    }>;
    /**当前组件的children */
    children: ReactNode | null;
    /**当前组件变更监听 */
    listeners: Set<(at: Activation) => void>;
    /**当前组件active状态变更监听 */
    activeListeners: Set<(active: boolean) => void>;
    /**子组件内的useActivate */
    activateHooks: Set<() => void>;
    /**子组件内的useUnactivate */
    unactivateHooks: Set<() => void>;
    constructor(name: string);
    get active(): boolean;
    set active(active: boolean);
    /**添加变更监听器 */
    subscribe: (cb: () => void) => () => boolean;
    /**触发变更 */
    update: () => void;
    /**保存滚动位置 */
    saveScroll: (ele: HTMLElement | null) => void;
    /**恢复滚动位置 */
    restoreScroll: (ele: HTMLElement | null) => void;
}
