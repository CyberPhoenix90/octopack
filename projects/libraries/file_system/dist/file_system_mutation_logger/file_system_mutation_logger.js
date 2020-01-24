"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
var FileSystemMutationOperation;
(function (FileSystemMutationOperation) {
    FileSystemMutationOperation[FileSystemMutationOperation["MK_DIR"] = 0] = "MK_DIR";
    FileSystemMutationOperation[FileSystemMutationOperation["RM_DIR"] = 1] = "RM_DIR";
    FileSystemMutationOperation[FileSystemMutationOperation["UNLINK"] = 2] = "UNLINK";
    FileSystemMutationOperation[FileSystemMutationOperation["WRITE"] = 3] = "WRITE";
})(FileSystemMutationOperation = exports.FileSystemMutationOperation || (exports.FileSystemMutationOperation = {}));
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
            operation: FileSystemMutationOperation.MK_DIR
        });
        return this.fileSystem.mkdir(path);
    }
    mkdirSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.MK_DIR
        });
        return this.fileSystem.mkdirSync(path);
    }
    async rmdir(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.RM_DIR
        });
        return this.fileSystem.rmdir(path);
    }
    rmdirSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.RM_DIR
        });
        return this.fileSystem.rmdirSync(path);
    }
    async unlink(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.UNLINK,
            previousContent: this.options.logContentBeforeMutation && (await this.readFileIfExist(path, 'utf8'))
        });
        return this.fileSystem.unlink(path);
    }
    unlinkSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.UNLINK,
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
            operation: FileSystemMutationOperation.WRITE,
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
            operation: FileSystemMutationOperation.WRITE,
            contentChanged: prevContent !== content,
            previousContent: this.options.logContentBeforeMutation && prevContent
        });
        return this.fileSystem.writeFileSync(path, content);
    }
}
exports.FileSystemMutationLogger = FileSystemMutationLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZpbGVfc3lzdGVtX211dGF0aW9uX2xvZ2dlci9maWxlX3N5c3RlbV9tdXRhdGlvbl9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBbUU7QUFFbkUsSUFBWSwyQkFLWDtBQUxELFdBQVksMkJBQTJCO0lBQ3RDLGlGQUFNLENBQUE7SUFDTixpRkFBTSxDQUFBO0lBQ04saUZBQU0sQ0FBQTtJQUNOLCtFQUFLLENBQUE7QUFDTixDQUFDLEVBTFcsMkJBQTJCLEdBQTNCLG1DQUEyQixLQUEzQixtQ0FBMkIsUUFLdEM7QUFjRCxNQUFhLHdCQUF5QixTQUFRLHdCQUFVO0lBTXZELFlBQVksZ0JBQTRCLEVBQUUsVUFBMkMsRUFBRTtRQUN0RixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFlLEVBQUUsT0FBWSxFQUFFLFFBQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDTSxTQUFTLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQzVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sUUFBUSxDQUFDLElBQVk7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFB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