#!/usr/bin/env node
import { Command } from 'commander'
import dev from './dev'
import create from './create'
import build from './build'

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

program.parse(process.argv)