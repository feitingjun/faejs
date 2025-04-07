#!/usr/bin/env node
import { Command } from 'commander'
import dev from './dev'
import create from './create'
import build from './build'
import preview from './preview'

const program = new Command()

/**创建项目 */
program
.command('create')
.action(() => create())

/**启动项目 */
program
.command('dev')
.action(() => dev())

/**打包项目 */
program
.command('build')
.action(() => build())

/**预览项目 */
program
.command('preview')
.action(() => preview())

program.parse(process.argv)