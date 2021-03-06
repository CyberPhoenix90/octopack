"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
const file_path_utils_1 = require("../file_path_utils");
const path_1 = require("path");
class MemoryFileSystem extends file_system_1.FileSystem {
    constructor(data) {
        super();
        this.fileSystem = data
            ? this.fromJson(data)
            : {
                children: {},
                fullPath: '/',
                name: '/',
                parent: undefined,
                type: file_system_1.FileSystemEntryType.DIRECTORY
            };
    }
    watch(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    watchSync(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    async readlink(path) {
        return '';
    }
    readlinkSync(path) {
        return '';
    }
    async realpath(path) {
        return path_1.resolve(path);
    }
    realpathSync(path) {
        return path_1.resolve(path);
    }
    fromJson(json) {
        throw new Error('not implemented');
    }
    async toJson() {
        const files = await this.readDirRecursive('/', {});
        const result = {};
        for (const file of files) {
            result[file] = this.readFileSync(file, 'utf8');
        }
        return result;
    }
    async mkdir(path) {
        return this.mkdirSync(path);
    }
    mkdirSync(path) {
        const fp = new file_path_utils_1.FilePath(path);
        const entry = this.getEntry(fp.getDirectory());
        if (!entry) {
            throw new Error(`Path does not exist for ${path}`);
        }
        else if (entry.type === file_system_1.FileSystemEntryType.FILE) {
            throw new Error('cannot add directories into files');
        }
        entry.children[fp.getFullFileName()] = {
            fullPath: path,
            children: {},
            name: fp.getFullFileName(),
            parent: entry,
            type: file_system_1.FileSystemEntryType.DIRECTORY
        };
    }
    async rmdir(path) {
        return this.rmdirSync(path);
    }
    rmdirSync(path) {
        const entry = this.getEntry(path);
        if (entry) {
            if (entry.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                if (Object.keys(entry.children).length !== 0) {
                    throw new Error('unlink can only delete empty directories');
                }
                delete entry.parent.children[entry.name];
            }
            else {
                throw new Error(`rmdir can only remove directories`);
            }
        }
        else {
            throw new Error(`Path not found: ${path}`);
        }
    }
    async unlink(path) {
        return this.unlinkSync(path);
    }
    unlinkSync(path) {
        const entry = this.getEntry(path);
        if (entry) {
            if (entry.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                if (Object.keys(entry.children).length !== 0) {
                    throw new Error('unlink can only delete empty directories');
                }
            }
            delete entry.parent.children[entry.name];
        }
        else {
            throw new Error(`Path not found: ${path}`);
        }
    }
    async readFile(path, encoding) {
        return this.readFileSync(path, encoding);
    }
    readFileSync(path, encoding) {
        const entry = this.getEntry(path);
        if (!entry) {
            throw new Error(`No such path ${path}`);
        }
        if (entry.type === file_system_1.FileSystemEntryType.DIRECTORY) {
            throw new Error(`${path} is a directory`);
        }
        if (encoding && encoding !== 'buffer') {
            return entry.content;
        }
        else {
            return Buffer.from(entry.content);
        }
    }
    async stat(path) {
        return this.statSync(path);
    }
    statSync(path) {
        const entry = this.getEntry(path);
        if (!entry) {
            throw new Error(`No such path ${path}`);
        }
        const s = {
            type: entry.type,
            isBlockDevice: () => false,
            isCharacterDevice: () => false,
            isFIFO: () => false,
            isSocket: () => false,
            isSymbolicLink: () => false,
            isFile: () => entry.type === file_system_1.FileSystemEntryType.FILE,
            isDirectory: () => entry.type === file_system_1.FileSystemEntryType.DIRECTORY,
            size: entry.content ? entry.content.length : 0
        };
        return s;
    }
    async readDir(path) {
        return this.readDirSync(path);
    }
    readDirSync(path) {
        const entry = this.getEntry(path);
        if (!entry) {
            throw new Error(`No such path ${path}`);
        }
        if (entry.type === file_system_1.FileSystemEntryType.FILE) {
            throw new Error(`${path} is a file`);
        }
        return Object.keys(entry.children);
    }
    async exists(path) {
        return this.existsSync(path);
    }
    existsSync(path) {
        return this.getEntry(path) !== undefined;
    }
    async writeFile(path, content) {
        return this.writeFileSync(path, content);
    }
    writeFileSync(path, content) {
        const fp = new file_path_utils_1.FilePath(path);
        const entry = this.getEntry(fp.getDirectory());
        if (!entry) {
            throw new Error(`Path does not exist for ${path}`);
        }
        else if (entry.type === file_system_1.FileSystemEntryType.FILE) {
            throw new Error('cannot add subfiles into files');
        }
        entry.children[fp.getFullFileName()] = {
            fullPath: path,
            content,
            name: fp.getFileName(),
            parent: entry,
            type: file_system_1.FileSystemEntryType.FILE
        };
    }
    getEntry(path) {
        let ptr = this.fileSystem;
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        const pieces = path.split('/').filter((p) => p);
        for (const piece of pieces) {
            if (typeof ptr === 'string') {
                return undefined;
            }
            ptr = ptr.children[piece];
            if (!ptr) {
                return undefined;
            }
        }
        return ptr;
    }
}
exports.MemoryFileSystem = MemoryFileSystem;