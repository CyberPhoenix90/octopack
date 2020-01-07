import { MapLike } from '../../../../typings/common';
export interface OctopackConfiguration {
    name: string;
    scope: 'project' | 'workspace' | 'solution';
    configVersion: string;
    generator?: OctopackBuildPluginModel[];
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
        init?: OctopackBuildPluginModel[];
        link?: OctopackBuildPluginModel[];
        compile?: OctopackBuildPluginModel[];
        preProcess?: OctopackBuildPluginModel[];
        postProcess?: OctopackBuildPluginModel[];
        emit?: OctopackBuildPluginModel[];
    };
}
export declare type OctopackBuildPluginModel = string | {
    name: string;
    arguments: MapLike<any>;
};
//# sourceMappingURL=configuration.d.ts.map