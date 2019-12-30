import { FileSystem } from '../../file_system';
import { OctopackConfiguration } from './configuration';

export async function findConfiguration(cwd: string, fileSystem: FileSystem): Promise<OctopackConfiguration> {
	console.log(fileSystem);
	return Promise.reject();
}
