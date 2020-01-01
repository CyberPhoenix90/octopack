export declare class FilePath {
    private directory;
    private fileName;
    private fileExtensions;
    constructor(path: string);
    getFileExtensions(): string[];
    setExtension(extension: string): this;
    getExtensionString(): string;
    getDirectory(): string;
    setDirectory(path: string): this;
    setFileName(fileName: string): this;
    getFileName(): string;
    getFullFileName(): string;
    toString(): string;
    private extractDataFromPath;
}
//# sourceMappingURL=file_path_utils.d.ts.map