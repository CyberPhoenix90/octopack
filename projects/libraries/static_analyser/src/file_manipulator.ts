import { createSourceFile, ScriptTarget, ScriptKind, SourceFile, Node } from 'typescript';
import { FileSystem, VirtualFile, FileSystemEntryType } from 'file_system';
import { parse } from 'path';

interface Manipulation {
	start: number;
	end: number;
	replacement: string;
}

export class FileManipulator {
	public content: string;
	private manipulations: Manipulation[];
	private ast: SourceFile;
	private language: ScriptKind;

	constructor(fileContent: string, language: ScriptKind = ScriptKind.TSX) {
		this.ast = createSourceFile('virtual', fileContent, ScriptTarget.ESNext, true, language);
		this.content = fileContent;
		this.language = language;
		this.manipulations = [];
	}

	/**
	 * Rewrites AST based on the changes you requested
	 */
	public applyManipulations(): void {
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
		this.ast = createSourceFile('virtual', this.content, ScriptTarget.ESNext, true, this.language);
		this.manipulations = [];
	}

	public async writeResult(path: string, fileSystem: FileSystem): Promise<void> {
		this.applyManipulations();
		fileSystem.writeFile(path, this.content);
	}

	public toVirtualFile(path: string): VirtualFile {
		this.applyManipulations();

		return {
			fullPath: path,
			name: parse(path).base,
			parent: undefined,
			type: FileSystemEntryType.FILE,
			content: this.content
		};
	}

	public queryAst(query: (node: Node) => Manipulation[]): void {
		const queryNode = (node: Node) => {
			this.manipulations.push(...(query(node) || []));
			node.forEachChild(queryNode);
			return;
		};

		this.ast.forEachChild(queryNode);
	}
}
