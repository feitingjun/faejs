import { createServer } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { chalk, getLocalIp } from "../utils.js";
import core from "../core/index.js";
/**
 * 负责提供基础的开发服务器功能
 */
export default async function startDevServer(defaultPort = 8000) {
    const server = await createServer({
        mode: 'development',
        base: '/',
        publicDir: 'public',
        plugins: [
            core(),
            react({
                jsxRuntime: 'automatic'
            })
        ],
        server: {
            host: true,
            port: defaultPort,
            open: false,
            strictPort: false, // 端口被占用时，是否直接退出
        },
        logLevel: 'warn',
        envDir: resolve(process.cwd(), '.env'),
        envPrefix: 'FAE_',
        css: {
            modules: {
                scopeBehaviour: 'local',
                globalModulePaths: [/\.global\.(css|less|sass|scss)$/],
                generateScopedName: '[local]__[hash:base64:5]',
                localsConvention: 'camelCaseOnly'
            },
            postcss: 'postcss.config.ts'
        },
        build: {
            chunkSizeWarningLimit: 500
        }
    });
    server.listen().then(() => {
        const port = server.config.server.port;
        console.log(chalk.blue('服务器启动成功：'));
        console.log(`  - Local: ${chalk.green(`http://localhost:${port}`)}`);
        console.log(`  - Network: ${chalk.green(`http://${getLocalIp()}:${port}`)}\n`);
    }).catch((err) => {
        console.error('服务器启动失败：');
        console.error(err);
    });
}
//# sourceMappingURL=dev.js.map