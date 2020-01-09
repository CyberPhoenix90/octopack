"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch_1 = require("minimatch");
const path_1 = require("path");
const vm = require("vm");
const file_path_utils_1 = require("./file_path_utils");
var FileSystemEntryType;
(function (FileSystemEntryType) {
    FileSystemEntryType["FILE"] = "FILE";
    FileSystemEntryType["DIRECTORY"] = "DIRECTORY";
})(FileSystemEntryType = exports.FileSystemEntryType || (exports.FileSystemEntryType = {}));
class FileSystem {
    async glob(directory, globPattern) {
        ({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
        const candidates = await this.readDirRecursive(directory, {});
        return minimatch_1.match(candidates, globPattern);
    }
    globSync(directory, globPattern) {
        ({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
        const candidates = this.readDirRecursiveSync(directory, {});
        return minimatch_1.match(candidates, globPattern);
    }
    optimizeGlob(directory, globPattern) {
        if (globPattern.startsWith('/')) {
            globPattern = globPattern.substring(1);
        }
        const pieces = globPattern.split('/');
        while (pieces.length !== 0 &&
            !pieces[0].includes('*') &&
            !pieces[0].includes('!') &&
            !pieces[0].includes('(')) {
            directory = path_1.join(directory, pieces.shift());
        }
        return { directory, globPattern: pieces.join('/') };
    }
    async toVirtualFile(filePath, parent) {
        const content = await this.readFile(filePath, 'utf8');
        return {
            fullPath: filePath,
            content,
            type: FileSystemEntryType.FILE,
            parent
        };
    }
    toVirtualFileSync(filePath, parent) {
        const content = this.readFileSync(filePath, 'utf8');
        return {
            fullPath: filePath,
            content,
            type: FileSystemEntryType.FILE,
            parent
        };
    }
    createVirtualFolder(fullPath, parent) {
        return {
            type: FileSystemEntryType.DIRECTORY,
            fullPath,
            parent,
            content: { files: [], folders: [] }
        };
    }
    async serializeFolder(path) {
        if (await this.exists(path)) {
            const result = {};
            const entry = this.createVirtualFolder(path);
            result[path] = entry;
            await this.serializeFolderContent(result, entry);
            return result;
        }
        else {
            throw new Error(`Path ${path} does not exist`);
        }
    }
    async serializeFolderContent(map, entry) {
        const contents = await this.readDir(entry.fullPath);
        for (const content of contents) {
            const newPath = path_1.join(entry.fullPath, content);
            if ((await this.stat(newPath)).type === FileSystemEntryType.DIRECTORY) {
                const newEntry = this.createVirtualFolder(newPath, entry);
                entry.content.folders.push(newEntry);
                map[newPath] = newEntry;
                this.serializeFolderContent(map, newEntry);
            }
            else {
                const newEntry = await this.toVirtualFile(newPath, entry);
                entry.content.files.push(newEntry);
                map[newPath] = newEntry;
            }
        }
    }
    async writeVirtualFile(virtualFile) {
        this.writeFile(virtualFile.fullPath, virtualFile.content);
    }
    writeVirtualFileSync(virtualFile) {
        this.writeFileSync(virtualFile.fullPath, virtualFile.content);
    }
    async mkdirp(path) {
        const pieces = path.split(path_1.sep);
        let currentPath = '';
        for (const p of pieces) {
            currentPath += p;
            if (p && !(await this.exists(currentPath))) {
                await this.mkdir(currentPath);
            }
            currentPath += path_1.sep;
        }
    }
    mkdirpSync(path) {
        const pieces = path.split(path_1.sep);
        let currentPath = '';
        for (const p of pieces) {
            currentPath += p;
            if (p && !this.existsSync(currentPath)) {
                this.mkdirSync(currentPath);
            }
            currentPath += path_1.sep;
        }
    }
    async deleteDirectory(path) {
        await this.emptyDirectory(path);
        await this.rmdir(path);
    }
    deleteDirectorySync(path) {
        this.emptyDirectorySync(path);
        this.rmdirSync(path);
    }
    async emptyDirectory(path) {
        const files = await this.readDir(path);
        for (const file of files) {
            const filePath = path_1.join(path.toString(), file);
            if ((await this.stat(filePath)).type === FileSystemEntryType.DIRECTORY) {
                await this.emptyDirectory(filePath);
                await this.rmdir(filePath);
            }
            else {
                await this.unlink(filePath);
            }
        }
    }
    emptyDirectorySync(path) {
        const files = this.readDirSync(path);
        for (const file of files) {
            const filePath = path_1.join(path.toString(), file);
            if (this.statSync(filePath).type === FileSystemEntryType.DIRECTORY) {
                this.emptyDirectorySync(filePath);
                this.rmdirSync(filePath);
            }
            else {
                this.unlinkSync(filePath);
            }
        }
    }
    async merge(fileSystem, options, targetPath = '/', sourcePath = '/') {
        if (!(await this.exists(targetPath))) {
            throw new Error('target path does not exist');
        }
        if (!(await fileSystem.exists(sourcePath))) {
            throw new Error('source path does not exist');
        }
        const toMerge = await fileSystem.readDirRecursive(sourcePath, options);
        for (const file of toMerge) {
            if (options.includeDirectories && (await this.stat(file)).type === FileSystemEntryType.DIRECTORY) {
                await this.mkdirp(file);
            }
            else {
                await this.mkdirp(new file_path_utils_1.FilePath(file).getDirectory());
                await this.writeFile(path_1.join(targetPath, file), await fileSystem.readFile(file, 'utf8'));
            }
        }
    }
    readDirRecursive(path, options) {
        return this._readDirRecursive(path, options, []);
    }
    readDirRecursiveSync(path, options) {
        return this._readDirRecursiveSync(path, options, []);
    }
    async _readDirRecursive(path, options, results) {
        if (!(await this.exists(path))) {
            throw new Error(`Path does not exist ${path}`);
        }
        const f = await this.readDir(path);
        for (const file of f) {
            if ((await this.stat(path_1.join(path, file))).type === FileSystemEntryType.FILE) {
                this.addFileIfMatch(options, file, results, path);
            }
            else {
                if (!options.directoryNameBlackList || !options.directoryNameBlackList.includes(file)) {
                    if (options.includeDirectories) {
                        results.push(path_1.join(path, file));
                    }
                    await this._readDirRecursive(path_1.join(path, file), options, results);
                }
            }
        }
        return results;
    }
    _readDirRecursiveSync(path, options, results) {
        if (!this.existsSync(path)) {
            throw new Error(`Path does not exist ${path}`);
        }
        const f = this.readDirSync(path);
        for (const file of f) {
            if (this.statSync(path_1.join(path, file)).type === FileSystemEntryType.FILE) {
                this.addFileIfMatch(options, file, results, path);
            }
            else {
                if (!options.directoryNameBlackList || !options.directoryNameBlackList.includes(file)) {
                    if (options.includeDirectories) {
                        results.push(path_1.join(path, file));
                    }
                    this._readDirRecursiveSync(path_1.join(path, file), options, results);
                }
            }
        }
        return results;
    }
    addFileIfMatch(options, file, results, path) {
        if (!options.excludeFiles) {
            if (options.extensionWhiteList) {
                const fp = new file_path_utils_1.FilePath(file);
                if (options.extensionWhiteList.includes(fp.getExtensionString())) {
                    results.push(path_1.join(path, file));
                }
            }
            else if (options.extensionBlackList) {
                const fp = new file_path_utils_1.FilePath(file);
                if (!options.extensionBlackList.includes(fp.getExtensionString())) {
                    results.push(path_1.join(path, file));
                }
            }
            else {
                results.push(path_1.join(path, file));
            }
        }
    }
    async import(path) {
        return runModule(await this.readFile(path, 'utf8'));
    }
    importSync(path) {
        return runModule(this.readFileSync(path, 'utf8'));
    }
    async getSubfolders(path) {
        const subEntries = (await this.readDir(path)).map((entry) => path_1.join(path, entry));
        const result = [];
        for (const entry of subEntries) {
            if ((await this.stat(entry)).type === FileSystemEntryType.DIRECTORY) {
                result.push(entry);
            }
        }
        return result;
    }
    getSubfoldersSync(path) {
        return this.readDirSync(path)
            .map((entry) => path_1.join(path, entry))
            .filter((entry) => this.statSync(entry).type === FileSystemEntryType.DIRECTORY);
    }
}
exports.FileSystem = FileSystem;
function runModule(code) {
    const sandboxContext = { module: { exports: undefined } };
    vm.createContext(sandboxContext);
    vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
    return sandboxContext.module.exports;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlX3N5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFrQztBQUNsQywrQkFBaUM7QUFDakMseUJBQXlCO0FBQ3pCLHVEQUE2QztBQXFCN0MsSUFBWSxtQkFHWDtBQUhELFdBQVksbUJBQW1CO0lBQzlCLG9DQUFhLENBQUE7SUFDYiw4Q0FBdUIsQ0FBQTtBQUN4QixDQUFDLEVBSFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFHOUI7QUFtQkQsTUFBc0IsVUFBVTtJQWtCeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFpQixFQUFFLFdBQW1CO1FBQ3ZELENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsT0FBTyxpQkFBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sUUFBUSxDQUFDLFNBQWlCLEVBQUUsV0FBbUI7UUFDckQsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUQsT0FBTyxpQkFBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8sWUFBWSxDQUFDLFNBQWlCLEVBQUUsV0FBbUI7UUFDMUQsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2hDLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxPQUNDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUNuQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQ3hCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDeEIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUN2QjtZQUNELFNBQVMsR0FBRyxXQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQWdCLEVBQUUsTUFBc0I7UUFDbEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxPQUFPO1lBQ04sUUFBUSxFQUFFLFFBQVE7WUFDbEIsT0FBTztZQUNQLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxJQUFJO1lBQzlCLE1BQU07U0FDTixDQUFDO0lBQ0gsQ0FBQztJQUVNLGlCQUFpQixDQUFDLFFBQWdCLEVBQUUsTUFBc0I7UUFDaEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEQsT0FBTztZQUNOLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE9BQU87WUFDUCxJQUFJLEVBQUUsbUJBQW1CLENBQUMsSUFBSTtZQUM5QixNQUFNO1NBQ04sQ0FBQztJQUNILENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxRQUFnQixFQUFFLE1BQXNCO1FBQ25FLE9BQU87WUFDTixJQUFJLEVBQUUsbUJBQW1CLENBQUMsU0FBUztZQUNuQyxRQUFRO1lBQ1IsTUFBTTtZQUNOLE9BQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtTQUNuQyxDQUFDO0lBQ0gsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBWTtRQUN4QyxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QixNQUFNLE1BQU0sR0FBb0MsRUFBRSxDQUFDO1lBRW5ELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVqRCxPQUFPLE1BQU0sQ0FBQztTQUNkO2FBQU07WUFDTixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDO1NBQy9DO0lBQ0YsQ0FBQztJQUVPLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxHQUFvQyxFQUFFLEtBQW9CO1FBQzlGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDL0IsTUFBTSxPQUFPLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMzQztpQkFBTTtnQkFDTixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDeEI7U0FDRDtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBd0I7UUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRU0sb0JBQW9CLENBQUMsV0FBd0I7UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFZO1FBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3ZCLFdBQVcsSUFBSSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDOUI7WUFDRCxXQUFXLElBQUksVUFBRyxDQUFDO1NBQ25CO0lBQ0YsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFZO1FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3ZCLFdBQVcsSUFBSSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsV0FBVyxJQUFJLFVBQUcsQ0FBQztTQUNuQjtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsZUFBZSxDQUFDLElBQVk7UUFDeEMsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRU0sbUJBQW1CLENBQUMsSUFBWTtRQUN0QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFZO1FBQ3ZDLE1BQU0sS0FBSyxHQUFhLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN6QixNQUFNLFFBQVEsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQUMsU0FBUyxFQUFFO2dCQUN2RSxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzQjtpQkFBTTtnQkFDTixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUI7U0FDRDtJQUNGLENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxJQUFZO1FBQ3JDLE1BQU0sS0FBSyxHQUFhLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0MsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDekIsTUFBTSxRQUFRLEdBQUcsV0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxLQUFLLG1CQUFtQixDQUFDLFNBQVMsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3pCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDMUI7U0FDRDtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUNqQixVQUFzQixFQUN0QixPQUF1QixFQUN2QixhQUFxQixHQUFHLEVBQ3hCLGFBQXFCLEdBQUc7UUFFeEIsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxDQUFDLENBQUMsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDM0MsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFO1lBQzNCLElBQUksT0FBTyxDQUFDLGtCQUFrQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLG1CQUFtQixDQUFDLFNBQVMsRUFBRTtnQkFDakcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNOLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDBCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztnQkFDckQsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUUsTUFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3RGO1NBQ0Q7SUFDRixDQUFDO0lBRU0sZ0JBQWdCLENBQUMsSUFBWSxFQUFFLE9BQXVCO1FBQzVELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLG9CQUFvQixDQUFDLElBQVksRUFBRSxPQUF1QjtRQUNoRSxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLE9BQXVCLEVBQUUsT0FBaUI7UUFDdkYsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMvQztRQUVELE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNyQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQzFFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3RGLElBQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDL0I7b0JBQ0QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2pFO2FBQ0Q7U0FDRDtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxJQUFZLEVBQUUsT0FBdUIsRUFBRSxPQUFpQjtRQUNyRixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3RGLElBQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFO3dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDL0I7b0JBQ0QsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUMvRDthQUNEO1NBQ0Q7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRU8sY0FBYyxDQUFDLE9BQXVCLEVBQUUsSUFBWSxFQUFFLE9BQWlCLEVBQUUsSUFBWTtRQUM1RixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTtZQUMxQixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDL0IsTUFBTSxFQUFFLEdBQUcsSUFBSSwwQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtvQkFDakUsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQy9CO2FBQ0Q7aUJBQU0sSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3RDLE1BQU0sRUFBRSxHQUFHLElBQUksMEJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtvQkFDbEUsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQy9CO2FBQ0Q7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDL0I7U0FDRDtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVk7UUFDL0IsT0FBTyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTSxVQUFVLENBQUMsSUFBWTtRQUM3QixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTSxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVk7UUFDdEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFNUIsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFVLEVBQUU7WUFDL0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkI7U0FDRDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVNLGlCQUFpQixDQUFDLElBQVk7UUFDcEMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQzthQUMzQixHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDakMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQ0Q7QUF2U0QsZ0NBdVNDO0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBWTtJQUM5QixNQUFNLGNBQWMsR0FBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO0lBQy9ELEVBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDakMsRUFBRSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsSUFBSSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkUsT0FBTyxjQUFjLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUN0QyxDQUFDIn0=