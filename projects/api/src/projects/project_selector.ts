import { Project, ScriptContext } from 'projects/business_logic/models/dist';

export function getSelectedProjects(selectors: string[], projects: Project[], context: ScriptContext): Project[] {
	if (!selectors.length) {
		return projects;
	} else {
		const selectedProjects: Project[] = [];

		projects.forEach((p) => {
			if (selectors.includes(p.resolvedConfig.name)) {
				selectedProjects.push(p);
			}
		});

		if (selectedProjects.length < selectors.length) {
			const notFoundNames: string[] = [];
			const selectedProjectNames = selectedProjects.map((p) => p.resolvedConfig.name);

			selectors.forEach((a) => {
				if (!selectedProjectNames.includes(a)) {
					notFoundNames.push(a);
				}
			});

			context.uiLogger.warn(
				`No project(s) with the name(s) ${notFoundNames.join(', ')} could be located. Skipping these arguments.`
			);
		}
		return selectedProjects;
	}
}
