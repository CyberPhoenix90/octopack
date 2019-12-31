#!/usr/bin/env node

import { findConfiguration, OctopackConfiguration } from '../../libraries/config_resolver';
import { localDiskFileSystem } from '../../libraries/file_system';
import { join } from 'path';
import { Build } from '../../libraries/api';
import { Logger } from '../../libraries/logger/dist';

//Self executing async function due to lack of top level async support
(async () => {
	const { config, directory: firstDirectory } = await findConfiguration(process.cwd(), localDiskFileSystem);
	if (config === undefined) {
		notFound();
	}

	if (config.scope !== 'workspace') {
		const { config, directory } = await findConfiguration(join(firstDirectory, '..'), localDiskFileSystem);

		if (config === undefined) {
			notFound();
		}

		if (config.scope !== 'workspace') {
			console.error(`Expected to find workspace scope but found ${config.scope} at ${directory}`);
			process.exit(-1);
		}
		runScript(config);
	} else {
		runScript(config);
	}
})();

function notFound() {
	console.error(`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`);
	process.exit(-1);
}

function runScript(config: OctopackConfiguration) {
	new Build().run(
		{},
		{
			fileSystem: localDiskFileSystem,
			devLogger: new Logger(),
			uiLogger: new Logger(),
			workspaceConfig: config
		}
	);
}
