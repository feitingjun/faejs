import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { loadConfigAndCreateContext, codegen } from '@pandacss/node';
import { definePlugin } from "../../core/define.js";
const indexTml = `
export * from './css'
export * from './jsx'
export * from './patterns'
export * from './tokens'
`.trim();
const configTml = `
import { defineConfig } from '@pandacss/dev'

export default defineConfig({

})
`.trim();
const generate = async (configPath, srcDir, outPath) => {
    const ctx = await loadConfigAndCreateContext({
        configPath,
        cwd: process.cwd(),
        config: {
            include: [`./${srcDir}/**/*.{js,jsx,ts,tsx}`],
            exclude: [`./${srcDir}/.fae/**/*`, 'node_modules'],
            jsxFramework: 'react',
            outdir: outPath
        }
    });
    await codegen(ctx);
};
export default definePlugin({
    setup: ({ context: { userConfig, srcDir }, addWatch, addFile }) => {
        let { pandacss } = userConfig;
        if (!pandacss)
            return;
        if (typeof pandacss === 'boolean') {
            pandacss = 'panda.config.ts';
        }
        const configPath = resolve(process.cwd(), pandacss);
        const outPath = join(srcDir, '.fae/pandacss');
        if (!existsSync(configPath)) {
            addFile({
                content: configTml,
                outPath: resolve(process.cwd(), configPath)
            });
        }
        // 生成pandacss文件
        generate(configPath, srcDir, outPath);
        addWatch((event, path) => {
            // 配置文件变化时重新生成
            if (path === configPath && (event === 'add' || event === 'change')) {
                generate(configPath, srcDir, outPath);
            }
        });
        addFile({
            content: indexTml,
            outPath: `${outPath}/index.ts`
        });
    }
});
//# sourceMappingURL=index.js.map