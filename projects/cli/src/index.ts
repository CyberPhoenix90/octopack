#!/usr/bin/env node

import { findConfiguration } from '../../libraries/config_resolver';
import { localDiskFileSystem } from '../../libraries/file_system';

//Self executing async function due to lack of top level async support
(async () => {
	const config = await findConfiguration(process.cwd(), localDiskFileSystem);
	console.log(config);
})();
