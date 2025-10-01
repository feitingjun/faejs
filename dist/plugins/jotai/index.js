import { resolve } from 'path';
import { definePlugin } from "../../core/define.js";
export default definePlugin({
    setup: ({ addExport }) => {
        addExport({
            specifier: ['atom', 'useAtom'],
            source: resolve(import.meta.dirname, 'jotai')
        });
    }
});
//# sourceMappingURL=index.js.map