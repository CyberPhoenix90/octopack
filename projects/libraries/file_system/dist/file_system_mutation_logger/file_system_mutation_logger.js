"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
(function (FileSystemMutationOperation) {
    FileSystemMutationOperation[FileSystemMutationOperation["MK_DIR"] = 0] = "MK_DIR";
    FileSystemMutationOperation[FileSystemMutationOperation["RM_DIR"] = 1] = "RM_DIR";
    FileSystemMutationOperation[FileSystemMutationOperation["UNLINK"] = 2] = "UNLINK";
    FileSystemMutationOperation[FileSystemMutationOperation["WRITE"] = 3] = "WRITE";
})(exports.FileSystemMutationOperation || (exports.FileSystemMutationOperation = {}));
class FileSystemMutationLogger extends file_system_1.FileSystem {
    constructor(sourceFileSystem, options = {}) {
        super();
        this.fileSystem = sourceFileSystem;
        this.options = options;
        this.fileSystemMutations = [];
        this.writtenFiles = new Set();
    }
    watch(paths, options, callback) {
        return this.fileSystem.watch(paths, options, callback);
    }
    watchSync(paths, options, callback) {
        return this.fileSystem.watchSync(paths, options, callback);
    }
    readlink(path) {
        return this.fileSystem.readlink(path);
    }
    readlinkSync(path) {
        return this.fileSystem.readlinkSync(path);
    }
    realpath(path) {
        return this.fileSystem.realpath(path);
    }
    realpathSync(path) {
        return this.fileSystem.realpathSync(path);
    }
    async mkdir(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.MK_DIR
        });
        return this.fileSystem.mkdir(path);
    }
    mkdirSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.MK_DIR
        });
        return this.fileSystem.mkdirSync(path);
    }
    async rmdir(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.RM_DIR
        });
        return this.fileSystem.rmdir(path);
    }
    rmdirSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.RM_DIR
        });
        return this.fileSystem.rmdirSync(path);
    }
    async unlink(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.UNLINK,
            previousContent: this.options.logContentBeforeMutation && (await this.readFileIfExist(path, 'utf8'))
        });
        return this.fileSystem.unlink(path);
    }
    unlinkSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: exports.FileSystemMutationOperation.UNLINK,
            previousContent: this.options.logContentBeforeMutation && this.readFileIfExistSync(path, 'utf8')
        });
        return this.fileSystem.unlinkSync(path);
    }
    async readFile(path, encoding) {
        return this.fileSystem.readFile(path, encoding);
    }
    readFileSync(path, encoding) {
        return this.fileSystem.readFileSync(path, encoding);
    }
    async stat(path) {
        return this.fileSystem.stat(path);
    }
    statSync(path) {
        return this.fileSystem.statSync(path);
    }
    async readDir(path) {
        return this.fileSystem.readDir(path);
    }
    readDirSync(path) {
        return this.fileSystem.readDirSync(path);
    }
    async exists(path) {
        return this.fileSystem.exists(path);
    }
    existsSync(path) {
        return this.fileSystem.existsSync(path);
    }
    async writeFile(path, content) {
        const prevContent = await this.readFileIfExist(path, 'utf8');
        this.writtenFiles.add(path);
        this.fileSystemMutations.push({
            path,
            newContent: content,
            operation: exports.FileSystemMutationOperation.WRITE,
            contentChanged: prevContent !== content,
            previousContent: this.options.logContentBeforeMutation && prevContent
        });
        return this.fileSystem.writeFile(path, content);
    }
    writeFileSync(path, content) {
        const prevContent = this.readFileIfExistSync(path, 'utf8');
        this.writtenFiles.add(path);
        this.fileSystemMutations.push({
            path,
            newContent: content,
            operation: exports.FileSystemMutationOperation.WRITE,
            contentChanged: prevContent !== content,
            previousContent: this.options.logContentBeforeMutation && prevContent
        });
        return this.fileSystem.writeFileSync(path, content);
    }
}
exports.FileSystemMutationLogger = FileSystemMutationLogger;