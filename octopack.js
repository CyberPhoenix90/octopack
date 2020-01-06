module.exports = {
	name: 'octopack',
	scope: 'workspace',
	configVersion: '1',
	bundles: ['dist'],
	settings: {
		nodeJsEngine: '13.5.0'
	},
	build: {
		bundles: {
			dist: {
				default: true,
				input: ['src/**/*.ts', 'src/**/*.tsx'],
				output: 'dist',
				compilation: {
					init: ['npmInstall'],
					link: [],
					compile: ['typescript']
				}
			}
		}
	}
};
