import { FileSystem as FileSystemEntryData } from '../../../libraries/file_system';
import { OctopackConfiguration } from './configuration';
export declare const OCTOPACK_CONFIG_FILE_NAME = "octopack.js";
export declare function findConfiguration(cwd: string, fileSystem: FileSystemEntryData): Promise<{
    config: OctopackConfiguration;
    directory: string;
}>;
export declare function loadConfig(path: string, fileSystem: FileSystemEntryData): Promise<OctopackConfiguration>;
//# sourceMappingURL=config_resolver.d.ts.map