import { createRoot } from 'react-dom/client';
import { createElement, StrictMode, createContext, useContext } from 'react';
import { useLoaderData as useRouteLoaderData, createBrowserRouter, createHashRouter, createMemoryRouter, RouterProvider, Outlet, } from 'react-router';
const AppContext = createContext({
    manifest: {},
    routes: [],
    appData: {}
});
export const useAppContext = () => {
    return useContext(AppContext);
};
export const useConfig = () => {
    return useRouteLoaderData().config;
};
export const useLoaderData = () => {
    return useRouteLoaderData().data;
};
const loader = (module) => {
    const { loader: dataLoader, config: pageConfig = {} } = module;
    return async ({ request }) => {
        const { pathname, search, searchParams } = new URL(request.url);
        const ctx = {
            pathname,
            search,
            query: Object.fromEntries(searchParams.entries())
        };
        const data = dataLoader && typeof dataLoader === 'function' ? await dataLoader({ ctx }) : dataLoader;
        return {
            data: data,
            config: typeof pageConfig === 'function' ? await pageConfig({
                ctx, data
            }) : pageConfig
        };
    };
};
const generateRoutes = (manifest, wrappers, parentId) => {
    return Object.values(manifest)
        .filter(v => v.parentId == parentId)
        .map(v => {
        return {
            id: v.id,
            path: v.path,
            pathname: v.pathname,
            parendId: v.parentId,
            layout: v.layout,
            HydrateFallback: () => createElement('div', null, 'loading...'),
            async lazy() {
                const module = await v.component();
                return {
                    loader: loader(module),
                    Component: () => wrappers.reduce((acc, fn) => {
                        return createElement(fn, {
                            routeId: v.id,
                            layout: v.layout,
                            path: v.path,
                            pathname: v.pathname,
                            parentId: v.parentId,
                        }, acc);
                    }, createElement(module.default, null))
                };
            },
            children: generateRoutes(manifest, wrappers, v.id)
        };
    });
};
/**根据路由清单递归生成路由 */
const generateRoutesByManifest = (manifest, parentId) => {
    return Object.values(manifest)
        .filter(v => v.parentId == parentId)
        .map(v => {
        const children = generateRoutesByManifest(manifest, v.id);
        return {
            ...v,
            children
        };
    });
};
export const createApp = ({ manifest, app: appConfig, runtimes }) => {
    const { root = 'app', strict, router: mode, patchManifest, patchRoutes, appData, rootContainer } = appConfig ?? {};
    // 处理插件运行时
    const providers = [];
    const wrappers = [];
    const addProvider = (fn) => {
        providers.push(fn);
    };
    const addWrapper = (fn) => {
        wrappers.push(fn);
    };
    runtimes?.forEach(runtime => {
        runtime({
            appContext: {
                manifest,
                appConfig
            },
            addProvider,
            addWrapper
        });
    });
    let createRouter = createBrowserRouter;
    if (mode === 'hash') {
        createRouter = createHashRouter;
    }
    if (mode === 'memory') {
        createRouter = createMemoryRouter;
    }
    if (patchManifest && typeof patchManifest === 'function') {
        manifest = patchManifest(manifest);
    }
    let routes = generateRoutes(manifest, wrappers);
    if (patchRoutes && typeof patchRoutes === 'function') {
        routes = patchRoutes(routes);
    }
    /**
     * react-router7 react-activation的AliveScope需要放在RouterProvider内部，所以在routes的最外面嵌套一层路由实现
     * 并且keepAlive的内部不能存在Outlet(也就是说keepAlive只能在最末一级路由，layout不能使用keepAlive)，否则会死循环
     */
    routes = [{
            path: '',
            children: routes,
            element: providers.reduce((acc, fn) => {
                return createElement(fn, null, acc);
            }, createElement(Outlet))
        }];
    // 创建router
    const router = createRouter(routes, { basename: '/' });
    // 创建RouterProvider
    let app = createElement(RouterProvider, { router });
    // 向RouterProvider外层添加插件中的Provider
    // app = providers.reduce((acc, fn) => {
    //   return createElement(fn, null, acc)
    // }, app)
    // 向RouterProvider外层添加AppContextProvider
    app = createElement(AppContext.Provider, { value: {
            manifest,
            routes,
            appData
        } }, app);
    if (rootContainer && typeof rootContainer === 'function') {
        app = rootContainer(app);
    }
    if (strict) {
        app = createElement(StrictMode, null, app);
    }
    let rootEle = document.getElementById(root);
    if (!rootEle) {
        rootEle = document.createElement('div');
        rootEle.id = root;
        document.body.appendChild(rootEle);
    }
    createRoot(rootEle).render(app);
};
//# sourceMappingURL=method.js.map