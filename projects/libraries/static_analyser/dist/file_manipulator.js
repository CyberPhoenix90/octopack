"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const file_system_1 = require("../../file_system");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9tYW5pcHVsYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpbGVfbWFuaXB1bGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBc0c7QUFDdEcsbURBQWlGO0FBQ2pGLG1DQUF1RDtBQVF2RCxNQUFhLGVBQWU7SUFNM0IsWUFBWSxXQUFtQixFQUFFLFdBQXVCLHVCQUFVLENBQUMsR0FBRztRQUNyRSxJQUFJLENBQUMsR0FBRyxHQUFHLDZCQUFnQixDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUseUJBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pGLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNJLGtCQUFrQjtRQUN4QixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNwQyxPQUFPO1NBQ1A7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JELEtBQUssTUFBTSxZQUFZLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUM5QyxJQUFJLENBQUMsT0FBTztnQkFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQztvQkFDN0MsWUFBWSxDQUFDLFdBQVc7b0JBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsNkJBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUseUJBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFZLEVBQUUsVUFBc0I7UUFDNUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxhQUFhLENBQUMsSUFBWTtRQUNoQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixPQUFPO1lBQ04sUUFBUSxFQUFFLElBQUk7WUFDZCxNQUFNLEVBQUUsU0FBUztZQUNqQixJQUFJLEVBQUUsaUNBQW1CLENBQUMsSUFBSTtZQUM5QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDckIsQ0FBQztJQUNILENBQUM7SUFFTSxjQUFjLENBQUMsS0FBa0Y7UUFDdkcsdUJBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBZ0IsRUFBRSxJQUFnQixFQUFFLEdBQWtCLEVBQUUsRUFBRTtZQUNuRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQXFDO1FBQ3BELE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBVSxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0IsT0FBTztRQUNSLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQS9ERCwwQ0ErREMifQ==