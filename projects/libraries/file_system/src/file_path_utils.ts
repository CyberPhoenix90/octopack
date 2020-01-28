import { join, parse } from 'path';

export class FilePath {
	private directory: string;
	private fileName: string;
	private fileExtensions: string[];

	constructor(path: string) {
		this.extractDataFromPath(path);
	}

	public getFileExtensions(): string[] {
		return this.fileExtensions.slice();
	}

	public setExtension(extension: string): this {
		if (extension.startsWith('.')) {
			extension = extension.substring(1);
		}

		this.fileExtensions = extension.split('.');

		return this;
	}

	public getExtensionString(): string {
		if (this.fileExtensions.length > 0) {
			return '.' + this.fileExtensions.join('.');
		} else {
			return '';
		}
	}

	public getDirectory(): string {
		return this.directory;
	}

	public setDirectory(path: string): this {
		this.directory = path;
		return this;
	}

	public setFileName(fileName: string): this {
		this.fileName = fileName;
		return this;
	}

	public getFileName(): string {
		return this.fileName;
	}

	public getFullFileName(): string {
		return this.fileName + this.getExtensionString();
	}

	public toString(): string {
		return join(this.directory, this.fileName + this.getExtensionString());
	}

	private extractDataFromPath(path: string): void {
		const data = parse(path);
		this.directory = data.dir;
		if (data.name.includes('.')) {
			this.fileName = data.name.substring(0, data.name.indexOf('.'));
		} else {
			this.fileName = data.name;
		}
		this.fileExtensions = data.base.split('.').slice(1);
	}
}
