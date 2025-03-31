import { Plugin, UserConfig as ViteConfig, ViteDevServer } from 'vite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, relative } from 'path'
import { renderToString } from 'react-dom/server'
import { globSync } from 'glob'
import { createElement } from 'react'
import { dynamicImport, debounce, chalk, getLocalIp } from '../utils'
import { renderHbsTpl } from '../hbs'
import { FaeConfig, AddFileOptions, MakePropertyOptional, PluginWatcher, PluginOptions, RouteManifest } from './types'
import { createTmpDir, writeFaeRoutesTs } from '../writeFile'
import model from '../plugins/model'
import reactActivation from '../plugins/reactActivation'
import access from '../plugins/access'
import atom from '../plugins/atom'
import jotai from '../plugins/jotai'
import keepAlive from '../plugins/keepAlive'

const __dirname = import.meta.dirname

/**是否需要重新生成路由 */
function needGenerateRoutes(path:string, srcDir='src'){
  // 匹配src目录下的layout(s).tsx | layout(s)/index.tsx
  const regex = new RegExp(`^${srcDir}/(layout|layouts)(?:/index)?.tsx$`)
  const isRootLayout = regex.test(path)
  // 匹配以(.)page.tsx | (.)layout.tsx | layout/index.tsx 结尾且page.tsx不在layout(s)下的文件
  const isPageOrLayout = /^(?:(?!.*(layout|layouts)\/.*page\.tsx).)*\/((\S+\.)?page\.tsx|(\S+\.)?layout\.tsx|layout\/index\.tsx)$/.test(path)
  // 是否在指定的pages目录下
  const inPagesDir = existsSync(resolve(process.cwd(), srcDir, 'pages')) ? path.startsWith(`${srcDir}/pages`) : path.startsWith(srcDir)
  return (isRootLayout || (isPageOrLayout && inPagesDir) || path === srcDir || path === `${srcDir}/pages`)
}

/**生成路由清单 */
function generateRouteManifest(src:string='src'){
  const srcDir = resolve(process.cwd(), src)
  // 获取页面根目录
  const pageDir = existsSync(srcDir + '/pages') ? 'pages' : ''
  // 获取全局layout
  const rootLayout = globSync('layout{s,}{/index,}.tsx', { cwd: srcDir })
  // 获取所有页面
  const include = ['**/{*.,}page.tsx', '**/{*.,}layout.tsx', '**/layout/index.tsx']
  const ignore = ['**/layout/**/*{[^/],}page.tsx', '**/layout/**/layout.tsx']
  const pages = globSync(include, { cwd: resolve(srcDir, pageDir), ignore })
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
      .replace(/404$/, '*')
    prev[id || '/'] = file
    return prev
  }, {} as Record<string, string>)
  const ids = Object.keys(idpaths).sort((a, b) => {
    const nA = a.replace(/\/?layout/, ''), nB = b.replace(/\/?layout/, '')
    return nA.length === nB.length ? a.indexOf('layout') : nB.length - nA.length
  })

  // 生成路由清单
  const routesManifest = ids.reduce((prev, id, index) => {
    const parentId = ids.slice(index + 1).find(v => {
      return v.endsWith('layout') && id.startsWith(v.replace(/\/?layout/, ''))
    })
    const regex = new RegExp(`^${parentId?.replace(/\/?layout$/, '')}/?|/?layout$`, 'g')
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
    }
  }, {} as RouteManifest)

  if (rootLayout.length > 0 && pageDir) {
    Object.values(routesManifest).forEach(v => {
      if (!v.parentId) v.parentId = 'rootLayout'
    })
    routesManifest['rootLayout'] = {
      id: 'rootLayout',
      path: '',
      pathname: '',
      file: resolve(srcDir, rootLayout[0]),
      layout: true
    }
  }
  return routesManifest
}

/**监听路由文件变化 */
async function watchRoutes (server: ViteDevServer, event: string, path: string, srcDir = 'src'){
  // 获取项目根目录的的路径
  path = relative(process.cwd(), path)
  // 用户配置变更后重启服务器
  if (path === '.faerc.ts') {
    console.log(chalk.green('.faerc.ts 文件变更，服务器重启中...'))
    return server.restart(true).then(() => {
      const port = server.config.server.port
      console.log(chalk.blue('服务器重启成功'))
      console.log(`  - Local: ${chalk.green(`http://localhost:${port}`)}`)
      console.log(`  - Network: ${chalk.green(`http://${getLocalIp()}:${port}`)}\n`)
    })
  }
  // 重新生成路由
  if (event !== 'change' && needGenerateRoutes(path)){
    writeFaeRoutesTs(resolve(process.cwd(), srcDir, '.fae'), generateRouteManifest(srcDir))
  }
}

function loadPlugins(faeConfig:FaeConfig){
  // 运行时配置
  const runtimes:string[] = []
  // 额外的pageConfig类型
  const pageConfigTypes:AddFileOptions[] = []
  // 额外的appConfig类型
  const appConfigTypes:AddFileOptions[] = []
  // 从fae命名空间导出的模块
  const exports:(AddFileOptions & { type?: boolean })[] = []
  // 在入口文件中导入的模块
  const imports:MakePropertyOptional<AddFileOptions, 'specifier'>[] = []
  // 在入口文件顶部插入的代码
  const aheadCodes:string[] = []
  // 在入口文件尾部插入的代码
  const tailCodes:string[] = []
  // 文件变更时触发的函数
  const watchers:PluginWatcher[]  = []
  const modifyUserConfig:PluginOptions['modifyUserConfig'] = (fn) => {
    faeConfig = fn(faeConfig)
  }
  const addFile:PluginOptions['addFile'] = ({ content, outPath }) => {
    writeFileSync(outPath, content)
  }
  const addFileTemplate:PluginOptions['addFileTemplate'] = (options) => {
    renderHbsTpl(options)
  }
  const addPageConfigType:PluginOptions['addPageConfigType'] = (options) => {
    pageConfigTypes.push(options)
  }
  const addAppConfigType:PluginOptions['addAppConfigType'] = (options) => {
    appConfigTypes.push(options)
  }
  const addExport:PluginOptions['addExport'] = (options) => {
    exports.push(options)
  }
  const addEntryImport:PluginOptions['addEntryImport'] = (options) => {
    imports.push(options)
  }
  const addEntryCodeAhead:PluginOptions['addEntryCodeAhead'] = (code) => {
    aheadCodes.push(code)
  }
  const addEntryCodeTail:PluginOptions['addEntryCodeTail'] = (code) => {
    tailCodes.push(code)
  }
  const addWatch:PluginOptions['addWatch'] = (fn) => {
    watchers.push(fn)
  }
  // 解析fae插件
  if(faeConfig.plugins && faeConfig.plugins.length > 0){
    // 动态导入package.json
    const pkgText = readFileSync(`${process.cwd()}/package.json`, 'utf-8')
    const pkg = JSON.parse(pkgText)
    // 执行fae插件
    faeConfig.plugins.forEach(plugin => {
      const { setup, runtime } = plugin
      const context = {
        mode: process.env.NODE_ENV as ViteConfig['mode'],
        root: process.cwd(),
        srcDir: faeConfig.srcDir??'src',
        userConfig: faeConfig,
        pkg
      }
      if(runtime) runtimes.push(runtime)
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
      })
    })
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
  }
}

/**vite插件，负责解析.faerc.ts配置，生成约定式路由，以及提供fae插件功能*/
export default function FaeCore():Plugin{
  let faeConfig:FaeConfig = {}
  let watchers:PluginWatcher[] = []
  return {
    name: 'fae-core',
    enforce: 'pre',
    config: async (config) => {
      watchers = []
      faeConfig = (await dynamicImport(`${process.cwd()}/.faerc.ts`)).default
      // 添加默认插件
      if(!faeConfig.plugins) faeConfig.plugins = []
      if(faeConfig.model) faeConfig.plugins.push(model)
      if(faeConfig.reactActivation) faeConfig.plugins.push(reactActivation)
      if(faeConfig.access) faeConfig.plugins.push(access)
      if(faeConfig.atom) faeConfig.plugins.push(atom)
      if(faeConfig.jotai) faeConfig.plugins.push(jotai)
      if(faeConfig.keepAlive) faeConfig.plugins.push(keepAlive)
      const { pageConfigTypes, appConfigTypes, exports, imports, aheadCodes, tailCodes, runtimes, watchers: pluginWatchers } = loadPlugins(faeConfig)
      // 插件内可能更改配置，所以在插件处理完成后再从faeConfig内解构
      const { port, base, publicDir, srcDir='src', outDir='dist', alias, open, proxy, chunkSizeWarningLimit } = faeConfig
      faeConfig.srcDir = srcDir
      faeConfig.outDir = outDir
      watchers = pluginWatchers
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
      })
      // 合并开发配置
      if(!config.server) config.server = {}
      if(port) config.server.port = port
      if(open) config.server.open = open
      if(base) config.base = base
      if(!config.server.fs) config.server.fs = {}
      if(publicDir) config.publicDir = publicDir
      if(!config.resolve) config.resolve = {}
      if(!config.resolve.alias) config.resolve.alias = {}
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': resolve(process.cwd(), srcDir.split('/')[0]),
        'fae': resolve(process.cwd(), srcDir, '.fae'),
        // 入口文件的别名(避免config.root不是项目根目录时无法正确找到入口文件的路径)
        '/fae.tsx': resolve(process.cwd(), srcDir, '.fae', 'entry.tsx'),
        ...alias??{}
      }
      if(proxy) config.server.proxy = proxy
      // 合并打包配置
      if(!config.build) config.build = {}
      if(outDir) config.build.outDir = outDir
      if(chunkSizeWarningLimit) config.build.chunkSizeWarningLimit = chunkSizeWarningLimit
    },
    configureServer: (server) => {
      const srcDir = faeConfig.srcDir!
      server.watcher.on('all', (event, path, stats) => {
        debounce(() => watchRoutes(server, event, path, srcDir), 150)()
        watchers.forEach(fn => fn(event, path, stats))
      })
      server.middlewares.use(async (req, res, next) => {
        // 处理html请求
        if(
          req.headers.accept?.includes('text/html') &&
          !req.url?.startsWith('/@vite') &&
          !req.url?.includes('.')
        ){
          let temp = resolve(process.cwd(), faeConfig.srcDir!, 'document.tsx')
          if(!existsSync(temp)){
            temp = resolve(__dirname, '..', 'template', 'document.tsx')
          }
          const module = (await dynamicImport(temp)).default
          // 将document.tsx模版转换为html字符串
          let html = renderToString(createElement(module, {
            // 这儿的./fae.tsx是在alias中配置的别名
            entry: createElement('script', {
              type: 'module',
              src: './fae.tsx'
            })
          }))
          // 将html交给vite处理(必须，否则热更新等功能无法使用且会报错)
          html = await server.transformIndexHtml(req.url!, html)
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
        }else{
          next()
        }
      })
    }
  }
}