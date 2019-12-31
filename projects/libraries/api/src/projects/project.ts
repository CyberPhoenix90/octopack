import { OctopackConfiguration } from '../../../config_resolver';

export interface Project {
	path: string;
	rawConfig: OctopackConfiguration;
}
