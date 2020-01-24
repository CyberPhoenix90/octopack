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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGVfc3lzdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBtaW5pbWF0Y2hfMSA9IHJlcXVpcmUoXCJtaW5pbWF0Y2hcIik7XG5jb25zdCBwYXRoXzEgPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IHZtID0gcmVxdWlyZShcInZtXCIpO1xuY29uc3QgZmlsZV9wYXRoX3V0aWxzXzEgPSByZXF1aXJlKFwiLi9maWxlX3BhdGhfdXRpbHNcIik7XG5jb25zdCBjcnlwdG9fMSA9IHJlcXVpcmUoXCJjcnlwdG9cIik7XG4oZnVuY3Rpb24gKEZpbGVTeXN0ZW1FbnRyeVR5cGUpIHtcbiAgICBGaWxlU3lzdGVtRW50cnlUeXBlW1wiRklMRVwiXSA9IFwiRklMRVwiO1xuICAgIEZpbGVTeXN0ZW1FbnRyeVR5cGVbXCJESVJFQ1RPUllcIl0gPSBcIkRJUkVDVE9SWVwiO1xufSkoZXhwb3J0cy5GaWxlU3lzdGVtRW50cnlUeXBlIHx8IChleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUgPSB7fSkpO1xuY2xhc3MgRmlsZVN5c3RlbSB7XG4gICAgYXN5bmMgZ2xvYihkaXJlY3RvcnksIGdsb2JQYXR0ZXJuLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgKHsgZGlyZWN0b3J5LCBnbG9iUGF0dGVybiB9ID0gdGhpcy5vcHRpbWl6ZUdsb2IoZGlyZWN0b3J5LCBnbG9iUGF0dGVybikpO1xuICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0gYXdhaXQgdGhpcy5yZWFkRGlyUmVjdXJzaXZlKGRpcmVjdG9yeSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBtaW5pbWF0Y2hfMS5tYXRjaChjYW5kaWRhdGVzLCBnbG9iUGF0dGVybik7XG4gICAgfVxuICAgIGdsb2JTeW5jKGRpcmVjdG9yeSwgZ2xvYlBhdHRlcm4sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAoeyBkaXJlY3RvcnksIGdsb2JQYXR0ZXJuIH0gPSB0aGlzLm9wdGltaXplR2xvYihkaXJlY3RvcnksIGdsb2JQYXR0ZXJuKSk7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSB0aGlzLnJlYWREaXJSZWN1cnNpdmVTeW5jKGRpcmVjdG9yeSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBtaW5pbWF0Y2hfMS5tYXRjaChjYW5kaWRhdGVzLCBnbG9iUGF0dGVybik7XG4gICAgfVxuICAgIG9wdGltaXplR2xvYihkaXJlY3RvcnksIGdsb2JQYXR0ZXJuKSB7XG4gICAgICAgIGlmIChnbG9iUGF0dGVybi5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgICAgIGdsb2JQYXR0ZXJuID0gZ2xvYlBhdHRlcm4uc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBpZWNlcyA9IGdsb2JQYXR0ZXJuLnNwbGl0KCcvJyk7XG4gICAgICAgIHdoaWxlIChwaWVjZXMubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAhcGllY2VzWzBdLmluY2x1ZGVzKCcqJykgJiZcbiAgICAgICAgICAgICFwaWVjZXNbMF0uaW5jbHVkZXMoJyEnKSAmJlxuICAgICAgICAgICAgIXBpZWNlc1swXS5pbmNsdWRlcygnKCcpKSB7XG4gICAgICAgICAgICBkaXJlY3RvcnkgPSBwYXRoXzEuam9pbihkaXJlY3RvcnksIHBpZWNlcy5zaGlmdCgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBkaXJlY3RvcnksIGdsb2JQYXR0ZXJuOiBwaWVjZXMuam9pbignLycpIH07XG4gICAgfVxuICAgIGFzeW5jIHRvVmlydHVhbEZpbGUoZmlsZVBhdGgsIHBhcmVudCkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5yZWFkRmlsZShmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZ1bGxQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICB0eXBlOiBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRklMRSxcbiAgICAgICAgICAgIHBhcmVudFxuICAgICAgICB9O1xuICAgIH1cbiAgICByZWFkRmlsZXMoZmlsZXMsIGVuY29kaW5nKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChmaWxlcy5tYXAoKGYpID0+IHRoaXMucmVhZEZpbGUoZiwgZW5jb2RpbmcpKSk7XG4gICAgfVxuICAgIGFzeW5jIHJlYWRGaWxlc0lmRXhpc3QoZmlsZXMsIGVuY29kaW5nKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gW107XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gaSsrO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLmV4aXN0cyhmaWxlKS50aGVuKChleGlzdHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRGaWxlKGZpbGUsIGVuY29kaW5nKS50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKHApID0+IHAgIT09IHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIGFzeW5jIHJlYWRGaWxlSWZFeGlzdChmaWxlLCBlbmNvZGluZykge1xuICAgICAgICBpZiAoYXdhaXQgdGhpcy5leGlzdHMoZmlsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRGaWxlKGZpbGUsIGVuY29kaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZEZpbGVJZkV4aXN0U3luYyhmaWxlLCBlbmNvZGluZykge1xuICAgICAgICBpZiAodGhpcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRmlsZVN5bmMoZmlsZSwgZW5jb2RpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b1ZpcnR1YWxGaWxlU3luYyhmaWxlUGF0aCwgcGFyZW50KSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZ1bGxQYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICB0eXBlOiBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRklMRSxcbiAgICAgICAgICAgIHBhcmVudFxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBjb3B5RGlyZWN0b3J5KHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gYXdhaXQgdGhpcy5yZWFkRGlyUmVjdXJzaXZlKHNvdXJjZSwge30pO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBwYXRoXzEuam9pbih0YXJnZXQsIHBhdGhfMS5yZWxhdGl2ZShzb3VyY2UsIGZpbGUpKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWtkaXJwKHBhdGhfMS5wYXJzZShuZXdGaWxlKS5kaXIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUZpbGUobmV3RmlsZSwgYXdhaXQgdGhpcy5yZWFkRmlsZShmaWxlLCAndXRmOCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb3B5RGlyZWN0b3J5U3luYyhzb3VyY2UsIHRhcmdldCkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMucmVhZERpclJlY3Vyc2l2ZVN5bmMoc291cmNlLCB7fSk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgY29uc3QgbmV3RmlsZSA9IHBhdGhfMS5qb2luKHRhcmdldCwgcGF0aF8xLnJlbGF0aXZlKHNvdXJjZSwgZmlsZSkpO1xuICAgICAgICAgICAgdGhpcy53cml0ZUZpbGVTeW5jKG5ld0ZpbGUsIHRoaXMucmVhZEZpbGVTeW5jKGZpbGUsICd1dGY4JykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGNvcHlGaWxlKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlRmlsZSh0YXJnZXQsIGF3YWl0IHRoaXMucmVhZEZpbGUoc291cmNlLCAndXRmOCcpKTtcbiAgICB9XG4gICAgY29weUZpbGVTeW5jKHNvdXJjZSwgdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlRmlsZVN5bmModGFyZ2V0LCB0aGlzLnJlYWRGaWxlU3luYyhzb3VyY2UsICd1dGY4JykpO1xuICAgIH1cbiAgICBhc3luYyBjb3B5RmlsZUZpbGVTeXN0ZW0oc291cmNlLCB0YXJnZXRGaWxlU3lzdGVtLCB0YXJnZXRQYXRoKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRGaWxlU3lzdGVtLndyaXRlRmlsZSh0YXJnZXRQYXRoLCBhd2FpdCB0aGlzLnJlYWRGaWxlKHNvdXJjZSwgJ3V0ZjgnKSk7XG4gICAgfVxuICAgIGNvcHlGaWxlRmlsZVN5c3RlbVN5bmMoc291cmNlLCB0YXJnZXRGaWxlU3lzdGVtLCB0YXJnZXRQYXRoKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRGaWxlU3lzdGVtLndyaXRlRmlsZVN5bmModGFyZ2V0UGF0aCwgdGhpcy5yZWFkRmlsZVN5bmMoc291cmNlLCAndXRmOCcpKTtcbiAgICB9XG4gICAgYXN5bmMgbW92ZUZpbGVGaWxlU3lzdGVtKHNvdXJjZSwgdGFyZ2V0RmlsZVN5c3RlbSwgdGFyZ2V0UGF0aCkge1xuICAgICAgICBhd2FpdCB0aGlzLmNvcHlGaWxlRmlsZVN5c3RlbShzb3VyY2UsIHRhcmdldEZpbGVTeXN0ZW0sIHRhcmdldFBhdGgpO1xuICAgICAgICBhd2FpdCB0aGlzLnVubGluayhzb3VyY2UpO1xuICAgIH1cbiAgICBtb3ZlRmlsZUZpbGVTeXN0ZW1TeW5jKHNvdXJjZSwgdGFyZ2V0RmlsZVN5c3RlbSwgdGFyZ2V0UGF0aCkge1xuICAgICAgICB0aGlzLmNvcHlGaWxlRmlsZVN5c3RlbVN5bmMoc291cmNlLCB0YXJnZXRGaWxlU3lzdGVtLCB0YXJnZXRQYXRoKTtcbiAgICAgICAgdGhpcy51bmxpbmtTeW5jKHNvdXJjZSk7XG4gICAgfVxuICAgIGFzeW5jIGhhc2hGaWxlcyhwYXRocywgaW5jbHVkZVBhdGhzID0gdHJ1ZSwgc2FsdCA9ICcnKSB7XG4gICAgICAgIGNvbnN0IGhhc2hEYXRhID0gYXdhaXQgUHJvbWlzZS5hbGwocGF0aHMubWFwKChmKSA9PiB0aGlzLnJlYWRGaWxlKGYsICd1dGY4JykpKTtcbiAgICAgICAgaGFzaERhdGEucHVzaChzYWx0KTtcbiAgICAgICAgaWYgKGluY2x1ZGVQYXRocykge1xuICAgICAgICAgICAgaGFzaERhdGEucHVzaChwYXRocy5zb3J0KCkuam9pbignJykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcnlwdG9fMS5jcmVhdGVIYXNoKCdzaGExJylcbiAgICAgICAgICAgIC51cGRhdGUoaGFzaERhdGEuam9pbignJykpXG4gICAgICAgICAgICAuZGlnZXN0KCdoZXgnKTtcbiAgICB9XG4gICAgY3JlYXRlVmlydHVhbEZvbGRlcihmdWxsUGF0aCwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRElSRUNUT1JZLFxuICAgICAgICAgICAgZnVsbFBhdGgsXG4gICAgICAgICAgICBwYXJlbnQsXG4gICAgICAgICAgICBjb250ZW50OiB7IGZpbGVzOiBbXSwgZm9sZGVyczogW10gfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBzZXJpYWxpemVGb2xkZXIocGF0aCkge1xuICAgICAgICBpZiAoYXdhaXQgdGhpcy5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmNyZWF0ZVZpcnR1YWxGb2xkZXIocGF0aCk7XG4gICAgICAgICAgICByZXN1bHRbcGF0aF0gPSBlbnRyeTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VyaWFsaXplRm9sZGVyQ29udGVudChyZXN1bHQsIGVudHJ5KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGggJHtwYXRofSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIHNlcmlhbGl6ZUZvbGRlckNvbnRlbnQobWFwLCBlbnRyeSkge1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IHRoaXMucmVhZERpcihlbnRyeS5mdWxsUGF0aCk7XG4gICAgICAgIGZvciAoY29uc3QgY29udGVudCBvZiBjb250ZW50cykge1xuICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IHBhdGhfMS5qb2luKGVudHJ5LmZ1bGxQYXRoLCBjb250ZW50KTtcbiAgICAgICAgICAgIGlmICgoYXdhaXQgdGhpcy5zdGF0KG5ld1BhdGgpKS50eXBlID09PSBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRElSRUNUT1JZKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3RW50cnkgPSB0aGlzLmNyZWF0ZVZpcnR1YWxGb2xkZXIobmV3UGF0aCwgZW50cnkpO1xuICAgICAgICAgICAgICAgIGVudHJ5LmNvbnRlbnQuZm9sZGVycy5wdXNoKG5ld0VudHJ5KTtcbiAgICAgICAgICAgICAgICBtYXBbbmV3UGF0aF0gPSBuZXdFbnRyeTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlcmlhbGl6ZUZvbGRlckNvbnRlbnQobWFwLCBuZXdFbnRyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdFbnRyeSA9IGF3YWl0IHRoaXMudG9WaXJ0dWFsRmlsZShuZXdQYXRoLCBlbnRyeSk7XG4gICAgICAgICAgICAgICAgZW50cnkuY29udGVudC5maWxlcy5wdXNoKG5ld0VudHJ5KTtcbiAgICAgICAgICAgICAgICBtYXBbbmV3UGF0aF0gPSBuZXdFbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyB3cml0ZVZpcnR1YWxGaWxlKHZpcnR1YWxGaWxlKSB7XG4gICAgICAgIHRoaXMud3JpdGVGaWxlKHZpcnR1YWxGaWxlLmZ1bGxQYXRoLCB2aXJ0dWFsRmlsZS5jb250ZW50KTtcbiAgICB9XG4gICAgd3JpdGVWaXJ0dWFsRmlsZVN5bmModmlydHVhbEZpbGUpIHtcbiAgICAgICAgdGhpcy53cml0ZUZpbGVTeW5jKHZpcnR1YWxGaWxlLmZ1bGxQYXRoLCB2aXJ0dWFsRmlsZS5jb250ZW50KTtcbiAgICB9XG4gICAgYXN5bmMgbWtkaXJwKHBhdGgpIHtcbiAgICAgICAgY29uc3QgcGllY2VzID0gcGF0aC5zcGxpdChwYXRoXzEuc2VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRQYXRoID0gJyc7XG4gICAgICAgIGZvciAoY29uc3QgcCBvZiBwaWVjZXMpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoICs9IHA7XG4gICAgICAgICAgICBpZiAocCAmJiAhKGF3YWl0IHRoaXMuZXhpc3RzKGN1cnJlbnRQYXRoKSkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1rZGlyKGN1cnJlbnRQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnRQYXRoICs9IHBhdGhfMS5zZXA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbWtkaXJwU3luYyhwYXRoKSB7XG4gICAgICAgIGNvbnN0IHBpZWNlcyA9IHBhdGguc3BsaXQocGF0aF8xLnNlcCk7XG4gICAgICAgIGxldCBjdXJyZW50UGF0aCA9ICcnO1xuICAgICAgICBmb3IgKGNvbnN0IHAgb2YgcGllY2VzKSB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aCArPSBwO1xuICAgICAgICAgICAgaWYgKHAgJiYgIXRoaXMuZXhpc3RzU3luYyhjdXJyZW50UGF0aCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1rZGlyU3luYyhjdXJyZW50UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjdXJyZW50UGF0aCArPSBwYXRoXzEuc2VwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGRlbGV0ZURpcmVjdG9yeShwYXRoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZW1wdHlEaXJlY3RvcnkocGF0aCk7XG4gICAgICAgIGF3YWl0IHRoaXMucm1kaXIocGF0aCk7XG4gICAgfVxuICAgIGRlbGV0ZURpcmVjdG9yeVN5bmMocGF0aCkge1xuICAgICAgICB0aGlzLmVtcHR5RGlyZWN0b3J5U3luYyhwYXRoKTtcbiAgICAgICAgdGhpcy5ybWRpclN5bmMocGF0aCk7XG4gICAgfVxuICAgIGFzeW5jIGVtcHR5RGlyZWN0b3J5KHBhdGgpIHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCB0aGlzLnJlYWREaXIocGF0aCk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoXzEuam9pbihwYXRoLnRvU3RyaW5nKCksIGZpbGUpO1xuICAgICAgICAgICAgaWYgKChhd2FpdCB0aGlzLnN0YXQoZmlsZVBhdGgpKS50eXBlID09PSBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRElSRUNUT1JZKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5lbXB0eURpcmVjdG9yeShmaWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5ybWRpcihmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVubGluayhmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW1wdHlEaXJlY3RvcnlTeW5jKHBhdGgpIHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnJlYWREaXJTeW5jKHBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aF8xLmpvaW4ocGF0aC50b1N0cmluZygpLCBmaWxlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRTeW5jKGZpbGVQYXRoKS50eXBlID09PSBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRElSRUNUT1JZKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbXB0eURpcmVjdG9yeVN5bmMoZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIHRoaXMucm1kaXJTeW5jKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudW5saW5rU3luYyhmaWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXN5bmMgbWVyZ2UoZmlsZVN5c3RlbSwgb3B0aW9ucywgdGFyZ2V0UGF0aCA9ICcvJywgc291cmNlUGF0aCA9ICcvJykge1xuICAgICAgICBpZiAoIShhd2FpdCB0aGlzLmV4aXN0cyh0YXJnZXRQYXRoKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IHBhdGggZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShhd2FpdCBmaWxlU3lzdGVtLmV4aXN0cyhzb3VyY2VQYXRoKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc291cmNlIHBhdGggZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b01lcmdlID0gYXdhaXQgZmlsZVN5c3RlbS5yZWFkRGlyUmVjdXJzaXZlKHNvdXJjZVBhdGgsIG9wdGlvbnMpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgdG9NZXJnZSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaW5jbHVkZURpcmVjdG9yaWVzICYmIChhd2FpdCB0aGlzLnN0YXQoZmlsZSkpLnR5cGUgPT09IGV4cG9ydHMuRmlsZVN5c3RlbUVudHJ5VHlwZS5ESVJFQ1RPUlkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1rZGlycChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWtkaXJwKG5ldyBmaWxlX3BhdGhfdXRpbHNfMS5GaWxlUGF0aChmaWxlKS5nZXREaXJlY3RvcnkoKSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUZpbGUocGF0aF8xLmpvaW4odGFyZ2V0UGF0aCwgZmlsZSksIGF3YWl0IGZpbGVTeXN0ZW0ucmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZERpclJlY3Vyc2l2ZShwYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWFkRGlyUmVjdXJzaXZlKHBhdGgsIG9wdGlvbnMsIFtdKTtcbiAgICB9XG4gICAgcmVhZERpclJlY3Vyc2l2ZVN5bmMocGF0aCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZERpclJlY3Vyc2l2ZVN5bmMocGF0aCwgb3B0aW9ucywgW10pO1xuICAgIH1cbiAgICBhc3luYyBfcmVhZERpclJlY3Vyc2l2ZShwYXRoLCBvcHRpb25zLCByZXN1bHRzKSB7XG4gICAgICAgIGlmICghKGF3YWl0IHRoaXMuZXhpc3RzKHBhdGgpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQYXRoIGRvZXMgbm90IGV4aXN0ICR7cGF0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmID0gYXdhaXQgdGhpcy5yZWFkRGlyKHBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZikge1xuICAgICAgICAgICAgaWYgKChhd2FpdCB0aGlzLnN0YXQocGF0aF8xLmpvaW4ocGF0aCwgZmlsZSkpKS50eXBlID09PSBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRklMRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRmlsZUlmTWF0Y2gob3B0aW9ucywgZmlsZSwgcmVzdWx0cywgcGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuZGlyZWN0b3J5TmFtZUJsYWNrTGlzdCB8fCAhb3B0aW9ucy5kaXJlY3RvcnlOYW1lQmxhY2tMaXN0LmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVEaXJlY3Rvcmllcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9yZWFkRGlyUmVjdXJzaXZlKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpLCBvcHRpb25zLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIF9yZWFkRGlyUmVjdXJzaXZlU3luYyhwYXRoLCBvcHRpb25zLCByZXN1bHRzKSB7XG4gICAgICAgIGlmICghdGhpcy5leGlzdHNTeW5jKHBhdGgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhdGggZG9lcyBub3QgZXhpc3QgJHtwYXRofWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGYgPSB0aGlzLnJlYWREaXJTeW5jKHBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZikge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdFN5bmMocGF0aF8xLmpvaW4ocGF0aCwgZmlsZSkpLnR5cGUgPT09IGV4cG9ydHMuRmlsZVN5c3RlbUVudHJ5VHlwZS5GSUxFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGaWxlSWZNYXRjaChvcHRpb25zLCBmaWxlLCByZXN1bHRzLCBwYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5kaXJlY3RvcnlOYW1lQmxhY2tMaXN0IHx8ICFvcHRpb25zLmRpcmVjdG9yeU5hbWVCbGFja0xpc3QuaW5jbHVkZXMoZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaW5jbHVkZURpcmVjdG9yaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aF8xLmpvaW4ocGF0aCwgZmlsZSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlYWREaXJSZWN1cnNpdmVTeW5jKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpLCBvcHRpb25zLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIGFkZEZpbGVJZk1hdGNoKG9wdGlvbnMsIGZpbGUsIHJlc3VsdHMsIHBhdGgpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLmV4Y2x1ZGVGaWxlcykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXh0ZW5zaW9uV2hpdGVMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnAgPSBuZXcgZmlsZV9wYXRoX3V0aWxzXzEuRmlsZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubWF0Y2hQYXJ0aWFsRXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5leHRlbnNpb25XaGl0ZUxpc3Quc29tZSgoZXh0KSA9PiBmcC5nZXRFeHRlbnNpb25TdHJpbmcoKS5lbmRzV2l0aChleHQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXh0ZW5zaW9uV2hpdGVMaXN0LmluY2x1ZGVzKGZwLmdldEV4dGVuc2lvblN0cmluZygpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuZXh0ZW5zaW9uQmxhY2tMaXN0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZnAgPSBuZXcgZmlsZV9wYXRoX3V0aWxzXzEuRmlsZVBhdGgoZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmV4dGVuc2lvbkJsYWNrTGlzdC5pbmNsdWRlcyhmcC5nZXRFeHRlbnNpb25TdHJpbmcoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhdGhfMS5qb2luKHBhdGgsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGF0aF8xLmpvaW4ocGF0aCwgZmlsZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFzeW5jIGltcG9ydChwYXRoKSB7XG4gICAgICAgIHJldHVybiBydW5Nb2R1bGUoYXdhaXQgdGhpcy5yZWFkRmlsZShwYXRoLCAndXRmOCcpKTtcbiAgICB9XG4gICAgaW1wb3J0U3luYyhwYXRoKSB7XG4gICAgICAgIHJldHVybiBydW5Nb2R1bGUodGhpcy5yZWFkRmlsZVN5bmMocGF0aCwgJ3V0ZjgnKSk7XG4gICAgfVxuICAgIGFzeW5jIGdldFN1YmZvbGRlcnMocGF0aCkge1xuICAgICAgICBjb25zdCBzdWJFbnRyaWVzID0gKGF3YWl0IHRoaXMucmVhZERpcihwYXRoKSkubWFwKChlbnRyeSkgPT4gcGF0aF8xLmpvaW4ocGF0aCwgZW50cnkpKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2Ygc3ViRW50cmllcykge1xuICAgICAgICAgICAgaWYgKChhd2FpdCB0aGlzLnN0YXQoZW50cnkpKS50eXBlID09PSBleHBvcnRzLkZpbGVTeXN0ZW1FbnRyeVR5cGUuRElSRUNUT1JZKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZW50cnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGdldFN1YmZvbGRlcnNTeW5jKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZERpclN5bmMocGF0aClcbiAgICAgICAgICAgIC5tYXAoKGVudHJ5KSA9PiBwYXRoXzEuam9pbihwYXRoLCBlbnRyeSkpXG4gICAgICAgICAgICAuZmlsdGVyKChlbnRyeSkgPT4gdGhpcy5zdGF0U3luYyhlbnRyeSkudHlwZSA9PT0gZXhwb3J0cy5GaWxlU3lzdGVtRW50cnlUeXBlLkRJUkVDVE9SWSk7XG4gICAgfVxufVxuZXhwb3J0cy5GaWxlU3lzdGVtID0gRmlsZVN5c3RlbTtcbmZ1bmN0aW9uIHJ1bk1vZHVsZShjb2RlKSB7XG4gICAgY29uc3Qgc2FuZGJveENvbnRleHQgPSB7IG1vZHVsZTogeyBleHBvcnRzOiB1bmRlZmluZWQgfSB9O1xuICAgIHZtLmNyZWF0ZUNvbnRleHQoc2FuZGJveENvbnRleHQpO1xuICAgIHZtLnJ1bkluQ29udGV4dChgKChtb2R1bGUpID0+IHske2NvZGV9fSkobW9kdWxlKWAsIHNhbmRib3hDb250ZXh0KTtcbiAgICByZXR1cm4gc2FuZGJveENvbnRleHQubW9kdWxlLmV4cG9ydHM7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2labWxzWlY5emVYTjBaVzB1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5Sm1hV3hsWDNONWMzUmxiUzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3p0QlFVRkJMSGxEUVVGclF6dEJRVU5zUXl3clFrRkJhMFE3UVVGRGJFUXNlVUpCUVhsQ08wRkJRM3BDTEhWRVFVRTJRenRCUVVNM1F5eHRRMEZCYjBNN1FVRkZjRU1zUTBGQlF5eFZRVUZWTEcxQ1FVRnRRanRKUVVNeFFpeHRRa0ZCYlVJc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTTdTVUZEY2tNc2JVSkJRVzFDTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWRCUVVjc1YwRkJWeXhEUVVGRE8wRkJRMjVFTEVOQlFVTXNRMEZCUXl4RFFVRkRMREpDUVVGdFFpeEpRVUZKTEVOQlFVTXNNa0pCUVcxQ0xFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTjBSQ3hOUVVGaExGVkJRVlU3U1VGRGJrSXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzVjBGQlZ5eEZRVUZGTEU5QlFVOHNSMEZCUnl4RlFVRkZPMUZCUXpORExFTkJRVU1zUlVGQlJTeFRRVUZUTEVWQlFVVXNWMEZCVnl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFRRVUZUTEVWQlFVVXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlJTeE5RVUZOTEZWQlFWVXNSMEZCUnl4TlFVRk5MRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4VFFVRlRMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRGJrVXNUMEZCVHl4cFFrRkJTeXhEUVVGRExGVkJRVlVzUlVGQlJTeFhRVUZYTEVOQlFVTXNRMEZCUXp0SlFVTXhReXhEUVVGRE8wbEJRMFFzVVVGQlVTeERRVUZETEZOQlFWTXNSVUZCUlN4WFFVRlhMRVZCUVVVc1QwRkJUeXhIUVVGSExFVkJRVVU3VVVGRGVrTXNRMEZCUXl4RlFVRkZMRk5CUVZNc1JVRkJSU3hYUVVGWExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRk5CUVZNc1JVRkJSU3hYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEzcEZMRTFCUVUwc1ZVRkJWU3hIUVVGSExFbEJRVWtzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhUUVVGVExFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdVVUZEYWtVc1QwRkJUeXhwUWtGQlN5eERRVUZETEZWQlFWVXNSVUZCUlN4WFFVRlhMRU5CUVVNc1EwRkJRenRKUVVNeFF5eERRVUZETzBsQlEwUXNXVUZCV1N4RFFVRkRMRk5CUVZNc1JVRkJSU3hYUVVGWE8xRkJReTlDTEVsQlFVa3NWMEZCVnl4RFFVRkRMRlZCUVZVc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJUdFpRVU0zUWl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTXhRenRSUVVORUxFMUJRVTBzVFVGQlRTeEhRVUZITEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03VVVGRGRFTXNUMEZCVHl4TlFVRk5MRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU03V1VGRGRFSXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEVkQlFVY3NRMEZCUXp0WlFVTjRRaXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRE8xbEJRM2hDTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlR0WlFVTXhRaXhUUVVGVExFZEJRVWNzVjBGQlNTeERRVUZETEZOQlFWTXNSVUZCUlN4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFRRVU12UXp0UlFVTkVMRTlCUVU4c1JVRkJSU3hUUVVGVExFVkJRVVVzVjBGQlZ5eEZRVUZGTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUTBGQlF6dEpRVU40UkN4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eFJRVUZSTEVWQlFVVXNUVUZCVFR0UlFVTm9ReXhOUVVGTkxFOUJRVThzUjBGQlJ5eE5RVUZOTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETzFGQlEzUkVMRTlCUVU4N1dVRkRTQ3hSUVVGUkxFVkJRVVVzVVVGQlVUdFpRVU5zUWl4UFFVRlBPMWxCUTFBc1NVRkJTU3hGUVVGRkxESkNRVUZ0UWl4RFFVRkRMRWxCUVVrN1dVRkRPVUlzVFVGQlRUdFRRVU5VTEVOQlFVTTdTVUZEVGl4RFFVRkRPMGxCUTBRc1UwRkJVeXhEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTzFGQlEzSkNMRTlCUVU4c1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEY2tVc1EwRkJRenRKUVVORUxFdEJRVXNzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhMUVVGTExFVkJRVVVzVVVGQlVUdFJRVU5zUXl4TlFVRk5MRkZCUVZFc1IwRkJSeXhGUVVGRkxFTkJRVU03VVVGRGNFSXNUVUZCVFN4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRMjVDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRSUVVOV0xFdEJRVXNzVFVGQlRTeEpRVUZKTEVsQlFVa3NTMEZCU3l4RlFVRkZPMWxCUTNSQ0xFMUJRVTBzUzBGQlN5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRPMWxCUTJ4Q0xGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSVHRuUWtGRE5VTXNTVUZCU1N4TlFVRk5MRVZCUVVVN2IwSkJRMUlzVDBGQlR5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSVHQzUWtGRGJFUXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF6dHZRa0ZETjBJc1EwRkJReXhEUVVGRExFTkJRVU03YVVKQlEwNDdjVUpCUTBrN2IwSkJRMFFzVDBGQlR5eFRRVUZUTEVOQlFVTTdhVUpCUTNCQ08xbEJRMHdzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTlFPMUZCUTBRc1RVRkJUU3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUXpWQ0xFOUJRVThzVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEZOQlFWTXNRMEZCUXl4RFFVRkRPMGxCUTJ4RUxFTkJRVU03U1VGRFJDeExRVUZMTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hSUVVGUk8xRkJRMmhETEVsQlFVa3NUVUZCVFN4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzFsQlEzcENMRTlCUVU4c1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN1UwRkRlRU03WVVGRFNUdFpRVU5FTEU5QlFVOHNVMEZCVXl4RFFVRkRPMU5CUTNCQ08wbEJRMHdzUTBGQlF6dEpRVU5FTEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUlVGQlJTeFJRVUZSTzFGQlF6bENMRWxCUVVrc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0WlFVTjJRaXhQUVVGUExFbEJRVWtzUTBGQlF5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8xTkJRelZETzJGQlEwazdXVUZEUkN4UFFVRlBMRk5CUVZNc1EwRkJRenRUUVVOd1FqdEpRVU5NTEVOQlFVTTdTVUZEUkN4cFFrRkJhVUlzUTBGQlF5eFJRVUZSTEVWQlFVVXNUVUZCVFR0UlFVTTVRaXhOUVVGTkxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRkZCUVZFc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dFJRVU53UkN4UFFVRlBPMWxCUTBnc1VVRkJVU3hGUVVGRkxGRkJRVkU3V1VGRGJFSXNUMEZCVHp0WlFVTlFMRWxCUVVrc1JVRkJSU3d5UWtGQmJVSXNRMEZCUXl4SlFVRkpPMWxCUXpsQ0xFMUJRVTA3VTBGRFZDeERRVUZETzBsQlEwNHNRMEZCUXp0SlFVTkVMRXRCUVVzc1EwRkJReXhoUVVGaExFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMDdVVUZET1VJc1RVRkJUU3hMUVVGTExFZEJRVWNzVFVGQlRTeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTNSRUxFdEJRVXNzVFVGQlRTeEpRVUZKTEVsQlFVa3NTMEZCU3l4RlFVRkZPMWxCUTNSQ0xFMUJRVTBzVDBGQlR5eEhRVUZITEZkQlFVa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1pVRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTNKRUxFMUJRVTBzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4WlFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEZEVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRjRVU3U1VGRFRDeERRVUZETzBsQlEwUXNhVUpCUVdsQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMDdVVUZETlVJc1RVRkJUU3hMUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTndSQ3hMUVVGTExFMUJRVTBzU1VGQlNTeEpRVUZKTEV0QlFVc3NSVUZCUlR0WlFVTjBRaXhOUVVGTkxFOUJRVThzUjBGQlJ5eFhRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMR1ZCUVZFc1EwRkJReXhOUVVGTkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnlSQ3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMU5CUTJoRk8wbEJRMHdzUTBGQlF6dEpRVU5FTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTA3VVVGRGVrSXNUMEZCVHl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEZGtVc1EwRkJRenRKUVVORUxGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFR0UlFVTjJRaXhQUVVGUExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRla1VzUTBGQlF6dEpRVU5FTEV0QlFVc3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eE5RVUZOTEVWQlFVVXNaMEpCUVdkQ0xFVkJRVVVzVlVGQlZUdFJRVU42UkN4UFFVRlBMR2RDUVVGblFpeERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRVZCUVVVc1RVRkJUU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRM1pHTEVOQlFVTTdTVUZEUkN4elFrRkJjMElzUTBGQlF5eE5RVUZOTEVWQlFVVXNaMEpCUVdkQ0xFVkJRVVVzVlVGQlZUdFJRVU4yUkN4UFFVRlBMR2RDUVVGblFpeERRVUZETEdGQlFXRXNRMEZCUXl4VlFVRlZMRVZCUVVVc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVONlJpeERRVUZETzBsQlEwUXNTMEZCU3l4RFFVRkRMR3RDUVVGclFpeERRVUZETEUxQlFVMHNSVUZCUlN4blFrRkJaMElzUlVGQlJTeFZRVUZWTzFGQlEzcEVMRTFCUVUwc1NVRkJTU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRTFCUVUwc1JVRkJSU3huUWtGQlowSXNSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVOd1JTeE5RVUZOTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03U1VGRE9VSXNRMEZCUXp0SlFVTkVMSE5DUVVGelFpeERRVUZETEUxQlFVMHNSVUZCUlN4blFrRkJaMElzUlVGQlJTeFZRVUZWTzFGQlEzWkVMRWxCUVVrc1EwRkJReXh6UWtGQmMwSXNRMEZCUXl4TlFVRk5MRVZCUVVVc1owSkJRV2RDTEVWQlFVVXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkRiRVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRKUVVNMVFpeERRVUZETzBsQlEwUXNTMEZCU3l4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFVkJRVVVzV1VGQldTeEhRVUZITEVsQlFVa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1JVRkJSVHRSUVVOcVJDeE5RVUZOTEZGQlFWRXNSMEZCUnl4TlFVRk5MRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlF5OUZMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEY0VJc1NVRkJTU3haUVVGWkxFVkJRVVU3V1VGRFpDeFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRUUVVONFF6dFJRVU5FTEU5QlFVOHNiVUpCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU03WVVGRGNFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdZVUZEZWtJc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlEzWkNMRU5CUVVNN1NVRkRSQ3h0UWtGQmJVSXNRMEZCUXl4UlFVRlJMRVZCUVVVc1RVRkJUVHRSUVVOb1F5eFBRVUZQTzFsQlEwZ3NTVUZCU1N4RlFVRkZMREpDUVVGdFFpeERRVUZETEZOQlFWTTdXVUZEYmtNc1VVRkJVVHRaUVVOU0xFMUJRVTA3V1VGRFRpeFBRVUZQTEVWQlFVVXNSVUZCUlN4TFFVRkxMRVZCUVVVc1JVRkJSU3hGUVVGRkxFOUJRVThzUlVGQlJTeEZRVUZGTEVWQlFVVTdVMEZEZEVNc1EwRkJRenRKUVVOT0xFTkJRVU03U1VGRFJDeExRVUZMTEVOQlFVTXNaVUZCWlN4RFFVRkRMRWxCUVVrN1VVRkRkRUlzU1VGQlNTeE5RVUZOTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVU3V1VGRGVrSXNUVUZCVFN4TlFVRk5MRWRCUVVjc1JVRkJSU3hEUVVGRE8xbEJRMnhDTEUxQlFVMHNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVNM1F5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRE8xbEJRM0pDTEUxQlFVMHNTVUZCU1N4RFFVRkRMSE5DUVVGelFpeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVOcVJDeFBRVUZQTEUxQlFVMHNRMEZCUXp0VFFVTnFRanRoUVVOSk8xbEJRMFFzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4UlFVRlJMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTXNRMEZCUXp0VFFVTnNSRHRKUVVOTUxFTkJRVU03U1VGRFJDeExRVUZMTEVOQlFVTXNjMEpCUVhOQ0xFTkJRVU1zUjBGQlJ5eEZRVUZGTEV0QlFVczdVVUZEYmtNc1RVRkJUU3hSUVVGUkxFZEJRVWNzVFVGQlRTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU53UkN4TFFVRkxMRTFCUVUwc1QwRkJUeXhKUVVGSkxGRkJRVkVzUlVGQlJUdFpRVU0xUWl4TlFVRk5MRTlCUVU4c1IwRkJSeXhYUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVNNVF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMREpDUVVGdFFpeERRVUZETEZOQlFWTXNSVUZCUlR0blFrRkRia1VzVFVGQlRTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMRzFDUVVGdFFpeERRVUZETEU5QlFVOHNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRE1VUXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMmRDUVVOeVF5eEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRE8yZENRVU40UWl4SlFVRkpMRU5CUVVNc2MwSkJRWE5DTEVOQlFVTXNSMEZCUnl4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8yRkJRemxETzJsQ1FVTkpPMmRDUVVORUxFMUJRVTBzVVVGQlVTeEhRVUZITEUxQlFVMHNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhQUVVGUExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUXpGRUxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEZGQlFWRXNRMEZCUXp0aFFVTXpRanRUUVVOS08wbEJRMHdzUTBGQlF6dEpRVU5FTEV0QlFVc3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFhRVUZYTzFGQlF6bENMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNSVUZCUlN4WFFVRlhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03U1VGRE9VUXNRMEZCUXp0SlFVTkVMRzlDUVVGdlFpeERRVUZETEZkQlFWYzdVVUZETlVJc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RlFVRkZMRmRCUVZjc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dEpRVU5zUlN4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTzFGQlEySXNUVUZCVFN4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFZRVUZITEVOQlFVTXNRMEZCUXp0UlFVTXZRaXhKUVVGSkxGZEJRVmNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZEY2tJc1MwRkJTeXhOUVVGTkxFTkJRVU1zU1VGQlNTeE5RVUZOTEVWQlFVVTdXVUZEY0VJc1YwRkJWeXhKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU5xUWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFVkJRVVU3WjBKQlEzaERMRTFCUVUwc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0aFFVTnFRenRaUVVORUxGZEJRVmNzU1VGQlNTeFZRVUZITEVOQlFVTTdVMEZEZEVJN1NVRkRUQ3hEUVVGRE8wbEJRMFFzVlVGQlZTeERRVUZETEVsQlFVazdVVUZEV0N4TlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZWQlFVY3NRMEZCUXl4RFFVRkRPMUZCUXk5Q0xFbEJRVWtzVjBGQlZ5eEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTnlRaXhMUVVGTExFMUJRVTBzUTBGQlF5eEpRVUZKTEUxQlFVMHNSVUZCUlR0WlFVTndRaXhYUVVGWExFbEJRVWtzUTBGQlF5eERRVUZETzFsQlEycENMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4WFFVRlhMRU5CUVVNc1JVRkJSVHRuUWtGRGNFTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dGhRVU12UWp0WlFVTkVMRmRCUVZjc1NVRkJTU3hWUVVGSExFTkJRVU03VTBGRGRFSTdTVUZEVEN4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExHVkJRV1VzUTBGQlF5eEpRVUZKTzFGQlEzUkNMRTFCUVUwc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTm9ReXhOUVVGTkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1NVRkRNMElzUTBGQlF6dEpRVU5FTEcxQ1FVRnRRaXhEUVVGRExFbEJRVWs3VVVGRGNFSXNTVUZCU1N4RFFVRkRMR3RDUVVGclFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUXpsQ0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1NVRkRla0lzUTBGQlF6dEpRVU5FTEV0QlFVc3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTVHRSUVVOeVFpeE5RVUZOTEV0QlFVc3NSMEZCUnl4TlFVRk5MRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEZGtNc1MwRkJTeXhOUVVGTkxFbEJRVWtzU1VGQlNTeExRVUZMTEVWQlFVVTdXVUZEZEVJc1RVRkJUU3hSUVVGUkxFZEJRVWNzVjBGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dFpRVU0zUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExESkNRVUZ0UWl4RFFVRkRMRk5CUVZNc1JVRkJSVHRuUWtGRGNFVXNUVUZCVFN4SlFVRkpMRU5CUVVNc1kwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzJkQ1FVTndReXhOUVVGTkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1lVRkRPVUk3YVVKQlEwazdaMEpCUTBRc1RVRkJUU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMkZCUXk5Q08xTkJRMG83U1VGRFRDeERRVUZETzBsQlEwUXNhMEpCUVd0Q0xFTkJRVU1zU1VGQlNUdFJRVU51UWl4TlFVRk5MRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUTNKRExFdEJRVXNzVFVGQlRTeEpRVUZKTEVsQlFVa3NTMEZCU3l4RlFVRkZPMWxCUTNSQ0xFMUJRVTBzVVVGQlVTeEhRVUZITEZkQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdXVUZETjBNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXd5UWtGQmJVSXNRMEZCUXl4VFFVRlRMRVZCUVVVN1owSkJRMmhGTEVsQlFVa3NRMEZCUXl4clFrRkJhMElzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0blFrRkRiRU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRoUVVNMVFqdHBRa0ZEU1R0blFrRkRSQ3hKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMkZCUXpkQ08xTkJRMG83U1VGRFRDeERRVUZETzBsQlEwUXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhWUVVGVkxFVkJRVVVzVDBGQlR5eEZRVUZGTEZWQlFWVXNSMEZCUnl4SFFVRkhMRVZCUVVVc1ZVRkJWU3hIUVVGSExFZEJRVWM3VVVGREwwUXNTVUZCU1N4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRVZCUVVVN1dVRkRiRU1zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3MFFrRkJORUlzUTBGQlF5eERRVUZETzFOQlEycEVPMUZCUTBRc1NVRkJTU3hEUVVGRExFTkJRVU1zVFVGQlRTeFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFVkJRVVU3V1VGRGVFTXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXcwUWtGQk5FSXNRMEZCUXl4RFFVRkRPMU5CUTJwRU8xRkJRMFFzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4VlFVRlZMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNWVUZCVlN4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJRM1pGTEV0QlFVc3NUVUZCVFN4SlFVRkpMRWxCUVVrc1QwRkJUeXhGUVVGRk8xbEJRM2hDTEVsQlFVa3NUMEZCVHl4RFFVRkRMR3RDUVVGclFpeEpRVUZKTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMREpDUVVGdFFpeERRVUZETEZOQlFWTXNSVUZCUlR0blFrRkRPVVlzVFVGQlRTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJRek5DTzJsQ1FVTkpPMmRDUVVORUxFMUJRVTBzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMREJDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNXVUZCV1N4RlFVRkZMRU5CUVVNc1EwRkJRenRuUWtGRGNrUXNUVUZCVFN4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExGZEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNTVUZCU1N4RFFVRkRMRVZCUVVVc1RVRkJUU3hWUVVGVkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJRM3BHTzFOQlEwbzdTVUZEVEN4RFFVRkRPMGxCUTBRc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTlCUVU4N1VVRkRNVUlzVDBGQlR5eEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeEZRVUZGTEU5QlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVOeVJDeERRVUZETzBsQlEwUXNiMEpCUVc5Q0xFTkJRVU1zU1VGQlNTeEZRVUZGTEU5QlFVODdVVUZET1VJc1QwRkJUeXhKUVVGSkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTjZSQ3hEUVVGRE8wbEJRMFFzUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNUMEZCVHp0UlFVTXhReXhKUVVGSkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUlVGQlJUdFpRVU0xUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIVkNRVUYxUWl4SlFVRkpMRVZCUVVVc1EwRkJReXhEUVVGRE8xTkJRMnhFTzFGQlEwUXNUVUZCVFN4RFFVRkRMRWRCUVVjc1RVRkJUU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUTI1RExFdEJRVXNzVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RlFVRkZPMWxCUTJ4Q0xFbEJRVWtzUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1YwRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExESkNRVUZ0UWl4RFFVRkRMRWxCUVVrc1JVRkJSVHRuUWtGRGRrVXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRoUVVOeVJEdHBRa0ZEU1R0blFrRkRSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEhOQ1FVRnpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEhOQ1FVRnpRaXhEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0dlFrRkRia1lzU1VGQlNTeFBRVUZQTEVOQlFVTXNhMEpCUVd0Q0xFVkJRVVU3ZDBKQlF6VkNMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8zRkNRVU5zUXp0dlFrRkRSQ3hOUVVGTkxFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhYUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RlFVRkZMRTlCUVU4c1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dHBRa0ZEY0VVN1lVRkRTanRUUVVOS08xRkJRMFFzVDBGQlR5eFBRVUZQTEVOQlFVTTdTVUZEYmtJc1EwRkJRenRKUVVORUxIRkNRVUZ4UWl4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzVDBGQlR6dFJRVU40UXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0WlFVTjRRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhWQ1FVRjFRaXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETzFOQlEyeEVPMUZCUTBRc1RVRkJUU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOcVF5eExRVUZMTEUxQlFVMHNTVUZCU1N4SlFVRkpMRU5CUVVNc1JVRkJSVHRaUVVOc1FpeEpRVUZKTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXd5UWtGQmJVSXNRMEZCUXl4SlFVRkpMRVZCUVVVN1owSkJRMjVGTEVsQlFVa3NRMEZCUXl4alFVRmpMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1lVRkRja1E3YVVKQlEwazdaMEpCUTBRc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eHpRa0ZCYzBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eHpRa0ZCYzBJc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVTdiMEpCUTI1R0xFbEJRVWtzVDBGQlR5eERRVUZETEd0Q1FVRnJRaXhGUVVGRk8zZENRVU0xUWl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExGZEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenR4UWtGRGJFTTdiMEpCUTBRc1NVRkJTU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRmRCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8ybENRVU5zUlR0aFFVTktPMU5CUTBvN1VVRkRSQ3hQUVVGUExFOUJRVThzUTBGQlF6dEpRVU51UWl4RFFVRkRPMGxCUTBRc1kwRkJZeXhEUVVGRExFOUJRVThzUlVGQlJTeEpRVUZKTEVWQlFVVXNUMEZCVHl4RlFVRkZMRWxCUVVrN1VVRkRka01zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4WlFVRlpMRVZCUVVVN1dVRkRka0lzU1VGQlNTeFBRVUZQTEVOQlFVTXNhMEpCUVd0Q0xFVkJRVVU3WjBKQlF6VkNMRTFCUVUwc1JVRkJSU3hIUVVGSExFbEJRVWtzTUVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRuUWtGRE9VSXNTVUZCU1N4UFFVRlBMRU5CUVVNc2MwSkJRWE5DTEVWQlFVVTdiMEpCUTJoRExFbEJRVWtzVDBGQlR5eERRVUZETEd0Q1FVRnJRaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1JVRkJSU3hEUVVGRExHdENRVUZyUWl4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVTdkMEpCUTJwR0xFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzNGQ1FVTnNRenRwUWtGRFNqdHhRa0ZEU1R0dlFrRkRSQ3hKUVVGSkxFOUJRVThzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFTkJRVU1zUlVGQlJUdDNRa0ZET1VRc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03Y1VKQlEyeERPMmxDUVVOS08yRkJRMG83YVVKQlEwa3NTVUZCU1N4UFFVRlBMRU5CUVVNc2EwSkJRV3RDTEVWQlFVVTdaMEpCUTJwRExFMUJRVTBzUlVGQlJTeEhRVUZITEVsQlFVa3NNRUpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZET1VJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEd0Q1FVRnJRaXhGUVVGRkxFTkJRVU1zUlVGQlJUdHZRa0ZETDBRc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03YVVKQlEyeERPMkZCUTBvN2FVSkJRMGs3WjBKQlEwUXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhYUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRiRU03VTBGRFNqdEpRVU5NTEVOQlFVTTdTVUZEUkN4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWs3VVVGRFlpeFBRVUZQTEZOQlFWTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRlRVFzUTBGQlF6dEpRVU5FTEZWQlFWVXNRMEZCUXl4SlFVRkpPMUZCUTFnc1QwRkJUeXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVU4wUkN4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTzFGQlEzQkNMRTFCUVUwc1ZVRkJWU3hIUVVGSExFTkJRVU1zVFVGQlRTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRVZCUVVVc1EwRkJReXhYUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRhRVlzVFVGQlRTeE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTJ4Q0xFdEJRVXNzVFVGQlRTeExRVUZMTEVsQlFVa3NWVUZCVlN4RlFVRkZPMWxCUXpWQ0xFbEJRVWtzUTBGQlF5eE5RVUZOTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NNa0pCUVcxQ0xFTkJRVU1zVTBGQlV5eEZRVUZGTzJkQ1FVTnFSU3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMkZCUTNSQ08xTkJRMG83VVVGRFJDeFBRVUZQTEUxQlFVMHNRMEZCUXp0SlFVTnNRaXhEUVVGRE8wbEJRMFFzYVVKQlFXbENMRU5CUVVNc1NVRkJTVHRSUVVOc1FpeFBRVUZQTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRE8yRkJRM2hDTEVkQlFVY3NRMEZCUXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hGUVVGRkxFTkJRVU1zVjBGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRoUVVOcVF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExESkNRVUZ0UWl4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8wbEJRM2hHTEVOQlFVTTdRMEZEU2p0QlFXaFdSQ3huUTBGblZrTTdRVUZEUkN4VFFVRlRMRk5CUVZNc1EwRkJReXhKUVVGSk8wbEJRMjVDTEUxQlFVMHNZMEZCWXl4SFFVRkhMRVZCUVVVc1RVRkJUU3hGUVVGRkxFVkJRVVVzVDBGQlR5eEZRVUZGTEZOQlFWTXNSVUZCUlN4RlFVRkZMRU5CUVVNN1NVRkRNVVFzUlVGQlJTeERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRenRKUVVOcVF5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMR2xDUVVGcFFpeEpRVUZKTEZsQlFWa3NSVUZCUlN4alFVRmpMRU5CUVVNc1EwRkJRenRKUVVOdVJTeFBRVUZQTEdOQlFXTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRE8wRkJRM3BETEVOQlFVTWlmUT09Il19