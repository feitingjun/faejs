import { definePlugin } from "../../core/define.js";
import { resolve } from 'path';
const __dirname = import.meta.dirname;
export default definePlugin({
    setup({ addEntryImport, addExport, addAppConfigType, addPageConfigType }) {
        addEntryImport({ source: resolve(__dirname, 'fixContext') });
        addExport({
            specifier: 'AliveScope',
            source: resolve(__dirname, 'aliveScope')
        });
        addExport({
            specifier: 'KeepAlive',
            source: resolve(__dirname, 'keepAlive')
        });
        addExport({
            specifier: ['useAliveController', 'useActivate', 'useUnactivate'],
            source: resolve(__dirname, 'hooks')
        });
        addAppConfigType({
            specifier: ['KeepAliveAppTypes'],
            source: resolve(__dirname, 'runtime')
        });
        addPageConfigType({
            specifier: ['KeepAlivePageConfig'],
            source: resolve(__dirname, 'runtime')
        });
    },
    runtime: resolve(__dirname, 'runtime')
});
