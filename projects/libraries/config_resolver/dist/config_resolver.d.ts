import { FileSystem } from '../../file_system';
import { OctopackConfiguration } from './configuration';
export declare function findConfiguration(cwd: string, fileSystem: FileSystem): Promise<OctopackConfiguration>;
