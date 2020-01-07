import { MapLike } from '../../../../typings/common';
import { OctopackBuildPluginModel } from 'config_resolver';
import { OctoPackBuildPlugin } from 'models';
import { npmInstall } from 'npm_installer';
import { projectImporter } from 'project_importer';
import { typescript } from 'typescript_plugin';

export function loadBuildPlugin(plugin: OctopackBuildPluginModel): OctoPackBuildPlugin {
	if (typeof plugin === 'string') {
		return initializePlugin(plugin, {});
	} else {
		return initializePlugin(plugin.name, plugin.arguments);
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
		default:
			throw new Error(`Plugin ${name} not found`);
	}
}
