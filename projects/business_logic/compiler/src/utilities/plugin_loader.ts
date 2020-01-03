import { OctopackBuildPluginModel } from '../../../config_resolver';
import { MapLike } from '../../../../../typings/common';
import { typescript } from '../../../plugins/typescript';
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
		default:
			throw new Error(`Plugin ${name} not found`);
	}
}
