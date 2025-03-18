import ts from 'typescript'
import fs from 'fs'
import { dirname, extname, resolve, join } from 'path'

/**
 * 判断是否需要添加后缀
 * 当引入的库名没有后缀名，但是目录中有对应的文件，需要添加后缀名
 * @param {string} dir 当前文件所在目录
 * @param {string} libname import 引入的库名
 * @returns 
 */
const needAddSuffix = (dir, libname) => {
  for (const ext of ['.js', '.ts', '/index.js', '/index.ts']) {
    const path = resolve(dir, libname + ext)
    if (fs.existsSync(path)) {
      return ext.replace('ts', 'js')
    }
  }
}

// 递归遍历入口
const getEntry = (dir) => {
  const files = fs.readdirSync(dir)
  const entry = []
  files.forEach(v => {
    const path = `${dir}/${v}`
    if (fs.statSync(path).isDirectory()) {
      entry.push(...getEntry(path))
    } else if (extname(path) === '.ts' || extname(path) === '.js') {
      entry.push(path)
    }
  })
  return entry
}

// 复制非 TypeScript 文件到输出目录
function copyNonTsFiles(srcDir, outDir) {
  fs.readdirSync(srcDir).forEach(file => {
    const fullPath = join(srcDir, file);
    const outPath = join(outDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // 如果是目录，递归复制
      if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath, { recursive: true });
      }
      copyNonTsFiles(fullPath, outPath);
    } else if (extname(fullPath) !== '.ts') {
      // 只复制非.ts 文件
      fs.copyFileSync(fullPath, outPath);
    }
  });
}

// 执行构建
const build = () => {
  // 读取 tsconfig.json
  const tsconfig = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config
  // 将tsconfig.json内容解析为ts.createProgram配置
  const options = ts.parseJsonConfigFileContent(tsconfig, ts.sys, import.meta.dirname).options
  const program = ts.createProgram({
    rootNames: getEntry('src'),
    options
  })
  program.emit(undefined, undefined, undefined, undefined, {
    after: [(ctx) => {
      return (file) => {
        const dir = dirname(file.fileName)
        const visitor = (node) => {
          const libname = node.moduleSpecifier?.text
          // 给 import x from 'x' 这种格式添加后缀名
          if(ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
            const ext = needAddSuffix(dir, libname)
            if(ext){
              // 更新导入声明
              return ts.factory.updateImportDeclaration(
                node,
                node.modifiers,
                node.importClause,
                ts.factory.createStringLiteral(libname + ext),
                node.attributes
              )
            }
          }
          // 给 export x from 'x' 这种格式添加后缀名
          if(ts.isExportDeclaration(node) && !node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            const ext = needAddSuffix(dir, libname)
            if(ext){
              return ts.factory.updateExportDeclaration(
                node,
                node.modifiers,
                node.isTypeOnly,
                node.exportClause,
                ts.factory.createStringLiteral(libname + ext),
                node.attributes
              )
            }
          }
          // 给 import('x') 这种格式添加后缀名
          if(ts.isCallExpression(node) && node.arguments?.[0] && ts.isStringLiteral(node.arguments[0]) && node.expression.getText() === 'import') {
            const ext = needAddSuffix(dir, node.arguments[0].text)
            if(ext){
              return ts.factory.updateCallExpression(
                node,
                node.expression,
                node.typeArguments,
                [ts.factory.createStringLiteral(node.arguments[0].text + ext)],
              )
            }
          }

          return ts.visitEachChild(node, visitor, ctx);
        }
        return ts.visitNode(file, visitor);
      }
    }]
  })
  copyNonTsFiles('src', 'dist')
  console.log(`\x1b[32m构建成功\x1b[0m`)
}
build()
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  console.log(`\x1b[32m开始监听文件变更\x1b[0m`)
  // 监听文件变更
  fs.watch('src', { recursive: true }, (_, filename) => {
    console.log(`文件 ${filename} 变更，重新构建`)
    build()
  })
}