module.exports = {
	name: 'server',
	scope: 'project',
	configVersion: '1',
	build: {
		platform: 'node',
		assembly: 'executable',
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
