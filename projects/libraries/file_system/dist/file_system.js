"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch_1 = require("minimatch");
const path_1 = require("path");
const vm = require("vm");
const file_path_utils_1 = require("./file_path_utils");
(function (FileSystemEntryType) {
    FileSystemEntryType["FILE"] = "FILE";
    FileSystemEntryType["DIRECTORY"] = "DIRECTORY";
})(exports.FileSystemEntryType || (exports.FileSystemEntryType = {}));
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
            type: exports.FileSystemEntryType.FILE,
            parent
        };
    }
    toVirtualFileSync(filePath, parent) {
        const content = this.readFileSync(filePath, 'utf8');
        return {
            fullPath: filePath,
            content,
            type: exports.FileSystemEntryType.FILE,
            parent
        };
    }
    createVirtualFolder(fullPath, parent) {
        return {
            type: exports.FileSystemEntryType.DIRECTORY,
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
            if ((await this.stat(newPath)).type === exports.FileSystemEntryType.DIRECTORY) {
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
            if ((await this.stat(filePath)).type === exports.FileSystemEntryType.DIRECTORY) {
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
            if (this.statSync(filePath).type === exports.FileSystemEntryType.DIRECTORY) {
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
            if (options.includeDirectories && (await this.stat(file)).type === exports.FileSystemEntryType.DIRECTORY) {
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
            if ((await this.stat(path_1.join(path, file))).type === exports.FileSystemEntryType.FILE) {
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
            if (this.statSync(path_1.join(path, file)).type === exports.FileSystemEntryType.FILE) {
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
            if ((await this.stat(entry)).type === exports.FileSystemEntryType.DIRECTORY) {
                result.push(entry);
            }
        }
        return result;
    }
    getSubfoldersSync(path) {
        return this.readDirSync(path)
            .map((entry) => path_1.join(path, entry))
            .filter((entry) => this.statSync(entry).type === exports.FileSystemEntryType.DIRECTORY);
    }
}
exports.FileSystem = FileSystem;
function runModule(code) {
    const sandboxContext = { module: { exports: undefined } };
    vm.createContext(sandboxContext);
    vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
    return sandboxContext.module.exports;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlX3N5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2pDLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQXFCN0MsTUFBTSxDQUFOLElBQVksbUJBR1g7QUFIRCxXQUFZLG1CQUFtQjtJQUM5QixvQ0FBYSxDQUFBO0lBQ2IsOENBQXVCLENBQUE7QUFDeEIsQ0FBQyxFQUhXLG1CQUFtQixLQUFuQixtQkFBbUIsUUFHOUI7QUFtQkQsTUFBTSxPQUFnQixVQUFVO0lBa0J4QixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQWlCLEVBQUUsV0FBbUI7UUFDdkQsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxPQUFPLEtBQUssQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLFFBQVEsQ0FBQyxTQUFpQixFQUFFLFdBQW1CO1FBQ3JELENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVELE9BQU8sS0FBSyxDQUFDLFVBQVUs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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlX3N5c3RlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUFrQztBQUNsQywrQkFBaUM7QUFDakMseUJBQXlCO0FBQ3pCLHVEQUE2QztBQUU3QyxDQUFDLFVBQVUsbUJBQW1CO0lBQzFCLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUNyQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDbkQsQ0FBQyxDQUFDLENBQUMsMkJBQW1CLElBQUksQ0FBQywyQkFBbUIsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RELE1BQWEsVUFBVTtJQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXO1FBQzdCLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsT0FBTyxpQkFBSyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsUUFBUSxDQUFDLFNBQVMsRUFBRSxXQUFXO1FBQzNCLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVELE9BQU8saUJBQUssQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNELFlBQVksQ0FBQyxTQUFTLEVBQUUsV0FBVztRQUMvQixJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDN0IsV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQ3RCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDeEIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUN4QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDMUIsU0FBUyxHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0M7UUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUNELEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU07UUFDaEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxPQUFPO1lBQ0gsUUFBUSxFQUFFLFFBQVE7WUFDbEIsT0FBTztZQUNQLElBQUksRUFBRSwyQkFBbUIsQ0FBQyxJQUFJO1lBQzlCLE1BQU07U0FDVCxDQUFDO0lBQ04sQ0FBQztJQUNELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxNQUFNO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELE9BQU87WUFDSCxRQUFRLEVBQUUsUUFBUTtZQUNsQixPQUFPO1lBQ1AsSUFBSSxFQUFFLDJCQUFtQixDQUFDLElBQUk7WUFDOUIsTUFBTTtTQUNULENBQUM7SUFDTixDQUFDO0lBQ0QsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU07UUFDaEMsT0FBTztZQUNILElBQUksRUFBRSwyQkFBbUIsQ0FBQyxTQUFTO1lBQ25DLFFBQVE7WUFDUixNQUFNO1lBQ04sT0FBTyxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO1NBQ3RDLENBQUM7SUFDTixDQUFDO0lBQ0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJO1FBQ3RCLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNsQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUNyQixNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsT0FBTyxNQUFNLENBQUM7U0FDakI7YUFDSTtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLGlCQUFpQixDQUFDLENBQUM7U0FDbEQ7SUFDTCxDQUFDO0lBQ0QsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxLQUFLO1FBQ25DLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDNUIsTUFBTSxPQUFPLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSywyQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQ25FLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFELEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM5QztpQkFDSTtnQkFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDM0I7U0FDSjtJQUNMLENBQUM7SUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFDRCxvQkFBb0IsQ0FBQyxXQUFXO1FBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNiLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3BCLFdBQVcsSUFBSSxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFO2dCQUN4QyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDakM7WUFDRCxXQUFXLElBQUksVUFBRyxDQUFDO1NBQ3RCO0lBQ0wsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFJO1FBQ1gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDcEIsV0FBVyxJQUFJLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDL0I7WUFDRCxXQUFXLElBQUksVUFBRyxDQUFDO1NBQ3RCO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSTtRQUN0QixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxtQkFBbUIsQ0FBQyxJQUFJO1FBQ3BCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUk7UUFDckIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLE1BQU0sUUFBUSxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSywyQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BFLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO2lCQUNJO2dCQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMvQjtTQUNKO0lBQ0wsQ0FBQztJQUNELGtCQUFrQixDQUFDLElBQUk7UUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixNQUFNLFFBQVEsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEtBQUssMkJBQW1CLENBQUMsU0FBUyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDNUI7aUJBQ0k7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM3QjtTQUNKO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEdBQUcsR0FBRyxFQUFFLFVBQVUsR0FBRyxHQUFHO1FBQy9ELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtRQUNELElBQUksQ0FBQyxDQUFDLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztTQUNqRDtRQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sRUFBRTtZQUN4QixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSywyQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQzlGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtpQkFDSTtnQkFDRCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSwwQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQ3JELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN6RjtTQUNKO0lBQ0wsQ0FBQztJQUNELGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFPO1FBQzFCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNELG9CQUFvQixDQUFDLElBQUksRUFBRSxPQUFPO1FBQzlCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUNELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU87UUFDMUMsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNsRDtRQUNELE1BQU0sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSywyQkFBbUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZFLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDckQ7aUJBQ0k7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ25GLElBQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFO3dCQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDbEM7b0JBQ0QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ3BFO2FBQ0o7U0FDSjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDRCxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU87UUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNsRDtRQUNELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLEVBQUU7WUFDbEIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssMkJBQW1CLENBQUMsSUFBSSxFQUFFO2dCQUNuRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3JEO2lCQUNJO2dCQUNELElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNuRixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTt3QkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ2xDO29CQUNELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDbEU7YUFDSjtTQUNKO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNELGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1lBQ3ZCLElBQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFO2dCQUM1QixNQUFNLEVBQUUsR0FBRyxJQUFJLDBCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO29CQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDbEM7YUFDSjtpQkFDSSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRTtnQkFDakMsTUFBTSxFQUFFLEdBQUcsSUFBSSwwQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO29CQUMvRCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDbEM7YUFDSjtpQkFDSTtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNsQztTQUNKO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNiLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsVUFBVSxDQUFDLElBQUk7UUFDWCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDRCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUk7UUFDcEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNoRixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFVLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSywyQkFBbUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2pFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdEI7U0FDSjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFDRCxpQkFBaUIsQ0FBQyxJQUFJO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7YUFDeEIsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2pDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssMkJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEYsQ0FBQztDQUNKO0FBclBELGdDQXFQQztBQUNELFNBQVMsU0FBUyxDQUFDLElBQUk7SUFDbkIsTUFBTSxjQUFjLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQztJQUMxRCxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2pDLEVBQUUsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLElBQUksWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ25FLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDekMsQ0FBQztBQUNELHNwWkFBc3BaIn0=