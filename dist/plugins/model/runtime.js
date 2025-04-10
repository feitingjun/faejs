import { jsx as _jsx } from "react/jsx-runtime";
import { defineRuntime } from "../../core/define.js";
import { useMemo } from 'react';
import { Provider } from './context';
// @ts-ignore
import { models as rawModels } from './model';
function ModelProviderWrapper(props) {
    const models = useMemo(() => {
        return Object.keys(rawModels).reduce((memo, key) => {
            // @ts-ignore
            memo[rawModels[key].namespace] = rawModels[key].model;
            return memo;
        }, {});
    }, []);
    return _jsx(Provider, { models: models, ...props, children: props.children });
}
export default defineRuntime(({ addProvider }) => {
    addProvider(({ children }) => {
        return _jsx(ModelProviderWrapper, { children: children });
    });
});
//# sourceMappingURL=runtime.js.map