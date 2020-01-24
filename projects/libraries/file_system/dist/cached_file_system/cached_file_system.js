"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
const path_1 = require("path");
class CachedFileSystem extends file_system_1.FileSystem {
    constructor(sourceFileSystem, cacheFileSystem) {
        super();
        this.fileSystem = sourceFileSystem;
        this.cacheFileSystem = cacheFileSystem;
    }
    watch(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    watchSync(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    async readlink(path) {
        return (await this.cacheFileSystem.readlink(path)) || (await this.fileSystem.readlink(path));
    }
    readlinkSync(path) {
        return this.cacheFileSystem.readlinkSync(path) || this.fileSystem.readlinkSync(path);
    }
    async realpath(path) {
        return (await this.cacheFileSystem.realpath(path)) || (await this.fileSystem.realpath(path));
    }
    realpathSync(path) {
        return this.cacheFileSystem.realpathSync(path) || this.fileSystem.realpathSync(path);
    }
    async cache(path) {
        if (await this.fileSystem.exists(path)) {
            const stat = await this.fileSystem.stat(path);
            if (stat.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                await this.cacheFileSystem.mkdirp(path);
                const files = await this.fileSystem.readDir(path);
                for (const file of files) {
                    await this.cache(path_1.join(path, file));
                }
            }
            else {
                await this.cacheFileSystem.mkdirp(path_1.parse(path).dir);
                return this.copyFileFileSystem(path, this.cacheFileSystem, path);
            }
        }
    }
    cacheSync(path) {
        if (this.fileSystem.existsSync(path)) {
            const stat = this.fileSystem.statSync(path);
            if (stat.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                this.cacheFileSystem.mkdirpSync(path);
                const files = this.fileSystem.readDirSync(path);
                for (const file of files) {
                    this.cacheSync(path_1.join(path, file));
                }
            }
            else {
                this.cacheFileSystem.mkdirp(path_1.parse(path).dir);
                return this.copyFileFileSystemSync(path, this.cacheFileSystem, path);
            }
        }
    }
    async flushCache() {
        const files = await this.cacheFileSystem.readDirRecursive('/', {});
        for (const file of files) {
            await this.fileSystem.mkdirp(path_1.parse(file).dir);
            await this.cacheFileSystem.moveFileFileSystem(file, this.fileSystem, file);
        }
    }
    flushCacheSync() {
        const files = this.cacheFileSystem.readDirRecursiveSync('/', {});
        for (const file of files) {
            this.fileSystem.mkdirpSync(path_1.parse(file).dir);
            this.cacheFileSystem.moveFileFileSystemSync(file, this.fileSystem, file);
        }
    }
    async mkdir(path) {
        if (!this.fileSystem.exists(path)) {
            return this.cacheFileSystem.mkdir(path);
        }
    }
    mkdirSync(path) {
        if (!this.fileSystem.exists(path)) {
            return this.cacheFileSystem.mkdirSync(path);
        }
    }
    async rmdir(path) {
        if (await this.cacheFileSystem.exists(path)) {
            this.cacheFileSystem.rmdir(path);
        }
        if (await this.fileSystem.exists(path)) {
            this.fileSystem.rmdir(path);
        }
    }
    rmdirSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            this.cacheFileSystem.rmdirSync(path);
        }
        if (this.fileSystem.existsSync(path)) {
            this.fileSystem.rmdirSync(path);
        }
    }
    async unlink(path) {
        if (await this.cacheFileSystem.exists(path)) {
            this.cacheFileSystem.unlink(path);
        }
        if (await this.fileSystem.exists(path)) {
            this.fileSystem.unlink(path);
        }
    }
    unlinkSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            this.cacheFileSystem.unlinkSync(path);
        }
        if (this.fileSystem.existsSync(path)) {
            this.fileSystem.unlinkSync(path);
        }
    }
    async readFile(path, encoding) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.readFile(path, encoding);
        }
        else {
            return this.fileSystem.readFile(path, encoding);
        }
    }
    readFileSync(path, encoding) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.readFileSync(path, encoding);
        }
        else {
            return this.fileSystem.readFileSync(path, encoding);
        }
    }
    async stat(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.stat(path);
        }
        else {
            return this.fileSystem.stat(path);
        }
    }
    statSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.statSync(path);
        }
        else {
            return this.fileSystem.statSync(path);
        }
    }
    async readDir(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.readDir(path);
        }
        else {
            return this.fileSystem.readDir(path);
        }
    }
    readDirSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.readDirSync(path);
        }
        else {
            return this.fileSystem.readDirSync(path);
        }
    }
    async exists(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return true;
        }
        else {
            return this.fileSystem.exists(path);
        }
    }
    existsSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return true;
        }
        else {
            return this.fileSystem.existsSync(path);
        }
    }
    async writeFile(path, content) {
        const folder = path_1.parse(path).dir;
        if (await this.exists(folder)) {
            if (!(await this.cacheFileSystem.exists(folder))) {
                await this.cacheFileSystem.mkdirp(folder);
            }
            return this.cacheFileSystem.writeFile(path, content);
        }
    }
    writeFileSync(path, content) {
        const folder = path_1.parse(path).dir;
        if (this.existsSync(folder)) {
            if (!this.cacheFileSystem.existsSync(folder)) {
                this.cacheFileSystem.mkdirpSync(folder);
            }
            this.cacheFileSystem.writeFileSync(path, content);
        }
    }
}
exports.CachedFileSystem = CachedFileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVkX2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NhY2hlZF9maWxlX3N5c3RlbS9jYWNoZWRfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBd0Y7QUFDeEYsK0JBQW1DO0FBRW5DLE1BQWEsZ0JBQWlCLFNBQVEsd0JBQVU7SUFJL0MsWUFBWSxnQkFBNEIsRUFBRSxlQUEyQjtRQUNwRSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7UUFDbkMsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDeEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFlLEVBQUUsT0FBWSxFQUFFLFFBQWE7UUFDeEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDTSxTQUFTLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQzVELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFZO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUNNLFlBQVksQ0FBQyxJQUFZO1FBQy9CLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUNNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBWTtRQUNqQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFD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QjtJQUNGLENBQUM7SUFFTSxTQUFTLENBQUMsSUFBWTtRQUM1QixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQztJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVk7UUFDL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO0lBQ0YsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFZO1FBQzdCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pDO0lBQ0YsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBWSxFQUFFLFFBQWdCO1FBQ25ELElBQUksTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNyRDthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDaEQ7SUFDRixDQUFDO0lBRU0sWUFBWSxDQUFDLElBQVksRUFBRSxRQUFnQjtRQUNqRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3pEO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNwRDtJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQVk7UUFDN0IsSUFBSSxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEM7SUFDRixDQUFDO0lBRU0sUUFBUSxDQUFDLElBQVk7UUFDM0IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RDO0lBQ0YsQ0FBQztJQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBWTtRQUNoQyxJQUFJLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQztJQUNGLENBQUM7SUFFTSxXQUFXLENBQUMsSUFBWTtRQUM5QixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUM7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekM7SUFDRixDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFZO1FBQy9CLElBQUksTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM1QyxPQUFPLElBQUksQ0FBQztTQUNaO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0lBQ0YsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFZO1FBQzdCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztJQUNGLENBQUM7SUFFTSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxPQUFlO1FBQ25ELE1BQU0sTUFBTSxHQUFHLFlBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO2dCQUNqRCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDckQ7SUFDRixDQUFDO0lBRU0sYUFBYSxDQUFDLElBQVksRUFBRSxPQUFlO1FBQ2pELE1BQU0sTUFBTSxHQUFHLFlBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDL0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDeEM7WUFDRCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDbEQ7SUFDRixDQUFDO0NBQ0Q7QUFqTkQsNENBaU5DIn0=