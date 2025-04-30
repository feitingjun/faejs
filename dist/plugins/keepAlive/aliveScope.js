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
                    setNames([...names, at.name]);
                },
                getActivation: name => actives.current.get(name),
                destroy: name => {
                    if (typeof name === 'string')
                        name = [name];
                    setNames(names.filter(v => !name.includes(v)));
                    name.forEach(v => actives.current.delete(v));
                },
                destroyAll: () => {
                    setNames([]);
                    actives.current.clear();
                },
                cachingNodes: names.map(v => ({ ...actives.current.get(v) }))
            }, children: [children, _jsx("div", { className: 'ka-caches', children: [...names.map(v => {
                            return _jsx(Keeper, { name: v }, v);
                        })] })] }) }));
}
//# sourceMappingURL=aliveScope.js.map