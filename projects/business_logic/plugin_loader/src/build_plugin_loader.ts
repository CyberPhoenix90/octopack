import { MapLike } from '../../../../typings/common';
import { OctopackBuildPluginModel } from 'config_resolver';
import { OctoPackBuildPlugin } from 'models';
import { npmInstall } from 'npm_installer';
import { projectImporter } from 'project_importer';
import { typescript } from 'typescript_plugin';
import { metaProgramming } from 'meta_programming';
import { barrelFile } from 'barrel_file';
import { output } from 'output_plugin';
import { runtime } from 'runtime';

export function loadBuildPlugin(plugin: OctopackBuildPluginModel): OctoPackBuildPlugin {
	if (typeof plugin === 'string') {
		return initializePlugin(plugin, {});
	} else {
		return initializePlugin(plugin.name, plugin.config);
	}
}

function initializePlugin(name: string, args: MapLike<any>): OctoPackBuildPlugin {
	switch (name) {
		case 'projectImporter':
			return projectImporter(args);
		case 'typescript':
			return typescript(args);
		case 'npmInstall':
			return npmInstall(args);
		case 'metaProgramming':
			return metaProgramming(args);
		case 'barrelFile':
			return barrelFile(args);
		case 'output':
			return output(args);
		case 'runtime':
			return runtime(args);
		default:
			throw new Error(`Plugin ${name} not found`);
	}
}
