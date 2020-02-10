"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch_1 = require("minimatch");
const path_1 = require("path");
const vm = require("vm");
const file_path_utils_1 = require("./file_path_utils");
const crypto_1 = require("crypto");
(function (FileSystemEntryType) {
    FileSystemEntryType["FILE"] = "FILE";
    FileSystemEntryType["DIRECTORY"] = "DIRECTORY";
})(exports.FileSystemEntryType || (exports.FileSystemEntryType = {}));
class FileSystem {
    async glob(directory, globPattern, options = {}) {
        ({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
        const candidates = await this.readDirRecursive(directory, options);
        return minimatch_1.match(candidates, globPattern);
    }
    globSync(directory, globPattern, options = {}) {
        ({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
        const candidates = this.readDirRecursiveSync(directory, options);
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
    readFiles(files, encoding) {
        return Promise.all(files.map((f) => this.readFile(f, encoding)));
    }
    async readFilesIfExist(files, encoding) {
        const promises = [];
        const results = [];
        let i = 0;
        for (const file of files) {
            const index = i++;
            promises.push(this.exists(file).then((exists) => {
                if (exists) {
                    return this.readFile(file, encoding).then((content) => {
                        results[index] = content;
                    });
                }
                else {
                    return undefined;
                }
            }));
        }
        await Promise.all(promises);
        return results.filter((p) => p !== undefined);
    }
    async readFileIfExist(file, encoding) {
        if (await this.exists(file)) {
            return this.readFile(file, encoding);
        }
        else {
            return undefined;
        }
    }
    readFileIfExistSync(file, encoding) {
        if (this.existsSync(file)) {
            return this.readFileSync(file, encoding);
        }
        else {
            return undefined;
        }
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
    async copyDirectory(source, target) {
        const files = await this.readDirRecursive(source, {});
        for (const file of files) {
            const newFile = path_1.join(target, path_1.relative(source, file));
            await this.mkdirp(path_1.parse(newFile).dir);
            await this.writeFile(newFile, await this.readFile(file, 'utf8'));
        }
    }
    copyDirectorySync(source, target) {
        const files = this.readDirRecursiveSync(source, {});
        for (const file of files) {
            const newFile = path_1.join(target, path_1.relative(source, file));
            this.writeFileSync(newFile, this.readFileSync(file, 'utf8'));
        }
    }
    async copyFile(source, target) {
        return this.writeFile(target, await this.readFile(source, 'utf8'));
    }
    copyFileSync(source, target) {
        return this.writeFileSync(target, this.readFileSync(source, 'utf8'));
    }
    async copyFileFileSystem(source, targetFileSystem, targetPath) {
        return targetFileSystem.writeFile(targetPath, await this.readFile(source, 'utf8'));
    }
    copyFileFileSystemSync(source, targetFileSystem, targetPath) {
        return targetFileSystem.writeFileSync(targetPath, this.readFileSync(source, 'utf8'));
    }
    async moveFileFileSystem(source, targetFileSystem, targetPath) {
        await this.copyFileFileSystem(source, targetFileSystem, targetPath);
        await this.unlink(source);
    }
    moveFileFileSystemSync(source, targetFileSystem, targetPath) {
        this.copyFileFileSystemSync(source, targetFileSystem, targetPath);
        this.unlinkSync(source);
    }
    async hashFiles(paths, includePaths = true, salt = '') {
        const hashData = await Promise.all(paths.map((f) => this.readFile(f, 'utf8')));
        hashData.push(salt);
        if (includePaths) {
            hashData.push(paths.sort().join(''));
        }
        return crypto_1.createHash('sha1')
            .update(hashData.join(''))
            .digest('hex');
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
                if (options.matchPartialExtensions) {
                    if (options.extensionWhiteList.some((ext) => fp.getExtensionString().endsWith(ext))) {
                        results.push(path_1.join(path, file));
                    }
                }
                else {
                    if (options.extensionWhiteList.includes(fp.getExtensionString())) {
                        results.push(path_1.join(path, file));
                    }
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