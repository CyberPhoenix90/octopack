import { MapLike } from '../../../../typings/common';
interface BuildScript {
    bundles: {
        [key: string]: OctopackBuildBundle;
    };
}
export interface OctopackConfiguration {
    name: string;
    platform: 'node' | 'browser' | 'electron' | 'android';
    assembly: 'library' | 'executable';
    scope: 'project' | 'workspace' | 'solution';
    isProject?: boolean;
    configVersion: string;
    generator?: OctopackBuildPluginModel[];
    build?: BuildScript;
    host?: HostScript;
    run?: RunScript;
    test?: TestScript;
    deploy?: DeployScript;
}
export interface HostScript {
    openBrowser?: boolean;
    browserPath?: string;
    port?: number;
    ip?: string;
    hotreload?: boolean;
}
export interface RunScript {
    nodeJsEngine: string;
    autoRestart?: {
        restartOn: 'exitWithError' | 'exit';
        restartCooldown?: number;
        maxRestart?: number;
        maxRestartCounterResetTime?: number;
    };
    defaultArguments?: [];
    watch?: boolean;
    background?: boolean;
}
export interface TestScript {
    testFileMatchPattern?: string;
    defaultTimeout?: boolean;
    codeCoverage?: boolean;
    hotReload?: boolean;
}
export interface DeployScript {
    deployDir: string;
    publishToNpm?: boolean;
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
        output?: OctopackBuildPluginModel[];
        emit?: OctopackBuildPluginModel[];
    };
}
export declare type OctopackBuildPluginModel = string | {
    name: string;
    config: MapLike<any>;
};
export {};
//# sourceMappingURL=configuration.d.ts.map