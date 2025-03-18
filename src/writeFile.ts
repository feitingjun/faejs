import { existsSync, mkdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { renderHbsTpl } from './hbs'
import { RouteManifest, AddFileOptions, MakePropertyOptional } from './core/types'
import { deepClone } from './utils'

const __dirname = import.meta.dirname
const TML_DIR = resolve(__dirname, 'template')

/**写入package.json文件 */
export function writePackageJson(root:string, description:string){
  const packageJson = readFileSync(resolve(__dirname, '../', 'package.json'), 'utf-8')
  const { version } = JSON.parse(packageJson)
  const path = root.split('/') 
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'package.json.hbs'),
    outPath: resolve(root, 'package.json'),
    data: { projectName: path[path.length - 1], description, version }
  })
}

/**写入tsconfig.json文件 */
export function writeTsConfigJson(root:string, srcDir:string){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'tsconfig.json.hbs'),
    outPath: resolve(root, 'tsconfig.json'),
    data: { srcDir, srcDirRoot: srcDir.split('/')[0] }
  })
}

/**写入faerc.ts文件 */
export function writeFaercTs(root:string, srcDir:string){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, '.faerc.ts.hbs'),
    outPath: resolve(root, '.faerc.ts'),
    data: { srcDir }
  })
}

/**写入app.ts文件 */
export function writeAppTs(root:string, srcDir:string){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'app.ts.hbs'),
    outPath: resolve(root, srcDir, 'app.ts'),
  })
}

/**写入page.tsx文件 */
export function writeIndexPageTsx(root:string, srcDir:string){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'page.tsx.hbs'),
    outPath: resolve(root, srcDir, 'page.tsx'),
  })
}

/**创建.fae/index.ts文件 */
export function writeFaeIndexts(tmpDir:string, exports?:AddFileOptions[]){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'index.ts.hbs'),
    outPath: resolve(tmpDir, 'index.ts'),
    data: { exports }
  })
}
/**创建.fae/entry.tsx文件 */
export function writeEntryTsx(
  tmpDir:string,
  data:{
    imports: MakePropertyOptional<AddFileOptions, 'specifier'>[]
    aheadCodes: string[],
    tailCodes: string[]
  }
){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'entry.tsx.hbs'),
    outPath: resolve(tmpDir, 'entry.tsx'),
    data: {
      ...data,
      srcDir: resolve(tmpDir, '..')
    }
  })
}

/**写入.san/types.ts */
export function writeFaeTypesTs(
  tmpDir: string,
  pageConfigTypes: AddFileOptions[]=[],
  appConfigTypes: AddFileOptions[]=[]
){
  const all = deepClone([...pageConfigTypes, ...appConfigTypes]).reduce((acc, item) => {
    const index = acc.findIndex(v => v.source === item.source)
    if(index > -1 && Array.isArray(item.specifier) && Array.isArray(acc[index].specifier)) {
      acc[index].specifier = [...acc[index].specifier, ...item.specifier]
    }else{
      acc.push(item)
    }
    return acc
  }, [] as AddFileOptions[])
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'types.ts.hbs'),
    outPath: resolve(tmpDir, 'types.ts'),
    data: { all, pageConfigTypes, appConfigTypes }
  })
}

/**写入.san/define.ts */
export function writeFaeDefineTs(tmpDir: string){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'define.ts.hbs'),
    outPath: `${tmpDir}/define.ts`,
    data: {
      srcDir: resolve(tmpDir, '..')
    }
  })
}

/**写入.fae/manifest.ts */
export function writeFaeRoutesTs(
  tmpDir: string,
  manifest: RouteManifest
){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'manifest.ts.hbs'),
    outPath: resolve(tmpDir, 'manifest.ts'),
    data: { manifest: Object.values(manifest).sort((a, b) => {
      const nA = a.id.replace(/\/?layout/, ''), nB = b.id.replace(/\/?layout/, '')
      return nA.length === nB.length ? b.id.indexOf('layout') : nA.length - nB.length
    }) }
  })
}

/**写入.san/runtimes.ts */
export function wirteRuntime(tmpDir: string, runtimes?: string[]){
  renderHbsTpl({
    sourcePath: resolve(TML_DIR, 'runtime.ts.hbs'),
    outPath: resolve(tmpDir, 'runtime.ts'),
    data: { runtimes }
  })
}

/**创建临时文件夹 */
export function createTmpDir({ root, srcDir, options }:{
  root:string
  srcDir:string
  options: {
    manifest?: RouteManifest
    pageConfigTypes: AddFileOptions[]
    appConfigTypes: AddFileOptions[]
    exports: AddFileOptions[]
    imports: MakePropertyOptional<AddFileOptions, 'specifier'>[]
    aheadCodes: string[]
    tailCodes: string[]
    runtimes: string[]
  }
}){
  const { manifest={}, pageConfigTypes, appConfigTypes, exports, imports, aheadCodes, tailCodes, runtimes } = options
  const tmpDir = resolve(root, srcDir, '.fae')
  if(!existsSync(tmpDir)){
    mkdirSync(tmpDir, { recursive: true })
  }
  // 创建.fae/index.ts文件
  writeFaeIndexts(tmpDir, exports)
  // 创建.fae/entry.tsx
  writeEntryTsx(tmpDir, {
    imports, aheadCodes, tailCodes
  })
  // 创建.fae/types.ts
  writeFaeTypesTs(tmpDir, pageConfigTypes, appConfigTypes)
  // 创建.fae/define.ts
  writeFaeDefineTs(tmpDir)
  // 创建.fae/routes.ts
  writeFaeRoutesTs(tmpDir, manifest)
  // 创建.fae/runtime.tsx
  wirteRuntime(tmpDir, runtimes)
}