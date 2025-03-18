import { FaeConfig, Plugin, Runtime } from './types'

/**定义.ranrc.ts用户配置 */
export function defineFaeConfig(config: FaeConfig){ return config }

/**定义插件 */
export function definePlugin<T extends Plugin|((...args:any[]) => Plugin)>(plugin:T){ return plugin }

/**定义运行时函数 */
export function defineRuntime(fn:Runtime){ return fn }