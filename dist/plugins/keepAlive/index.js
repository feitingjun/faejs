import { definePlugin } from "../../core/define.js";
import { resolve } from 'path';
const __dirname = import.meta.dirname;
export default definePlugin({
    name: 'fae-keep-alive',
    setup({ addEntryImport, addExport }) {
        addEntryImport({ source: resolve(__dirname, 'fixContext') });
        addExport({
            specifier: 'AliveScope',
            source: resolve(__dirname, 'aliveScope'),
        });
        addExport({
            specifier: 'KeepAlive',
            source: resolve(__dirname, 'keepAlive'),
        });
        addExport({
            specifier: ['useAliveController', 'useActivate', 'useUnactivate'],
            source: resolve(__dirname, 'context'),
        });
    },
    // runtime: resolve(import.meta.dirname, 'runtime.tsx')
});
//# sourceMappingURL=index.js.map