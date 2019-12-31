module.exports = {
	ip: '0.0.0.0',
	port: 2500,
	peers: ['127.0.0.1:2501'],
	services: {
		sharedCache: {
			diskUseLimit: '1gb'
		},
		runScripts: {
			threadLimit: 4,
			whitelist: ['deploy', 'build', 'test']
		}
	}
};
