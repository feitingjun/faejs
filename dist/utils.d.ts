/**console颜色 */
export declare const chalk: {
    blue: (text: string) => string;
    green: (text: string) => string;
    red: (text: string) => string;
};
export declare function deepClone<T>(obj: T): T;
/**防抖函数 */
export declare const debounce: (fn: Function, delay: number) => (...args: any) => void;
