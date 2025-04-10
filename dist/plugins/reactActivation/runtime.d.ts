export type KeepAlivePageConfig = {
    /**当前页面是否缓存 */
    keepAlive?: boolean;
};
export type KeepAliveAppConfig = {
    /**项目keepAlive配置 */
    keepAlive?: {
        /**页面默认是否缓存 */
        default?: boolean;
    };
};
/**
 * 获取缓存节点列表
 * includeLayout: 是否包含layout
 */
export declare const useCachingNodes: (includeLayout?: boolean) => {
    cachingNodes: CachingNode[];
    dropScope: (names: string[], relevance?: boolean) => string[];
    clear: any;
};
declare const _default: import("../..").Runtime;
export default _default;
