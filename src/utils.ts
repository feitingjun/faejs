/**console颜色 */
export const chalk = {
  blue: (text: string) => {
    return `\x1b[34m${text}\x1b[0m`
  },
  green: (text: string) => {
    return `\x1b[32m${text}\x1b[0m`
  },
  red: (text: string) => {
    return `\x1b[31m${text}\x1b[0m`
  }
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**防抖函数 */
export const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout
  return (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
