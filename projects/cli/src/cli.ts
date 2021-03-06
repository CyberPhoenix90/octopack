#!/usr/bin/env node

import { Build, Generate, Host, Run, Test, Deploy } from 'api';
import { parseArguments } from 'argument_parser';
import { findConfiguration, OctopackConfiguration } from 'config_resolver';
import { localDiskFileSystem } from 'file_system';
import {
	CallbackLoggerAdapter,
	ConsoleLoggerAdapter,
	Logger,
	LogLevelPrependerLoggerEnhancer,
	WriteFileLoggerAdapter
} from 'logger';
import { join } from 'path';

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
	console.error(
		`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`
	);
	process.exit(-1);
}

function runScript(config: OctopackConfiguration, workspaceRoot: string) {
	const devLogger = new Logger({
		adapters: [new WriteFileLoggerAdapter(join(__dirname, '../log.txt'))],
		enhancers: [new LogLevelPrependerLoggerEnhancer()]
	});
	const uiLogger = new Logger({
		adapters: [
			new ConsoleLoggerAdapter(),
			new CallbackLoggerAdapter((log) => devLogger.log(log.text ?? log.object, log.logLevel))
		],
		enhancers: [new LogLevelPrependerLoggerEnhancer()]
	});

	if (process.argv[2] === 'build') {
		new Build().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else if (process.argv[2] === 'generate') {
		new Generate().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else if (process.argv[2] === 'run') {
		new Run().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else if (process.argv[2] === 'host') {
		new Host().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else if (process.argv[2] === 'test') {
		new Test().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else if (process.argv[2] === 'deploy') {
		new Deploy().run(parseArguments(process.argv.slice(3)), {
			workspaceRoot,
			fileSystem: localDiskFileSystem,
			devLogger: devLogger,
			uiLogger: uiLogger,
			workspaceConfig: config
		});
	} else {
		if (process.argv[2]) {
			uiLogger.error(`Could not find script ${process.argv[2]}`);
		} else {
			uiLogger.error(`No script specified`);
		}
	}
}
