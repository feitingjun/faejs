import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useContext, useEffect, cloneElement } from 'react';
import { ScopeContext } from "./context.js";
import { getFixedContext } from "./fixContext.js";
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
    /**当前组件的children */
    children = null;
    /**激活监听器列表 */
    activateListeners = new Set();
    /**失活监听器列表 */
    unactivateListeners = new Set();
    constructor(name) {
        this.name = name;
        /**初始化时设置为true，则使useActivate只在激活时触发(首次页面加载时不触发) */
        this.active = true;
    }
    /**切换激活状态 */
    toggle = (active) => {
        this.active = active;
        if (active) {
            this.activateListeners.forEach(fn => fn());
        }
        else {
            this.unactivateListeners.forEach(fn => fn());
        }
    };
    /**更新组件 */
    update = (bridge, children, wrapper) => {
        this.children = children;
        this.wrapper = wrapper;
        this.bridges = bridge;
    };
}
function Wrapper({ name, children, bridges, ...props }) {
    const wrapperRef = useRef(null);
    const scope = useContext(ScopeContext);
    if (!scope)
        return children;
    const { getActivation, setActivation } = scope;
    useEffect(() => {
        let activation = getActivation(name) || new Activation(name);
        activation.props = props;
        activation.update(bridges, children, wrapperRef.current);
        setActivation(activation);
        if (!activation.active)
            activation.toggle(true);
    }, bridges.map(v => v.value));
    /**
     * 不能使用useLayoutEffect
     * 由于完全卸载缓存时，当前组件useLayoutEffect的return函数会在useUnactivate内useLayoutEffect的return函数之前执行，
     * 此时失活监听函数还没有注销，若此时组件处于活动状态，会导致useUnactivate注册的函数执行，
     * 而若函数处于失活状态，因为此KeepAlive组件没有加载，无论如何useUnactivate注册的函数都不会执行，
     * 会导致useUnactivate的表现不一致，所以使用useEffect，让其都不执行(useEffect的return函数执行时，useUnactivate内useLayoutEffect的return函数已经删除注册的监听函数了)
     */
    useEffect(() => {
        return () => {
            const activation = getActivation(name);
            if (!activation)
                return;
            activation.toggle(false);
        };
    }, []);
    return _jsx("div", { className: 'ka-wrapper', ref: wrapperRef });
}
const Bridge = ({ children, bridges, ctx }) => {
    const value = useContext(ctx);
    return cloneElement(children, { bridges: [{ context: ctx, value }, ...bridges] });
};
export default function KeepAlive({ name, children, ...props }) {
    return getFixedContext(name).reduce((prev, ctx) => {
        return _jsx(Bridge, { bridges: prev.props.bridges, ctx: ctx, children: prev });
    }, _jsx(Wrapper, { bridges: [], name: name, ...props, children: children }));
}
//# sourceMappingURL=keepAlive.js.map