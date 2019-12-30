import { FileSystem } from '../../file_system';
import { OctopackConfiguration } from './configuration';
export declare const OCTOPACK_CONFIG_FILE_NAME = "octopack.js";
export declare function findConfiguration(cwd: string, fileSystem: FileSystem): Promise<{
    config: OctopackConfiguration;
    directory: string;
}>;
