import { definePlugin } from "../../core/define.js";
import { resolve } from 'path';
export default definePlugin({
    name: 'fae-react-activation',
    setup({ addExport, addEntryImport, addPageConfigType, addAppConfigType }) {
        addPageConfigType({
            specifier: ['KeepAlivePageConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addAppConfigType({
            specifier: ['KeepAliveAppConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addExport({
            specifier: [
                'KeepAlive',
                'AliveScope',
                'withActivation',
                'useActivate',
                'useUnactivate',
                'useAliveController',
                'withAliveScope'
            ],
            source: 'react-activation'
        });
        addExport({
            specifier: ['CachingNode'],
            source: 'react-activation',
            type: true
        });
        addExport({
            specifier: ['useCachingNodes'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addEntryImport({
            source: resolve(import.meta.dirname, 'fixContext')
        });
    },
    runtime: resolve(import.meta.dirname, 'runtime.tsx')
});
//# sourceMappingURL=index.js.map