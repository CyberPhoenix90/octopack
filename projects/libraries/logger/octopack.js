module.exports = {
	name: 'logger',
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
								out: 'dist/src/index.js',
								handleExisting: 'prepend'
							}
						}
					]
				}
			}
		}
	}
};
