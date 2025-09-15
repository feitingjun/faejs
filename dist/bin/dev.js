import { createServer } from 'vite';
import { chalk, getLocalIp } from "../utils.js";
import config from "./config.js";
/**
 * 负责提供基础的开发服务器功能
 */
export default async function startDevServer() {
    const server = await createServer(config);
    server.listen().then(() => {
        const port = server.config.server.port;
        console.log('服务器启动成功：');
        console.log(`  - Local: ${chalk.green(`http://localhost:${port}`)}`);
        console.log(`  - Network: ${chalk.green(`http://${getLocalIp()}:${port}`)}\n`);
    }).catch((err) => {
        console.error('服务器启动失败：');
        console.error(err);
    });
}
