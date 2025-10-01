/**console颜色 */
export const chalk = {
    blue: (text) => {
        return `\x1b[34m${text}\x1b[0m`;
    },
    green: (text) => {
        return `\x1b[32m${text}\x1b[0m`;
    },
    red: (text) => {
        return `\x1b[31m${text}\x1b[0m`;
    }
};
// 深拷贝
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**防抖函数 */
export const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};
