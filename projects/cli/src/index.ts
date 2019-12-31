#!/usr/bin/env node

import { findConfiguration, OctopackConfiguration } from '../../libraries/config_resolver';
import { localDiskFileSystem } from '../../libraries/file_system';
import { join } from 'path';
import { Build } from '../../libraries/api';
import { Logger, CallbackLoggerAdapter, PassThroughLoggerEnhancer } from '../../libraries/logger';
import { parseArguments } from '../../libraries/argument_parser';

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
		runScript(config, directory);
	} else {
		runScript(config, firstDirectory);
	}
})();

function notFound() {
	console.error(`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`);
	process.exit(-1);
}

function runScript(config: OctopackConfiguration, workspaceRoot: string) {
	new Build().run(parseArguments(process.argv.slice(2)), {
		workspaceRoot,
		fileSystem: localDiskFileSystem,
		devLogger: new Logger({ adapters: [new CallbackLoggerAdapter(() => {})], enhancers: [PassThroughLoggerEnhancer] }),
		uiLogger: new Logger({ adapters: [new CallbackLoggerAdapter(() => {})], enhancers: [PassThroughLoggerEnhancer] }),
		workspaceConfig: config
	});
}
