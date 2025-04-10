import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, Fragment } from 'react';
import { ScopeContext } from "./context.js";
import Keeper from './keeper';
export default function AliveScope({ children }) {
    // 使用useRef而不是useState是为了防止getActivation等方法在useEffect内使用时获取的值不是最新的
    // 而useEffect依赖getActivation容易导致死循环
    const activationsRef = useRef([]);
    const [count, setCount] = useState(0);
    const forceUpdate = () => setCount(count + 1);
    return (_jsx(Fragment, { children: _jsxs(ScopeContext.Provider, { value: {
                getActivation: name => activationsRef.current.find(v => v.name === name),
                setActivation: activation => {
                    const index = activationsRef.current.findIndex(v => v.name === activation.name);
                    if (index === -1) {
                        activationsRef.current.push(activation);
                    }
                    else {
                        activationsRef.current[index] = activation;
                    }
                    forceUpdate();
                },
                destroy: name => {
                    if (typeof name === 'string')
                        name = [name];
                    activationsRef.current = activationsRef.current.filter(v => !name.includes(v.name));
                    forceUpdate();
                },
                destroyAll: () => {
                    activationsRef.current = [];
                    forceUpdate();
                },
                cachingNodes: [...activationsRef.current]
            }, children: [children, _jsx("div", { className: 'ka-caches', children: [...activationsRef.current.map(v => {
                            return _jsx(Keeper, { activation: v }, v.name);
                        })] })] }) }));
}
//# sourceMappingURL=aliveScope.js.map