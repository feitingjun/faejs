import { resolve, basename, extname, dirname } from 'path'
import { globSync } from 'glob'
import { definePlugin } from '../../core/define'

const include = [
  'models/**/*.{ts,js}',
]

const getModels = (srcDir='src') => {
  srcDir = resolve(process.cwd(), srcDir)
  const files = globSync(include, { cwd: srcDir })
  return files.map(v => {
    const filename = basename(v, extname(v))
    return { name: filename, path: resolve(srcDir, dirname(v), filename) }
  })
}

export default definePlugin({
  name: 'fae-model',
  setup: ({
    context,
    addWatch,
    addFileTemplate,
    addExport
  }) => {
    addExport({
      specifier: ['useModel'],
      source: resolve(import.meta.dirname, 'context')
    })
    addFileTemplate({
      sourcePath: resolve(import.meta.dirname, 'model.ts.hbs'),
      outPath: resolve(import.meta.dirname, 'model.ts'),
      data: { models: getModels(context.srcDir) }
    })
    addWatch((event, path) => {
      const regex = new RegExp(`^${resolve(process.cwd(), context.srcDir)}/models/.*\.(ts|js)$`)
      if(['add', 'unlink'].includes(event) && regex.test(path)){
        addFileTemplate({
          sourcePath: resolve(import.meta.dirname, 'model.ts.hbs'),
          outPath: resolve(import.meta.dirname, 'model.ts'),
          data: {
            models: getModels(context.srcDir)
          }
        })
      }
    })
  },
  runtime: resolve(import.meta.dirname, 'runtime')
})