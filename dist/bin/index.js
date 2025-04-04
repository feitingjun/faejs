#!/usr/bin/env node
import { Command } from 'commander';
import dev from "./dev.js";
import create from "./create.js";
import build from "./build.js";
const program = new Command();
/**创建项目 */
program
    .command('create')
    .action(() => create());
/**启动项目 */
program
    .command('dev')
    .action(() => dev());
/**打包项目 */
program
    .command('build')
    .action(() => build());
program.parse(process.argv);
//# sourceMappingURL=index.js.map