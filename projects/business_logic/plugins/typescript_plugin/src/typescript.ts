import { MapLike } from '../../../../../typings/common';
import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { compile } from './typescript_compiler';

export function typescript(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		compile(model, context);
		return model;
	};
}
