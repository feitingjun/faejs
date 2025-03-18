import { RouteObject } from 'react-router';
import { RouteManifest, RouteManifestObject } from '../core/types';
import { ComponentType, PropsWithChildren } from 'react';
/**AppContext */
export interface AppContextType<T = Record<string, unknown>> {
    manifest: RouteManifest;
    routes: RouteObject[];
    appData: T;
}
/**页面dataLoader函数入参内的ctx类型定义 */
export interface DataLoadeContext {
    pathname: string;
    search: string;
    query: Record<string, string>;
}
/**页面dataLoader函数的类型定义 */
export type DataLoader<T = unknown> = ((args: {
    ctx: DataLoadeContext;
}) => Promise<T>) | ((args: {
    ctx: DataLoadeContext;
}) => T);
/**DataLoader返回的数据类型 */
export type LoaderData<T = unknown> = T extends DataLoader ? (ReturnType<T> extends Promise<infer D> ? D : ReturnType<T>) : T extends Promise<infer D> ? D : T;
export type DefaultPageConfig<T extends {}> = {
    pagename?: string;
    [key: string]: any;
} & {
    [key in keyof T]: T[key];
};
/**PageConfig的类型定义 */
export type PageConfig<T extends {} = {}, D = unknown> = DefaultPageConfig<T> | (({ ctx, data }: {
    ctx: DataLoadeContext;
    data: LoaderData<D>;
}) => (DefaultPageConfig<T> | Promise<DefaultPageConfig<T>>));
/**useLoaderData返回的数据类型 */
export type UseLoaderDataReturn<D = unknown, P = unknown> = {
    data: LoaderData<D>;
    config: P extends PageConfig ? (P extends ({ ctx, data }: {
        ctx: DataLoadeContext;
        data: LoaderData<D>;
    }) => infer T ? (T extends Promise<infer T_1> ? T_1 : T) : P) : P;
};
/**生成的manifest文件内数据的类型 */
export type ManifestClient = {
    [key: string]: RouteManifestObject & {
        component: () => Promise<{
            default: ComponentType<PropsWithChildren<{}>>;
            config?: PageConfig;
            loader?: DataLoader;
        }>;
    };
};
/**app配置 */
export type AppConfig<T extends {} = {}, D extends Record<string, unknown> = {}> = {
    root?: string;
    strict?: boolean;
    router?: 'hash' | 'browser' | 'memory';
    appData?: D;
    rootContainer?: (container: React.ReactNode) => React.ReactNode;
    patchManifest?: (manifest: ManifestClient) => ManifestClient;
    patchRoutes?: (routes: RouteObject[]) => RouteObject[];
} & T;
