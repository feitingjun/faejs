import React from 'react';
import jsxRuntime from 'react/jsx-runtime';
import jsxDevRuntime from 'react/jsx-dev-runtime';
import { ScopeContext, KeepAliveContext } from "./context.js";
/**储存所有的context */
const fixedContext = [];
/**
 * 缓存某个keepAlive第一次加载时获取到的fixedContext
 * 因为fixedContext会随着加载的页面增多而增多，如果不缓存，
 * 每次context的数量变更会导致keepAlive内的Bridge层级增加，从而导致缓存的页面卸载之后重新加载，
 * 从而导致缓存失效
*/
const contextCaches = new Map();
/**更加name获取fixedContext */
export function getFixedContext(name) {
    if (!contextCaches.has(name)) {
        contextCaches.set(name, [...fixedContext]);
    }
    return contextCaches.get(name);
}
function repair(mods, names) {
    names.forEach(name => {
        const oldFn = mods[name];
        if (typeof oldFn !== 'function')
            return;
        mods[name] = function (type, ...args) {
            if (typeof type === 'object' && type['$$typeof'] === Symbol.for('react.context')) {
                if (![ScopeContext, KeepAliveContext].includes(type) && !fixedContext.includes(type)) {
                    fixedContext.push(type);
                }
            }
            return oldFn(type, ...args);
        };
    });
}
repair(React, ['createElement']);
repair(jsxRuntime, ['jsx', 'jsxs']);
repair(jsxDevRuntime, ['jsxDEV']);
