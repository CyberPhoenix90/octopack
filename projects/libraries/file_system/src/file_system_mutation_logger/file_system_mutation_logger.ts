import { FileSystem, FileSystemEntryStatus } from '../file_system';

export enum FileSystemMutationOperation {
	MK_DIR,
	RM_DIR,
	UNLINK,
	WRITE
}

export interface FileSystemMutation {
	operation: FileSystemMutationOperation;
	path: string;
	newContent?: string;
	contentChanged?: boolean;
	previousContent?: string;
}

export interface FileSystemMutationLoggerOptions {
	logContentBeforeMutation?: boolean;
}

export class FileSystemMutationLogger extends FileSystem {
	private fileSystem: FileSystem;
	private options: FileSystemMutationLoggerOptions;
	public readonly fileSystemMutations: FileSystemMutation[];
	public readonly writtenFiles: Set<string>;

	constructor(sourceFileSystem: FileSystem, options: FileSystemMutationLoggerOptions = {}) {
		super();
		this.fileSystem = sourceFileSystem;
		this.options = options;
		this.fileSystemMutations = [];
		this.writtenFiles = new Set();
	}

	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		return this.fileSystem.watch(paths, options, callback);
	}
	public watchSync(paths: string[], options: any, callback: any): () => void {
		return this.fileSystem.watchSync(paths, options, callback);
	}

	public readlink(path: string): Promise<string> {
		return this.fileSystem.readlink(path);
	}
	public readlinkSync(path: string): string {
		return this.fileSystem.readlinkSync(path);
	}
	public realpath(path: string): Promise<string> {
		return this.fileSystem.realpath(path);
	}
	public realpathSync(path: string): string {
		return this.fileSystem.realpathSync(path);
	}

	public async mkdir(path: string): Promise<void> {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.MK_DIR
		});
		return this.fileSystem.mkdir(path);
	}

	public mkdirSync(path: string): void {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.MK_DIR
		});
		return this.fileSystem.mkdirSync(path);
	}

	public async rmdir(path: string): Promise<void> {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.RM_DIR
		});
		return this.fileSystem.rmdir(path);
	}

	public rmdirSync(path: string): void {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.RM_DIR
		});
		return this.fileSystem.rmdirSync(path);
	}

	public async unlink(path: string): Promise<void> {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.UNLINK,
			previousContent: this.options.logContentBeforeMutation && (await this.readFileIfExist(path, 'utf8'))
		});
		return this.fileSystem.unlink(path);
	}

	public unlinkSync(path: string): void {
		this.fileSystemMutations.push({
			path,
			operation: FileSystemMutationOperation.UNLINK,
			previousContent: this.options.logContentBeforeMutation && this.readFileIfExistSync(path, 'utf8')
		});
		return this.fileSystem.unlinkSync(path);
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		return this.fileSystem.readFile(path, encoding);
	}

	public readFileSync(path: string, encoding: string): string;
	public readFileSync(path: string): Buffer;
	public readFileSync(path: string, encoding?: string): string | Buffer {
		return this.fileSystem.readFileSync(path, encoding);
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		return this.fileSystem.stat(path);
	}

	public statSync(path: string): FileSystemEntryStatus {
		return this.fileSystem.statSync(path);
	}

	public async readDir(path: string): Promise<string[]> {
		return this.fileSystem.readDir(path);
	}

	public readDirSync(path: string): string[] {
		return this.fileSystem.readDirSync(path);
	}

	public async exists(path: string): Promise<boolean> {
		return this.fileSystem.exists(path);
	}

	public existsSync(path: string): boolean {
		return this.fileSystem.existsSync(path);
	}

	public async writeFile(path: string, content: string): Promise<void> {
		const prevContent = await this.readFileIfExist(path, 'utf8');
		this.writtenFiles.add(path);
		this.fileSystemMutations.push({
			path,
			newContent: content,
			operation: FileSystemMutationOperation.WRITE,
			contentChanged: prevContent !== content,
			previousContent: this.options.logContentBeforeMutation && prevContent
		});

		return this.fileSystem.writeFile(path, content);
	}

	public writeFileSync(path: string, content: string): void {
		const prevContent = this.readFileIfExistSync(path, 'utf8');
		this.writtenFiles.add(path);
		this.fileSystemMutations.push({
			path,
			newContent: content,
			operation: FileSystemMutationOperation.WRITE,
			contentChanged: prevContent !== content,
			previousContent: this.options.logContentBeforeMutation && prevContent
		});

		return this.fileSystem.writeFileSync(path, content);
	}
}
