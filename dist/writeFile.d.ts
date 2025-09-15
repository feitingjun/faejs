import { RouteManifest, AddFileOptions, MakePropertyOptional } from './core/types';
/**写入package.json文件 */
export declare function writePackageJson(root: string, description: string): void;
/**写入tsconfig.json文件 */
export declare function writeTsConfigJson(root: string, srcDir: string): void;
/**写入faerc.ts文件 */
export declare function writeFaercTs(root: string, srcDir: string): void;
/**写入app.ts文件 */
export declare function writeAppTs(root: string, srcDir: string): void;
/**写入page.tsx文件 */
export declare function writeIndexPageTsx(root: string, srcDir: string): void;
/**创建.fae/index.ts文件 */
export declare function writeFaeIndexts(outDir: string, exports?: AddFileOptions[]): void;
/**创建.fae/entry.tsx文件 */
export declare function writeEntryTsx(outDir: string, data: {
    imports: MakePropertyOptional<AddFileOptions, 'specifier'>[];
    aheadCodes: string[];
    tailCodes: string[];
}): void;
/**写入.fae/types.ts */
export declare function writeFaeTypesTs(outDir: string, pageConfigTypes?: AddFileOptions[], appConfigTypes?: AddFileOptions[]): void;
/**写入.fae/define.ts */
export declare function writeFaeDefineTs(outDir: string): void;
/**写入.fae/manifest.ts */
export declare function writeFaeRoutesTs(outDir: string, manifest: RouteManifest): void;
/**写入.fae/runtimes.ts */
export declare function wirteRuntime(outDir: string, runtimes?: string[]): void;
/**写入.fae/typings.d.ts */
export declare function wirteTypings(outDir: string): void;
/**写入index.html */
export declare function writeIndexHtml(root: string): void;
/**创建临时文件夹 */
export declare function createTmpDir({ root, srcDir, options }: {
    root: string;
    srcDir: string;
    options: {
        manifest?: RouteManifest;
        pageConfigTypes: AddFileOptions[];
        appConfigTypes: AddFileOptions[];
        exports: AddFileOptions[];
        imports: MakePropertyOptional<AddFileOptions, 'specifier'>[];
        aheadCodes: string[];
        tailCodes: string[];
        runtimes: string[];
    };
}): void;
