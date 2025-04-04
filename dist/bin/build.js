import { build as viteBuild, mergeConfig } from 'vite';
import config from "./config.js";
export default async function build() {
    await viteBuild(mergeConfig(config, {
        logLevel: 'info',
    }));
}
//# sourceMappingURL=build.js.map