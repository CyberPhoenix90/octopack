import { ScriptKind, Node, SyntaxKind } from 'typescript';
import { FileSystem, VirtualFile } from 'file_system';
import { TokenPosition } from 'tslint';
interface Manipulation {
    start: number;
    end: number;
    replacement: string;
}
export declare class FileManipulator {
    content: string;
    private manipulations;
    private ast;
    private language;
    constructor(fileContent: string, language?: ScriptKind);
    /**
     * Rewrites AST based on the changes you requested
     */
    applyManipulations(): void;
    writeResult(path: string, fileSystem: FileSystem): Promise<void>;
    toVirtualFile(path: string): VirtualFile;
    forEachComment(query: (text: string, position: TokenPosition, kind: SyntaxKind) => Manipulation[]): void;
    queryAst(query: (node: Node) => Manipulation[]): void;
}
export {};
//# sourceMappingURL=file_manipulator.d.ts.map