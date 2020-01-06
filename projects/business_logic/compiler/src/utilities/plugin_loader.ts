import { OctopackBuildPluginModel } from '../../../config_resolver';
import { MapLike } from '../../../../../typings/common';
import { typescript } from '../../../plugins/typescript';
import { npmInstall } from '../../../plugins/npm_installer';
import { OctoPackBuildPlugin } from '../../../models';

export function loadPlugin(plugin: OctopackBuildPluginModel): OctoPackBuildPlugin {
	if (typeof plugin === 'string') {
		return initializePlugin(plugin, {});
	} else {
		return initializePlugin(plugin.name, plugin.arguments);
	}
}

function initializePlugin(name: string, args: MapLike<any>): OctoPackBuildPlugin {
	switch (name) {
		case 'typescript':
			return typescript(args);
		case 'npmInstall':
			return npmInstall(args);
		default:
			throw new Error(`Plugin ${name} not found`);
	}
}
