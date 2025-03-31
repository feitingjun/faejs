#!/usr/bin/env node
import { Command } from 'commander';
import dev from "./dev.js";
import create from "./create.js";
const program = new Command();
/**创建项目 */
program
    .command('create')
    .action(() => create());
/**启动项目 */
program
    .command('dev')
    .action(() => dev());
program.parse(process.argv);
//# sourceMappingURL=index.js.map