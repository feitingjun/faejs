import { FaeConfig, Plugin, Runtime } from './types';
/**定义.ranrc.ts用户配置 */
export declare function defineFaeConfig(config: FaeConfig): FaeConfig;
/**定义插件 */
export declare function definePlugin<T extends Plugin | ((...args: any[]) => Plugin)>(plugin: T): T;
/**定义运行时函数 */
export declare function defineRuntime(fn: Runtime): Runtime;
