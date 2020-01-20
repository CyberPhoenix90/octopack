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
    constructor(sourceFileSystem, logContentBeforeMutation = false) {
        super();
        this.fileSystem = sourceFileSystem;
        this.logContentBeforeMutation = logContentBeforeMutation;
        this.fileSystemMutations = [];
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
            previousContent: this.logContentBeforeMutation && (await this.readFileIfExist(path, 'utf8'))
        });
        return this.fileSystem.unlink(path);
    }
    unlinkSync(path) {
        this.fileSystemMutations.push({
            path,
            operation: FileSystemMutationOperation.UNLINK,
            previousContent: this.logContentBeforeMutation && this.readFileIfExistSync(path, 'utf8')
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
        this.fileSystemMutations.push({
            path,
            newContent: content,
            operation: FileSystemMutationOperation.WRITE,
            contentChanged: prevContent !== content,
            previousContent: this.logContentBeforeMutation && prevContent
        });
        return this.fileSystem.writeFile(path, content);
    }
    writeFileSync(path, content) {
        const prevContent = this.readFileIfExistSync(path, 'utf8');
        this.fileSystemMutations.push({
            path,
            newContent: content,
            operation: FileSystemMutationOperation.WRITE,
            contentChanged: prevContent !== content,
            previousContent: this.logContentBeforeMutation && prevContent
        });
        return this.fileSystem.writeFileSync(path, content);
    }
}
exports.FileSystemMutationLogger = FileSystemMutationLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZpbGVfc3lzdGVtX211dGF0aW9uX2xvZ2dlci9maWxlX3N5c3RlbV9tdXRhdGlvbl9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBbUU7QUFFbkUsSUFBWSwyQkFLWDtBQUxELFdBQVksMkJBQTJCO0lBQ3RDLGlGQUFNLENBQUE7SUFDTixpRkFBTSxDQUFBO0lBQ04saUZBQU0sQ0FBQTtJQUNOLCtFQUFLLENBQUE7QUFDTixDQUFDLEVBTFcsMkJBQTJCLEdBQTNCLG1DQUEyQixLQUEzQixtQ0FBMkIsUUFLdEM7QUFVRCxNQUFhLHdCQUF5QixTQUFRLHdCQUFVO0lBS3ZELFlBQVksZ0JBQTRCLEVBQUUsMkJBQW9DLEtBQUs7UUFDbEYsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDO1FBQ25DLElBQUksQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztRQUN6RCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQ3hELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ00sU0FBUyxDQUFDLEtBQWUsRUFBRSxPQUFZLEVBQUUsUUFBYTtRQUM1RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxJQUFZO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNNLFlB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