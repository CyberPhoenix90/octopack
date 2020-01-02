export interface OctopackConfiguration {
	name: string;
	scope: 'project' | 'workspace' | 'solution';
	configVersion: string;
	build: {
		platform: 'node' | 'browser' | 'electron';
		assembly: 'library' | 'executable';
		bundles: {
			[key: string]: OctopackBuildBundle;
		};
	};
}

export interface OctopackBuildBundle {
	default?: boolean;
	input: string[];
	output: string;
	compilation: {
		init?: OctopackBuildPlugin[];
		link?: OctopackBuildPlugin[];
		compile?: OctopackBuildPlugin[];
		preProcess?: OctopackBuildPlugin[];
		postProcess?: OctopackBuildPlugin[];
		emit?: OctopackBuildPlugin[];
	};
}

export type OctopackBuildPlugin = string | { name: string; arguments: { [key: string]: any } };
