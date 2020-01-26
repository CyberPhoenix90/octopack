module.exports = {
	name: 'server',
	scope: 'project',
	configVersion: '1',
	platform: 'node',
	assembly: 'executable',
	build: {
		bundles: {
			dist: {
				compilation: {
					emit: [
						{
							name: 'runtime',
							config: {
								out: 'dist/src/index.js',
								handleExisting: 'replace',
								footer: 'require("./main.js")'
							}
						}
					]
				}
			}
		}
	}
};
