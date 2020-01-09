"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
const file_path_utils_1 = require("../file_path_utils");
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
        return entry.content;
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
            isBlockDevice: false,
            isCharacterDevice: false,
            isFIFO: false,
            isSocket: false,
            isSymbolicLink: false,
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
        entry.children[fp.getFileName()] = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtb3J5X2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWVtb3J5X2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQXdGO0FBQ3hGLHdEQUE4QztBQWM5QyxNQUFhLGdCQUFpQixTQUFRLHdCQUFVO0lBRy9DLFlBQVksSUFBc0I7UUFDakMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUk7WUFDckIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ3JCLENBQUMsQ0FBQztnQkFDQSxRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsR0FBRztnQkFDYixJQUFJLEVBQUUsR0FBRztnQkFDVCxNQUFNLEVBQUUsU0FBUztnQkFDakIsSUFBSSxFQUFFLGlDQUFtQixDQUFDLFNBQVM7YUFDbEMsQ0FBQztJQUNOLENBQUM7SUFFTyxRQUFRLENBQUMsSUFBcUI7UUFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTTtRQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsTUFBTSxNQUFNLEdBQW9CLEVBQUUsQ0FBQztRQUVuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN6QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDL0M7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVk7UUFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxTQUFTLENBQUMsSUFBWTtR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