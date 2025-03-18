import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { input } from '@inquirer/prompts';
import { chalk } from "../utils.js";
import { writePackageJson, writeTsConfigJson, writeFaercTs, writeAppTs, writeIndexPageTsx } from "../writeFile.js";
export default async function createApp() {
    const projectName = await input({ message: '请输入项目名称', default: 'my-app' });
    const srcDir = await input({ message: '请输入src文件夹名称', default: 'src' });
    const description = await input({ message: '请输入项目描述' });
    // 判断文件夹是否存在
    if (existsSync(projectName)) {
        console.log(chalk.red(`${projectName}文件夹已存在`));
        return;
    }
    // 项目跟目录
    const root = join(process.cwd(), projectName);
    // 创建项目目录
    mkdirSync(join(process.cwd(), projectName, srcDir), { recursive: true });
    // 创建package.json文件
    writePackageJson(root, description);
    // 创建tsconfig.json文件
    writeTsConfigJson(root, srcDir);
    // 创建.faerc.ts文件
    writeFaercTs(root, srcDir);
    // 创建src/app.ts文件
    writeAppTs(root, srcDir);
    // 创建page.tsx文件
    writeIndexPageTsx(root, srcDir);
    console.log(chalk.green(`项目${projectName}创建成功`));
}
//# sourceMappingURL=create.js.map