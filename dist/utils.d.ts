/**console颜色 */
export declare const chalk: {
    blue: (text: string) => string;
    green: (text: string) => string;
    red: (text: string) => string;
};
/**获取本地IPv4地址 */
export declare function getLocalIp(): string | undefined;
/**动态导入ts方案 */
export declare function dynamicImport(source: string): Promise<any>;
export declare function deepClone<T>(obj: T): T;
/**防抖函数 */
export declare const debounce: (fn: Function, delay: number) => (...args: any) => void;
