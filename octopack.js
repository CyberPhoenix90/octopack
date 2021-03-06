module.exports = {
	name: 'octopack',
	scope: 'workspace',
	configVersion: '1',
	bundles: ['dist'],
	run: {
		nodeJsEngine: '13.5.0',
		restartOnExitWithError: false,
		defaultArguments: [],
		watch: false
	},
	host: {
		openBrowser: true,
		port: 8888,
		ip: 'localhost',
		hotreload: true
	},
	generator: ['tsconfigMappingGenerator'],
	build: {
		bundles: {
			dist: {
				default: true,
				input: ['src/**/*.ts', 'src/**/*.tsx'],
				output: 'dist',
				compilation: {
					init: ['npmInstall'],
					link: ['projectImporter'],
					preProcess: [
						'metaProgramming',
						{
							name: 'barrelFile',
							config: {
								optMode: 'out',
								pragma: '@ignore',
								output: 'src/index.ts'
							}
						}
					],
					compile: ['typescript'],
					emit: [{ name: 'runtime', config: { out: 'src/index.js', handleExisting: 'prepend' } }]
				}
			}
		}
	}
};
