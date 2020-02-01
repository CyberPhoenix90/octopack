import { MapLike } from '../../../../../typings/common';
import { FileSystem } from 'projects/libraries/file_system/dist';
export interface BundleOptions {
    entry: string;
    moduleName: string;
    externals: MapLike<string>;
    mode?: 'development' | 'none' | 'production';
}
declare class Webpack {
    createBundle(fileSystem: FileSystem, options: BundleOptions): Promise<string>;
}
export declare const webpack: Webpack;
export {};
//# sourceMappingURL=webpack.d.ts.map