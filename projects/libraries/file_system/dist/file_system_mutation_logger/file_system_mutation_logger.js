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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQXlCLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkUsTUFBTSxDQUFOLElBQVksMkJBS1g7QUFMRCxXQUFZLDJCQUEyQjtJQUN0QyxpRkFBTSxDQUFBO0lBQ04saUZBQU0sQ0FBQTtJQUNOLGlGQUFNLENBQUE7SUFDTiwrRUFBSyxDQUFBO0FBQ04sQ0FBQyxFQUxXLDJCQUEyQixLQUEzQiwyQkFBMkIsUUFLdEM7QUFjRCxNQUFNLE9BQU8sd0JBQXlCLFNBQVEsVUFBVTtJQU12RCxZQUFZLGdCQUE0QixFQUFFLFVBQTJDLEVBQUU7UUFDdEYsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQ3hELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ00sU0FBUyxDQUFDLEtBQWUsRUFBRSxPQUFZLEVBQUUsUUFBYTtRQUM1RCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVNLFFBQVEsQ0FBQyxJQUFZO1FBQzNCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMs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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZV9zeXN0ZW1fbXV0YXRpb25fbG9nZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQTRDO0FBRTVDLENBQUMsVUFBVSwyQkFBMkI7SUFDbEMsMkJBQTJCLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQ2xGLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUNsRiwyQkFBMkIsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDbEYsMkJBQTJCLENBQUMsMkJBQTJCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3BGLENBQUMsQ0FBQyxDQUFDLG1DQUEyQixJQUFJLENBQUMsbUNBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RSxNQUFhLHdCQUF5QixTQUFRLHdCQUFVO0lBQ3BELFlBQVksZ0JBQWdCLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDdEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFDRCxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBQ0QsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUTtRQUM5QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNELFFBQVEsQ0FBQyxJQUFJO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsWUFBWSxDQUFDLElBQUk7UUFDYixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDRCxRQUFRLENBQUMsSUFBSTtRQUNULE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUNELFlBQVksQ0FBQyxJQUFJO1FBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJO1FBQ1osSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQztZQUMxQixJQUFJO1lBQ0osU0FBUyxFQUFFLG1DQUEyQixDQUFDLE1BQU07U0FDaEQsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsU0FBUyxDQUFDLElBQUk7UUFDVixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUk7WUFDSixTQUFTLEVBQUUsbUNBQTJCLENBQUMsTUFBTTtTQUNoRCxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFDRCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUk7UUFDWixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUk7WUFDSixTQUFTLEVBQUUsbUNBQTJCLENBQUMsTUFBTTtTQUNoRCxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxTQUFTLENBQUMsSUFBSTtRQUNWLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQ0FBMkIsQ0FBQyxNQUFNO1NBQ2hELENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNiLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQ0FBMkIsQ0FBQyxNQUFNO1lBQzdDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN2RyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDRCxVQUFVLENBQUMsSUFBSTtRQUNYLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSTtZQUNKLFNBQVMsRUFBRSxtQ0FBMkIsQ0FBQyxNQUFNO1lBQzdDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO1NBQ25HLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUNELEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVE7UUFDekIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUNELFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUTtRQUN2QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsUUFBUSxDQUFDLElBQUk7UUFDVCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUk7UUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxXQUFXLENBQUMsSUFBSTtRQUNaLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNiLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFJO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTztRQUN6QixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSTtZQUNKLFVBQVUsRUFBRSxPQUFPO1lBQ25CLFNBQVMsRUFBRSxtQ0FBMkIsQ0FBQyxLQUFLO1lBQzVDLGNBQWMsRUFBRSxXQUFXLEtBQUssT0FBTztZQUN2QyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsSUFBSSxXQUFXO1NBQ3hFLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFDRCxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU87UUFDdkIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUk7WUFDSixVQUFVLEVBQUUsT0FBTztZQUNuQixTQUFTLEVBQUUsbUNBQTJCLENBQUMsS0FBSztZQUM1QyxjQUFjLEVBQUUsV0FBVyxLQUFLLE9BQU87WUFDdkMsZUFBZSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsd0JBQXdCLElBQUksV0FBVztTQUN4RSxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0NBQ0o7QUF0SEQsNERBc0hDO0FBQ0QsODlLQUE4OUsifQ==