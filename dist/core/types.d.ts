import { ProxyOptions, UserConfig, Plugin as VitePlugin } from 'vite';
import { ComponentType, PropsWithChildren } from 'react';
import { AppConfig } from '../app/types';
import { Stats } from 'fs';
/**项目.faerc.ts配置 */
export interface FaeConfig {
    /**开发服务器端口 */
    port?: number;
    /**基础路径 */
    base?: string;
    /**公共资源路径 */
    publicDir?: string;
    /**src路径 */
    srcDir?: string;
    /**输出路径 */
    outDir?: string;
    /**import别名 */
    alias?: Record<string, string>;
    /**开发服务器启动时是否自动打开浏览器 */
    open?: boolean;
    /**chunk大小警告的限制 */
    chunkSizeWarningLimit?: number;
    /**开发服务器代理 */
    proxy?: Record<string, string | ProxyOptions>;
    /**faejs插件 */
    plugins?: Plugin[];
    /**是否启用model插件 */
    model?: boolean;
    /**是否启用keepAlive插件 */
    keepAlive?: boolean;
    /**是否启用access插件 */
    access?: boolean;
    /**是否启用atom插件 */
    atom?: boolean;
    /**是否启用jotai插件 */
    jotai?: boolean;
}
/**添加临时文件方法参数 */
export interface AddFileOptions {
    specifier: string | string[];
    source: string;
}
/**使类型的某一个属性可选 */
export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/**插件addWatch参数 */
export type PluginWatcher = (eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string, stats?: Stats) => void;
/**插件参数 */
export interface PluginOptions {
    /**配置上下文 */
    context: {
        mode: UserConfig['mode'];
        /**项目根目录 */
        root: string;
        /**src目录 */
        srcDir: string;
        /**用户配置 */
        userConfig: FaeConfig;
        /**项目package.json内容 */
        pkg: Record<string, any>;
    };
    /**修改用户配置 */
    modifyUserConfig: (fn: (config: FaeConfig) => FaeConfig) => void;
    /**添加文件 */
    addFile: (options: {
        content: string;
        outPath: string;
    }) => void;
    /**根据Handlebars模板写入文件 */
    addFileTemplate: <T extends Record<string, any>>(options: {
        sourcePath: string;
        outPath: string;
        data?: T;
    }) => void;
    /**添加额外的pageConfig类型 */
    addPageConfigType: (options: AddFileOptions) => void;
    /**添加额外的appConfig类型 */
    addAppConfigType: (options: AddFileOptions) => void;
    /**添加从fae命名空间导出的模块 */
    addExport: (options: AddFileOptions & {
        type?: boolean;
    }) => void;
    /**在入口文件的最前面添加import */
    addEntryImport: (options: MakePropertyOptional<AddFileOptions, 'specifier'>) => void;
    /**在入口文件的最前插入代码 */
    addEntryCodeAhead: (code: string) => void;
    /**在入口文件的最后插入代码 */
    addEntryCodeTail: (code: string) => void;
    /**文件变更时触发 */
    addWatch: (fn: PluginWatcher) => void;
}
/**插件 */
export interface Plugin extends VitePlugin {
    name: string;
    setup?: (options: PluginOptions) => void;
    runtime?: string;
}
/**路由清单对象值 */
export interface RouteManifestObject {
    id: string;
    path: string;
    pathname: string;
    parentId?: string;
    file: string;
    layout?: boolean;
}
/**路由清单 */
export type RouteManifest = Record<string, RouteManifestObject>;
export type Provider = ComponentType<PropsWithChildren<{}>>;
export type Wrapper = ComponentType<PropsWithChildren<{
    routeId: string;
    layout?: boolean;
    path: string;
    pathname: string;
    parentId?: string;
}>>;
/**插件运行时参数 */
export interface RuntimeOptions {
    /**运行时上下文信息 */
    appContext: {
        /**app配置 */
        appConfig: AppConfig;
        /**路由清单 */
        manifest: RouteManifest;
    };
    /**添加全局Provider */
    addProvider: (fn: Provider) => void;
    /**给所有路由组件添加一层包裹 */
    addWrapper: (fn: Wrapper) => void;
}
/**插件运行时类型 */
export type Runtime = (options: RuntimeOptions) => void;
