import { definePlugin } from "../../core/define.js";
import { resolve } from 'path';
export default definePlugin({
    setup: ({ addPageConfigType, addExport, addAppConfigType }) => {
        addPageConfigType({
            specifier: ['AccessPageConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addExport({
            specifier: ['useAuth', 'Access', 'AccessHC', 'useAccess'],
            source: resolve(import.meta.dirname, 'runtime')
        });
        addAppConfigType({
            specifier: ['AccessAppConfig'],
            source: resolve(import.meta.dirname, 'runtime')
        });
    },
    runtime: resolve(import.meta.dirname, 'runtime')
});
//# sourceMappingURL=index.js.map