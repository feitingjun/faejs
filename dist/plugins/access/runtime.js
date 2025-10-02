import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { defineRuntime } from "../../core/define.js";
import { useConfig } from "../../app/method.js";
import { createContext, useContext, useState } from 'react';
const Context = createContext({
    access: [],
    setAccess: () => { }
});
export const useAuth = (code) => {
    const access = useContext(Context).access;
    if (Array.isArray(code)) {
        return code.some(c => access.includes(c));
    }
    return access.includes(code);
};
export const Access = ({ children, access }) => {
    const hasAuth = useAuth(access);
    return hasAuth ? children : null;
};
export const AccessHC = (access) => {
    return (Component) => {
        return (props) => {
            return (_jsx(Access, { access: access, children: _jsx(Component, { ...props }) }));
        };
    };
};
export const useAccess = () => {
    const { access, setAccess } = useContext(Context);
    return { access, setAccess };
};
export default defineRuntime(({ addProvider, addWrapper, appContext: { appConfig } }) => {
    const { NoAccess } = appConfig;
    addProvider(({ children }) => {
        const [access, setAccess] = useState([]);
        return (_jsx(Context.Provider, { value: {
                access,
                setAccess
            }, children: children }));
    });
    addWrapper(({ children }) => {
        const { access } = useConfig();
        // 没有定义access的页面不纳入权限管理
        if (!access)
            return children;
        const isAuth = useAuth(access);
        return isAuth ? children : NoAccess ? _jsx(NoAccess, {}) : _jsx(_Fragment, { children: "\u65E0\u6743\u9650" });
    });
});
