import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, relative } from 'path';
import { renderToString } from 'react-dom/server';
import { globSync } from 'glob';
import { createElement } from 'react';
import { dynamicImport, debounce, chalk, getLocalIp } from "../utils.js";
import { renderHbsTpl } from "../hbs.js";
import { createTmpDir, writeEntryTsx, writeFaeRoutesTs } from "../writeFile.js";
import model from "../plugins/model/index.js";
import reactActivation from "../plugins/reactActivation/index.js";
import access from "../plugins/access/index.js";
import atom from "../plugins/atom/index.js";
import jotai from "../plugins/jotai/index.js";
import keepAlive from "../plugins/keepAlive/index.js";
const __dirname = import.meta.dirname;
/**是否需要重新生成路由 */
function needGenerateRoutes(path, srcDir = 'src') {
    // 匹配src目录下的layout(s).tsx | layout(s)/index.tsx
    const regex = new RegExp(`^${srcDir}/(layout|layouts)(?:/index)?.tsx$`);
    const isRootLayout = regex.test(path);
    // 匹配以(.)page.tsx | (.)layout.tsx | layout/index.tsx 结尾且page.tsx不在layout(s)下的文件
    const isPageOrLayout = /^(?:(?!.*(layout|layouts)\/.*page\.tsx).)*\/((\S+\.)?page\.tsx|(\S+\.)?layout\.tsx|layout\/index\.tsx)$/.test(path);
    // 是否在指定的pages目录下
    const inPagesDir = existsSync(resolve(process.cwd(), srcDir, 'pages'))
        ? path.startsWith(`${srcDir}/pages`)
        : path.startsWith(srcDir);
    return (isRootLayout ||
        (isPageOrLayout && inPagesDir) ||
        path === srcDir ||
        path === `${srcDir}/pages`);
}
/**生成路由清单 */
function generateRouteManifest(src = 'src') {
    const srcDir = resolve(process.cwd(), src);
    // 获取页面根目录
    const pageDir = existsSync(srcDir + '/pages') ? 'pages' : '';
    // 获取全局layout
    const rootLayout = globSync('layout{s,}{/index,}.tsx', { cwd: srcDir });
    // 获取所有页面
    const include = [
        '**/{*.,}page.tsx',
        '**/{*.,}layout.tsx',
        '**/layout/index.tsx',
        '**/404{/index,}.tsx'
    ];
    const ignore = ['**/layout/**/*{[^/],}page.tsx', '**/layout/**/layout.tsx'];
    const pages = globSync(include, { cwd: resolve(srcDir, pageDir), ignore });
    // 获取id和文件的映射
    const idpaths = pages.reduce((prev, file) => {
        const id = file
            // 去除路径中文件夹为index的部分
            .replace(/index\//, '')
            // 去除结尾的index.tsx(layout才有) | (/)page.tsx | (/).page.tsx | (/)index.page.tsx
            .replace(/\/?((index)|((((\/|^)index)?\.)?page))?\.tsx$/, '')
            // 将user.detail 转换为 user/detail格式(简化目录层级)
            .replace('.', '/')
            // 将$id转换为:id
            .replace(/\$(\w+)/, ':$1')
            // 将$转换为通配符*
            .replace(/\$$/, '*')
            // 将404转换为通配符*
            .replace(/404$/, '*');
        prev[id || '/'] = file;
        return prev;
    }, {});
    const ids = Object.keys(idpaths).sort((a, b) => {
        const nA = a.replace(/\/?layout/, ''), nB = b.replace(/\/?layout/, '');
        return nA.length === nB.length ? a.indexOf('layout') : nB.length - nA.length;
    });
    // 生成路由清单
    const routesManifest = ids.reduce((prev, id, index) => {
        const parentId = ids.slice(index + 1).find(v => {
            return v.endsWith('layout') && id.startsWith(v.replace(/\/?layout/, ''));
        });
        const regex = new RegExp(`^${parentId?.replace(/\/?layout$/, '')}/?|/?layout$`, 'g');
        return {
            ...prev,
            [id]: {
                id,
                parentId,
                path: id === '/' ? '' : id.replace(regex, ''),
                pathname: id.replace(/\/?layout?$/, ''),
                file: resolve(srcDir, pageDir, idpaths[id]),
                layout: id.endsWith('layout')
            }
        };
    }, {});
    if (rootLayout.length > 0 && pageDir) {
        Object.values(routesManifest).forEach(v => {
            if (!v.parentId)
                v.parentId = 'rootLayout';
        });
        routesManifest['rootLayout'] = {
            id: 'rootLayout',
            path: '',
            pathname: '',
            file: resolve(srcDir, rootLayout[0]),
            layout: true
        };
    }
    return routesManifest;
}
/**监听路由文件变化 */
async function watchRoutes(server, event, path, srcDir = 'src') {
    // 获取项目根目录的的路径
    path = relative(process.cwd(), path);
    // 用户配置变更后重启服务器
    if (path === '.faerc.ts') {
        console.log('.faerc.ts 文件变更，服务器重启中...');
        return server.restart(true).then(() => {
            const port = server.config.server.port;
            console.log('服务器重启成功');
            console.log(`  - Local: ${chalk.green(`http://localhost:${port}`)}`);
            console.log(`  - Network: ${chalk.green(`http://${getLocalIp()}:${port}`)}\n`);
        });
    }
    // 重新生成路由
    if (event !== 'change' && needGenerateRoutes(path)) {
        writeFaeRoutesTs(resolve(process.cwd(), srcDir, '.fae'), generateRouteManifest(srcDir));
    }
}
function loadPlugins(faeConfig) {
    // 运行时配置
    const runtimes = [];
    // 额外的pageConfig类型
    const pageConfigTypes = [];
    // 额外的appConfig类型
    const appConfigTypes = [];
    // 从fae命名空间导出的模块
    const exports = [];
    // 在入口文件中导入的模块
    const imports = [];
    // 在入口文件顶部插入的代码
    const aheadCodes = [];
    // 在入口文件尾部插入的代码
    const tailCodes = [];
    // 文件变更时触发的函数
    const watchers = [];
    const modifyUserConfig = fn => {
        faeConfig = fn(faeConfig);
    };
    const addFile = ({ content, outPath }) => {
        writeFileSync(outPath, content);
    };
    const addFileTemplate = options => {
        renderHbsTpl(options);
    };
    const addPageConfigType = options => {
        pageConfigTypes.push(options);
    };
    const addAppConfigType = options => {
        appConfigTypes.push(options);
    };
    const addExport = options => {
        exports.push(options);
    };
    const addEntryImport = options => {
        imports.push(options);
    };
    const addEntryCodeAhead = code => {
        aheadCodes.push(code);
    };
    const addEntryCodeTail = code => {
        tailCodes.push(code);
    };
    const addWatch = fn => {
        watchers.push(fn);
    };
    // 解析fae插件
    if (faeConfig.plugins && faeConfig.plugins.length > 0) {
        // 动态导入package.json
        const pkgText = readFileSync(`${process.cwd()}/package.json`, 'utf-8');
        const pkg = JSON.parse(pkgText);
        // 执行fae插件
        faeConfig.plugins.forEach(plugin => {
            const { setup, runtime } = plugin;
            const context = {
                mode: process.env.NODE_ENV,
                root: process.cwd(),
                srcDir: faeConfig.srcDir ?? 'src',
                userConfig: faeConfig,
                pkg
            };
            if (runtime)
                runtimes.push(runtime);
            setup?.({
                context,
                modifyUserConfig,
                addFile,
                addFileTemplate,
                addPageConfigType,
                addAppConfigType,
                addExport,
                addEntryImport,
                addEntryCodeAhead,
                addEntryCodeTail,
                addWatch
            });
        });
    }
    return {
        pageConfigTypes,
        appConfigTypes,
        exports,
        imports,
        aheadCodes,
        tailCodes,
        runtimes,
        watchers
    };
}
async function getHtmlTemplate(srcDir, fileName) {
    let temp = resolve(process.cwd(), srcDir, 'document.tsx');
    if (!existsSync(temp)) {
        temp = resolve(__dirname, '..', 'template', 'document.js');
    }
    const module = (await dynamicImport(temp)).default;
    // 将document.tsx模版转换为html字符串
    return renderToString(createElement(module, {
        entry: createElement('script', {
            type: 'module',
            key: 'entry',
            src: fileName
        })
    }));
}
/**加载全局样式文件 */
function loadGlobalStyle(srcDir, { imports, aheadCodes, tailCodes, watchers }) {
    // 判断是否存在global.less文件
    const globalStyle = globSync(`${srcDir}/global.{less,scss,css}`, {
        cwd: process.cwd()
    });
    if (globalStyle && globalStyle.length > 0) {
        imports.push({ source: `${process.cwd()}/${globalStyle[0]}` });
    }
    // 添加一个监听global.less增删的监听器
    watchers.push((event, path) => {
        const reg = new RegExp(`^${process.cwd()}/${srcDir}/global.(less|scss|css)$`);
        if (!reg.test(path))
            return;
        if (event === 'add') {
            imports.push({ source: path });
            writeEntryTsx(resolve(process.cwd(), srcDir, '.fae'), {
                imports,
                aheadCodes,
                tailCodes
            });
        }
        else if (event === 'unlink') {
            imports.splice(imports.findIndex(v => v.source === path), 1);
            writeEntryTsx(resolve(process.cwd(), srcDir, '.fae'), {
                imports,
                aheadCodes,
                tailCodes
            });
        }
    });
}
/**vite插件，负责解析.faerc.ts配置，生成约定式路由，以及提供fae插件功能*/
export default async function FaeCore() {
    let faeConfig = {};
    let watchers = [];
    return {
        name: 'fae-core',
        enforce: 'pre',
        config: async (config) => {
            // 用户配置文件变更时重置
            watchers = [];
            faeConfig = (await dynamicImport(`${process.cwd()}/.faerc.ts`)).default;
            // 添加默认插件
            if (!faeConfig.plugins)
                faeConfig.plugins = [];
            if (faeConfig.model)
                faeConfig.plugins.push(model);
            if (faeConfig.reactActivation)
                faeConfig.plugins.push(reactActivation);
            if (faeConfig.access)
                faeConfig.plugins.push(access);
            if (faeConfig.atom)
                faeConfig.plugins.push(atom);
            if (faeConfig.jotai)
                faeConfig.plugins.push(jotai);
            if (faeConfig.keepAlive)
                faeConfig.plugins.push(keepAlive);
            const { pageConfigTypes, appConfigTypes, exports, imports, aheadCodes, tailCodes, runtimes, watchers: pluginWatchers } = loadPlugins(faeConfig);
            // 插件内可能更改配置，所以在插件处理完成后再从faeConfig内解构
            const { port, base, publicDir, srcDir = 'src', outDir = 'dist', alias, open, proxy, chunkSizeWarningLimit } = faeConfig;
            faeConfig.srcDir = srcDir;
            faeConfig.outDir = outDir;
            watchers = pluginWatchers;
            loadGlobalStyle(srcDir, { imports, aheadCodes, tailCodes, watchers });
            // 创建临时文件夹
            createTmpDir({
                root: process.cwd(),
                srcDir: faeConfig.srcDir || 'src',
                options: {
                    manifest: generateRouteManifest(faeConfig.srcDir),
                    pageConfigTypes,
                    appConfigTypes,
                    exports,
                    imports,
                    aheadCodes,
                    tailCodes,
                    runtimes
                }
            });
            // 返回的配置将与原有的配置深度合并
            return {
                server: { port, open },
                base,
                outDir,
                publicDir,
                resolve: {
                    alias: {
                        '@': resolve(process.cwd(), srcDir.split('/')[0]),
                        fae: resolve(process.cwd(), srcDir, '.fae'),
                        '/fae.tsx': resolve(process.cwd(), srcDir, '.fae', 'entry.tsx'),
                        ...(alias ?? {})
                    }
                },
                proxy,
                build: {
                    chunkSizeWarningLimit,
                    rollupOptions: {
                        input: {
                            fae: resolve(process.cwd(), srcDir, '.fae', 'entry.tsx')
                        }
                    }
                }
            };
        },
        configureServer: server => {
            const srcDir = faeConfig.srcDir;
            server.watcher.on('all', (event, path, stats) => {
                debounce(() => watchRoutes(server, event, path, srcDir), 150)();
                watchers.forEach(fn => fn(event, path, stats));
            });
        }
    };
}
