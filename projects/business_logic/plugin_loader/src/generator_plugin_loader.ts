import { MapLike } from '../../../../typings/common';
import { OctopackBuildPluginModel } from 'config_resolver';
import { OctoPackGeneratorPlugin } from 'models';
import { tsconfigMappingGenerator } from 'tsconfig_mapping_generator';

export function loadGeneratorPlugin(plugin: OctopackBuildPluginModel): OctoPackGeneratorPlugin {
	if (typeof plugin === 'string') {
		return initializeGeneratorPlugin(plugin, {});
	} else {
		return initializeGeneratorPlugin(plugin.name, plugin.config);
	}
}

function initializeGeneratorPlugin(name: string, config: MapLike<any>): OctoPackGeneratorPlugin {
	switch (name) {
		case 'tsconfigMappingGenerator':
			return tsconfigMappingGenerator(config);
		default:
			throw new Error(`Generator Plugin ${name} not found`);
	}
}
