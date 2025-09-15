import { networkInterfaces } from 'os';
import { extname, resolve, basename, dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import ts, { JsxEmit } from 'typescript';
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
/**获取本地IPv4地址 */
export function getLocalIp() {
    const interfaces = networkInterfaces();
    for (const iface in interfaces) {
        if (!interfaces[iface])
            continue;
        for (const alias of interfaces[iface] ?? []) {
            // 过滤IPv4地址，排除127.0.0.1（localhost）
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
/**动态导入ts方案 */
export async function dynamicImport(source) {
    const ext = extname(source);
    // 创建临时文件夹
    const tempDir = resolve(process.cwd(), 'node_modules', '.temp');
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
    }
    const filename = basename(source).replace(ext, '');
    const tsCode = readFileSync(source, 'utf-8');
    const result = ts.transpileModule(tsCode, {
        fileName: source,
        compilerOptions: {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.ES2020,
            sourceMap: true,
            sourceRoot: dirname(source),
            jsx: JsxEmit.ReactJSX,
            esModuleInterop: true,
            allowJs: true,
        }
    });
    const jsCode = result.outputText;
    // 写入临时文件
    const path = resolve(tempDir, filename + '.mjs');
    writeFileSync(path, jsCode);
    writeFileSync(resolve(tempDir, filename + '.mjs.map'), result.sourceMapText);
    // 请求添加时间戳，避免缓存(import同一个路径默认值加载一次)
    return await import(`${path}?t=${Date.now()}`);
}
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
