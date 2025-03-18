import { AppContextType, PageConfig, DataLoadeContext, ManifestClient, AppConfig } from './types';
import { Runtime } from '../core/types';
export declare const useAppContext: <T extends Record<string, unknown>>() => AppContextType<T>;
export declare const useConfig: <T>() => T extends PageConfig<{}, unknown> ? T extends ({ ctx, data }: {
    ctx: DataLoadeContext;
    data: unknown;
}) => infer T_1 ? T_1 extends Promise<infer T_1_1> ? T_1_1 : T_1 : T : T;
export declare const useLoaderData: <T = unknown>() => import("./types").LoaderData<T>;
export declare const createApp: ({ manifest, app: appConfig, runtimes }: {
    manifest: ManifestClient;
    app: AppConfig;
    runtimes: Runtime[];
}) => void;
