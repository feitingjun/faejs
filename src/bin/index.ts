#!/usr/bin/env node
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { input } from '@inquirer/prompts'
import { chalk } from '../utils'
import {
  writePackageJson,
  writeTsConfigJson,
  writeAppTs,
  writeViteConfigTs,
  writeIndexPageTsx,
  writeIndexHtml
} from '../writeFile'

async function createApp() {
  const projectName = await input({
    message: '请输入项目名称',
    default: 'my-app'
  })
  const srcDir = await input({ message: '请输入src文件夹名称', default: 'src' })
  const description = await input({ message: '请输入项目描述' })
  // 判断文件夹是否存在
  if (existsSync(projectName)) {
    console.log(chalk.red(`${projectName}文件夹已存在`))
    return
  }
  // 项目跟目录
  const root = join(process.cwd(), projectName)
  // 创建项目目录
  mkdirSync(join(process.cwd(), projectName, srcDir), { recursive: true })
  // 创建package.json文件
  writePackageJson(root, description)
  // 创建tsconfig.json文件
  writeTsConfigJson(root, srcDir)
  // 创建vite.config.ts文件
  writeViteConfigTs(root)
  // 创建index.html文件
  writeIndexHtml(root)
  // 创建src/app.tsx文件
  writeAppTs(root, srcDir)
  // 创建page.tsx文件
  writeIndexPageTsx(root, srcDir)
  console.log(chalk.green(`项目${projectName}创建成功`))
}

createApp()
