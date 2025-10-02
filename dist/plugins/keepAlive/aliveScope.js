import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Fragment, useRef } from 'react';
import { ScopeContext } from "./context.js";
import Keeper from './keeper';
export default function AliveScope({ children }) {
    const actives = useRef(new Map());
    const [names, setNames] = useState([]);
    return (_jsx(Fragment, { children: _jsxs(ScopeContext.Provider, { value: {
                addActivation: at => {
                    actives.current.set(at.name, at);
                    setNames(ns => ([...ns, at.name]));
                },
                getActivation: name => actives.current.get(name),
                destroy: name => {
                    if (typeof name === 'string')
                        name = [name];
                    name.forEach(v => actives.current.delete(v));
                    setNames(ns => ns.filter(v => !name.includes(v)));
                },
                destroyAll: () => {
                    setNames([]);
                    actives.current.clear();
                },
                getCachingNodes: () => names.map(v => {
                    const at = actives.current.get(v);
                    return {
                        name: at.name,
                        props: at.props,
                        active: at.active
                    };
                })
            }, children: [children, _jsx("div", { className: 'ka-caches', children: [...names.map(v => {
                            return _jsx(Keeper, { name: v }, v);
                        })] })] }) }));
}
