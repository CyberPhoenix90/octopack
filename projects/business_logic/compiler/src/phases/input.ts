import { ScriptContext, CompilerModel } from '../../../models';

export async function inputPhase(model: CompilerModel, context: ScriptContext): Promise<CompilerModel> {
	for (const p of model.projectsBuildData) {
		for (const pattern of p.project.resolvedConfig.build.bundles.dist.input) {
			const matches = await context.fileSystem.glob(p.project.path, pattern);
			p.files.push(...(await Promise.all(matches.map((p) => context.fileSystem.toVirtualFile(p)))));
		}
	}

	return model;
}
