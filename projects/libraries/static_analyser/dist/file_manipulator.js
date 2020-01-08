"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const file_system_1 = require("../../file_system");
const path_1 = require("path");
const tslint_1 = require("tslint");
class FileManipulator {
    constructor(fileContent, language = typescript_1.ScriptKind.TSX) {
        this.ast = typescript_1.createSourceFile('virtual', fileContent, typescript_1.ScriptTarget.ESNext, true, language);
        this.content = fileContent;
        this.language = language;
        this.manipulations = [];
    }
    /**
     * Rewrites AST based on the changes you requested
     */
    applyManipulations() {
        if (this.manipulations.length === 0) {
            return;
        }
        this.manipulations.sort((a, b) => b.start - a.start);
        for (const manipulation of this.manipulations) {
            this.content =
                this.content.substring(0, manipulation.start) +
                    manipulation.replacement +
                    this.content.substring(manipulation.end);
        }
        this.ast = typescript_1.createSourceFile('virtual', this.content, typescript_1.ScriptTarget.ESNext, true, this.language);
        this.manipulations = [];
    }
    async writeResult(path, fileSystem) {
        this.applyManipulations();
        fileSystem.writeFile(path, this.content);
    }
    toVirtualFile(path) {
        this.applyManipulations();
        return {
            fullPath: path,
            name: path_1.parse(path).base,
            parent: undefined,
            type: file_system_1.FileSystemEntryType.FILE,
            content: this.content
        };
    }
    forEachComment(query) {
        tslint_1.forEachComment(this.ast, (fullText, kind, pos) => {
            this.manipulations.push(...(query(fullText.substring(pos.fullStart, pos.end), pos, kind) || []));
        });
    }
    queryAst(query) {
        const queryNode = (node) => {
            this.manipulations.push(...(query(node) || []));
            node.forEachChild(queryNode);
            return;
        };
        this.ast.forEachChild(queryNode);
    }
}
exports.FileManipulator = FileManipulator;
//# sourceMappingURL=file_manipulator.js.map