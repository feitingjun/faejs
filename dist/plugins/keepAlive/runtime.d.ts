export type KeepAlivePageConfig = {
    /**当前页面是否缓存 */
    keepAlive?: boolean;
};
export interface KeepAliveAppTypes {
    /**keepAlive配置 */
    keepAlive?: {
        /**路由是否默认使用keepAlive */
        default: boolean;
    };
}
declare const _default: import("../..").Runtime;
export default _default;
