import { FileSystem as FileSystemEntryData } from 'file_system';
import { OctopackConfiguration } from './configuration';
import { join } from 'path';
import { objectUtils } from 'utilities';

export const OCTOPACK_CONFIG_FILE_NAME = 'octopack.js';

export async function findConfiguration(
	cwd: string,
	fileSystem: FileSystemEntryData
): Promise<{ config: OctopackConfiguration; directory: string }> {
	const segments = cwd.split('/');
	while (segments.length) {
		const path = segments.join('/');

		if (await fileSystem.exists(join(path, OCTOPACK_CONFIG_FILE_NAME))) {
			return { config: await loadConfig(path, fileSystem), directory: path };
		} else {
			segments.pop();
		}
	}
	return { directory: '/', config: undefined };
}

export function resolveConfig(configs: {
	solution?: OctopackConfiguration;
	workspace?: OctopackConfiguration;
	project?: OctopackConfiguration;
}): OctopackConfiguration {
	return objectUtils.deepAssign(
		{
			build: undefined,
			configVersion: undefined,
			name: undefined,
			scope: undefined
		},
		configs.solution,
		configs.workspace,
		configs.project
	);
}

export async function loadConfig(path: string, fileSystem: FileSystemEntryData): Promise<OctopackConfiguration> {
	const config: OctopackConfiguration = await fileSystem.import(join(path, OCTOPACK_CONFIG_FILE_NAME));
	if (!config && !(config as any).default) {
		throw new Error(`Invalid octopack configuration at ${path}. No configuration returned`);
	}
	// telling typescript to ignore this because we normalize the object
	if ((config as any).default) {
		//@ts-ignore
		config = config.default;
	}

	return config;
}
