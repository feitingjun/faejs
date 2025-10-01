import { PluginOption } from 'vite';
import { FaeConfig } from './types';
/**vite插件，负责解析.faerc.ts配置，生成约定式路由，以及提供fae插件功能*/
export default function FaeCore(faeConfig?: FaeConfig): PluginOption;
