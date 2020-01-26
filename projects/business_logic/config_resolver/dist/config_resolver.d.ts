import { FileSystem as FileSystemEntryData } from 'file_system';
import { OctopackConfiguration } from './configuration';
import { MapLike } from 'typings/common';
export declare const OCTOPACK_CONFIG_FILE_NAME = "octopack.js";
export declare function findConfiguration(cwd: string, fileSystem: FileSystemEntryData): Promise<{
    config: OctopackConfiguration;
    directory: string;
}>;
export declare function resolveConfig(configs: {
    solution?: OctopackConfiguration;
    workspace?: OctopackConfiguration;
    project?: OctopackConfiguration;
}): OctopackConfiguration;
export declare function loadConfig(path: string, fileSystem: FileSystemEntryData): Promise<OctopackConfiguration>;
export declare function getBundle(config: OctopackConfiguration, candidates: MapLike<boolean>): string;
//# sourceMappingURL=config_resolver.d.ts.map