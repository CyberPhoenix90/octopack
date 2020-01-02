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
            name: path_1.parse(filePath).name,
            content,
            type: FileSystemEntryType.FILE,
            parent
        };
    }
    toVirtualFileSync(filePath, parent) {
        const content = this.readFileSync(filePath, 'utf8');
        return {
            fullPath: filePath,
            name: path_1.parse(filePath).name,
            content,
            type: FileSystemEntryType.FILE,
            parent
        };
    }
    toVirtualFolderSync(fullPath, parent) {
        return {
            type: FileSystemEntryType.DIRECTORY,
            fullPath,
            name: path_1.parse(fullPath).name,
            parent,
            content: { files: [], folders: [] }
        };
    }
    async serializeFolder(path) {
        if (await this.exists(path)) {
            const result = {};
            const entry = this.toVirtualFolderSync(path);
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
                const newEntry = this.toVirtualFolderSync(newPath, entry);
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
            if ((await (await this.stat(entry)).type) === FileSystemEntryType.DIRECTORY) {
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
//# sourceMappingURL=file_system.js.map