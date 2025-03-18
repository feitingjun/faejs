import { readFileSync, writeFileSync } from 'fs'
import hbs from 'handlebars'
import { chalk } from './utils'

hbs.registerHelper('isArray', function(this:any, value, options){
  return hbs.Utils.isArray(value) ? options.fn(this) : options.inverse(this)
})
hbs.registerHelper('isString', function(this:any, value, options){
  return typeof value === 'string' ? options.fn(this) : options.inverse(this)
})
hbs.registerHelper('isEqual', function(value1, value2){
  return value1 === value2
})
hbs.registerHelper('and', function(value1, value2){
  return value1 && value2
})
hbs.registerHelper('or', function(value1, value2){
  return value1 || value2
})
hbs.registerHelper('rmTsx', function(value){
  return value.replace(/\.tsx$/, '')
})
hbs.registerHelper('boolean', function(value){
  return !!value
})
hbs.registerHelper('repeat', function(num, str){
  return str.repeat(num)
})
hbs.registerHelper('space', function(value){
  if(typeof value !== 'number'){
    value = 1
  }
  return ' '.repeat(value)
})

/**根据handlebars模板写入文件 */
export const renderHbsTpl = ({
  sourcePath,
  outPath,
  data = {}
}: {
  sourcePath: string
  outPath: string
  data?: object
}) => {
  const rendered = hbs.compile(readFileSync(sourcePath, 'utf-8'))(data)
  if (rendered) {
    writeFileSync(outPath, rendered)
  } else {
    console.log(chalk.red(`加载模板文件失败: ${sourcePath}`))
  }
}