import { jsx as _jsx } from "react/jsx-runtime";
import { useLocation } from 'react-router';
import { defineRuntime } from "../../core/define.js";
import AliveScope from './aliveScope';
import KeepAlive from './keepAlive';
import { useConfig } from "../../app/method.js";
export default defineRuntime(({ addProvider, addWrapper, appContext: { appConfig } }) => {
    const { keepAlive: keep } = appConfig;
    addProvider(({ children }) => {
        return _jsx(AliveScope, { children: children });
    });
    addWrapper(({ children, layout, routeId }) => {
        // if(layout) return children
        const { pathname, search } = useLocation();
        const { keepAlive = keep?.default, pagename } = useConfig();
        if (!keepAlive)
            return children;
        return _jsx(KeepAlive, { name: routeId + search, pagename: pagename, children: children });
    });
});
