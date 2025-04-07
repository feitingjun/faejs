import { build, mergeConfig } from 'vite';
import config from "./config.js";
export default async function buildApp() {
    await build(mergeConfig(config, {
        logLevel: 'info',
    }));
}
//# sourceMappingURL=build.js.map