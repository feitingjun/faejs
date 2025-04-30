import { useLayoutEffect, useState, useContext } from 'react';
import { ScopeContext } from "./context.js";
export const useActive = (name) => {
    /**
     * 为了在Active变更时触发组件更新
     * 不能使用useSyncExternalStore，因为只是Active的属性变更，而不是Active的引用变更，
     * useSyncExternalStore在获取的值不变时不会触发更新
     */
    const [_, setCount] = useState(0);
    const { getActive } = useContext(ScopeContext);
    useLayoutEffect(() => {
        const unsubscribe = getActive(name).subscribe(() => {
            setCount(c => c + 1);
        });
        return () => { unsubscribe(); };
    }, [name]);
    return getActive(name);
};
export class Activation {
    name;
    /**组件的dom */
    dom = null;
    /**组件是否激活 */
    active = false;
    /**组件的props */
    props = {};
    /**桥接的bridges列表 */
    bridges = [];
    /**这个组件实际的容器 */
    wrapper = null;
    /**滚动位置缓存 */
    scroll = new Map();
    /**当前组件的children */
    children = null;
    /**当前组件变更监听 */
    listeners = new Set();
    /**激活监听器列表 */
    activateListeners = new Set();
    /**失活监听器列表 */
    unactivateListeners = new Set();
    constructor(name) {
        this.name = name;
        /**初始化时设置为true，则使useActivate只在激活时触发(首次页面加载时不触发) */
        this.active = true;
    }
    /**添加变更监听器 */
    subscribe = (cb) => {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    };
    /**触发变更 */
    update = () => {
        this.listeners.forEach(fn => fn());
    };
    /**保存滚动位置 */
    saveScroll = (ele) => {
        if (!ele)
            return;
        this.scroll.set(ele, {
            x: ele.scrollLeft,
            y: ele.scrollTop
        });
        if (ele.childNodes.length > 0) {
            ele.childNodes.forEach(child => {
                if (child instanceof HTMLElement) {
                    this.saveScroll(child);
                }
            });
        }
    };
    /**恢复滚动位置 */
    restoreScroll = (ele) => {
        if (!ele)
            return;
        const scroll = this.scroll.get(ele);
        if (scroll) {
            ele.scrollTo(scroll.x, scroll.y);
        }
        if (ele.childNodes.length > 0) {
            ele.childNodes.forEach(child => {
                if (child instanceof HTMLElement) {
                    this.restoreScroll(child);
                }
            });
        }
    };
}
//# sourceMappingURL=active.js.map