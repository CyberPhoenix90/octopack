export default {
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
				input: ['src/**/*.ts', 'src/**/*.tsx'],
				output: 'dist',
				compilation: {
					init: ['npmInstaller'],
					link: ['projectImporter', 'codeImporter'],
					compile: ['typescript']
				}
			}
		}
	}
};
