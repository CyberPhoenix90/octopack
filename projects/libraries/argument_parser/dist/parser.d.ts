export declare function parseArguments(args: string[]): {
    raw: string[];
    list: string[];
    map: {
        [key: string]: string | number | boolean;
    };
};
export interface ParsedArguments {
    raw: string[];
    map: {
        [key: string]: ArgumentValue;
    };
    list: string[];
}
export declare type ArgumentValue = number | boolean | string;
//# sourceMappingURL=parser.d.ts.map