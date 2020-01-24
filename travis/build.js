#!/usr/bin/env node
const { join } = require('path');
const { spawn, spawnSync } = require('child_process');

spawnSync('npm', ['install'], {
	cwd: join(__dirname, '../projects/libraries/file_system')
});

spawnSync('npm', ['install'], {
	cwd: join(__dirname, '../projects/business_logic/plugins/output_plugin')
});

const { Build } = require('../projects/api');
const { Logger } = require('../projects/libraries/logger');
const { localDiskFileSystem } = require('../projects/libraries/file_system');
const { loadConfig } = require('../projects/business_logic/config_resolver');

(async () => {
	new Build()
		.run(
			{
				raw: [],
				list: [],
				map: {}
			},
			{
				workspaceRoot: join(__dirname, '..'),
				workspaceConfig: await loadConfig(join(__dirname, '..'), localDiskFileSystem),
				fileSystem: localDiskFileSystem,
				devLogger: new Logger({ adapters: [], enhancers: [] }),
				uiLogger: new Logger({ adapters: [], enhancers: [] })
			}
		)
		.then(() => {
			spawn(join(__dirname, '../projects/libraries/logger/node_modules/mocha/bin/mocha'), ['**/*.spec.js'], {
				stdio: 'inherit',
				cwd: join(__dirname, '../projects/libraries/logger/dist/test')
			});
		});
})();
