module.exports = {
	name: 'cli',
	scope: 'project',
	configVersion: '1',
	build: {
		platform: 'node',
		assembly: 'library',
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
