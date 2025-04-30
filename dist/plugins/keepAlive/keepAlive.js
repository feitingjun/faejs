import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useContext, cloneElement, useLayoutEffect } from 'react';
import { ScopeContext } from "./context.js";
import { getFixedContext } from "./fixContext.js";
import Activation from "./activation.js";
function Wrapper(props) {
    const { name, children, bridges, ...args } = props;
    const wrapperRef = useRef(null);
    const scope = useContext(ScopeContext);
    if (!scope)
        return children;
    const { addActivation, getActivation } = scope;
    useLayoutEffect(() => {
        let active = getActivation(name);
        if (!active) {
            active = new Activation(name);
            addActivation(active);
        }
        return () => {
            active.active = false;
            active.saveScroll(active.dom);
            active.update();
        };
    }, []);
    useLayoutEffect(() => {
        let active = getActivation(name);
        active.props = args;
        active.bridges = bridges;
        active.children = children;
        active.wrapper = wrapperRef.current;
        // 能进这里说明当前组件必定是激活状态(不是不会加载当前组件)
        if (!active.active)
            active.active = true;
        active.update();
    }, [props]);
    return _jsx("div", { className: 'ka-wrapper', ref: wrapperRef });
}
// 获取上级context的value，然后传递给缓存组件的桥接器
const Bridge = ({ children, bridges, ctx }) => {
    const value = useContext(ctx);
    return cloneElement(children, { bridges: [{ context: ctx, value }, ...bridges] });
};
export default function KeepAlive({ name, children, ...props }) {
    const scope = useContext(ScopeContext);
    if (!scope)
        return children;
    // 按顺序获取上级的context及其value，然后传递给缓存组件
    return getFixedContext(name).reduce((prev, ctx) => {
        return _jsx(Bridge, { bridges: prev.props.bridges, ctx: ctx, children: prev });
    }, _jsx(Wrapper, { bridges: [], name: name, ...props, children: children }));
}
//# sourceMappingURL=keepAlive.js.map