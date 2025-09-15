import { preview } from 'vite';
import config from "./config.js";
export default async function previewApp() {
    const server = await preview(config);
    server.printUrls();
    server.bindCLIShortcuts({ print: true });
}
