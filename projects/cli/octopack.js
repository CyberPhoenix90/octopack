module.exports = {
	name: 'cli',
	scope: 'project',
	configVersion: '1',
	platform: 'node',
	assembly: 'library',
	deploy: {
		deployDir: 'deploy'
	},
	build: {
		bundles: {
			dist: {
				compilation: {
					emit: [
						{
							name: 'runtime',
							config: {
								out: 'dist/index.js',
								header: '#!/usr/bin/env node',
								footer: 'require("./cli.js")',
								handleExisting: 'replace'
							}
						}
					]
				}
			}
		}
	}
};
