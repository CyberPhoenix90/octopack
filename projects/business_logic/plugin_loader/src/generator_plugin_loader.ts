import { MapLike } from '../../../../typings/common';
import { OctopackBuildPluginModel } from 'config_resolver';
import { OctoPackGeneratorPlugin } from 'models';
import { tsconfigMappingGenerator } from 'tsconfig_mapping_generator';

export function loadGeneratorPlugin(plugin: OctopackBuildPluginModel): OctoPackGeneratorPlugin {
	if (typeof plugin === 'string') {
		return initializeGeneratorPlugin(plugin, {});
	} else {
		return initializeGeneratorPlugin(plugin.name, plugin.arguments);
	}
}

function initializeGeneratorPlugin(name: string, args: MapLike<any>): OctoPackGeneratorPlugin {
	switch (name) {
		case 'tsconfigMappingGenerator':
			return tsconfigMappingGenerator(args);
		default:
			throw new Error(`Generator Plugin ${name} not found`);
	}
}
