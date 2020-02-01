import {
	createSourceFile,
	ScriptTarget,
	ScriptKind,
	SourceFile,
	Node,
	SyntaxKind,
	isExportAssignment,
	isExportDeclaration,
	isImportDeclaration,
	isImportSpecifier,
	isExportSpecifier
} from 'typescript';
import { FileSystem, VirtualFile, FileSystemEntryType } from 'file_system';
import { forEachComment, TokenPosition } from 'tslint';

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

	public isModule(): boolean {
		let found = false;
		this.queryAst((node) => {
			if (isExportAssignment(node)) {
				found = true;
			} else if (isExportDeclaration(node)) {
				found = true;
			} else if (isImportDeclaration(node)) {
				found = true;
			} else if (isImportSpecifier(node)) {
				found = true;
			} else if (isExportSpecifier(node)) {
				found = true;
			} else if (node.kind === SyntaxKind.ExportKeyword) {
				found = true;
			} else if (node.kind === SyntaxKind.ImportKeyword) {
				found = true;
			}
			return [];
		});

		return found;
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
			parent: undefined,
			type: FileSystemEntryType.FILE,
			content: this.content
		};
	}

	public forEachComment(query: (text: string, position: TokenPosition, kind: SyntaxKind) => Manipulation[]): void {
		forEachComment(this.ast, (fullText: string, kind: SyntaxKind, pos: TokenPosition) => {
			this.manipulations.push(...(query(fullText.substring(pos.fullStart, pos.end), pos, kind) || []));
		});
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
