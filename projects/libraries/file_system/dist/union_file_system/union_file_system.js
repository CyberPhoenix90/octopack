"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class UnionFileSystem extends file_system_1.FileSystem {
    constructor(fileSystems) {
        super();
        this.fileSystems = fileSystems;
    }
    async watch(paths, options, callback) {
        throw new Error('Not implemented');
    }
    watchSync(paths, options, callback) {
        throw new Error('Not implemented');
    }
    async readlink(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readlink(path);
            }
            catch (e) { }
        }
        throw {
            errno: -22,
            code: 'EINVAL',
            syscall: 'readlink',
            path
        };
    }
    readlinkSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readlinkSync(path);
            }
            catch (e) { }
        }
        throw {
            errno: -22,
            code: 'EINVAL',
            syscall: 'readlink',
            path
        };
    }
    async realpath(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.realpath(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    realpathSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.realpathSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async mkdir(path) {
        for (const fs of this.fileSystems) {
            try {
                await fs.mkdir(path);
            }
            catch (e) { }
        }
    }
    mkdirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                fs.mkdirSync(path);
            }
            catch (e) { }
        }
    }
    async rmdir(path) {
        for (const fs of this.fileSystems) {
            try {
                await fs.rmdir(path);
            }
            catch (e) { }
        }
    }
    rmdirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                fs.rmdirSync(path);
            }
            catch (e) { }
        }
    }
    async unlink(path) {
        for (const fs of this.fileSystems) {
            await fs.unlink(path);
        }
    }
    unlinkSync(path) {
        for (const fs of this.fileSystems) {
            fs.unlinkSync(path);
        }
    }
    async readFile(path, encoding) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readFile(path, encoding);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    readFileSync(path, encoding) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readFileSync(path, encoding);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async stat(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.stat(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    statSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.statSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async readDir(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readDir(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    readDirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readDirSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async exists(path) {
        for (const fs of this.fileSystems) {
            if (await fs.exists(path)) {
                return true;
            }
        }
        return false;
    }
    existsSync(path) {
        for (const fs of this.fileSystems) {
            if (fs.existsSync(path)) {
                return true;
            }
        }
        return false;
    }
    async writeFile(path, content) {
        for (const fs of this.fileSystems) {
            try {
                await fs.writeFile(path, content);
            }
            catch (e) { }
        }
    }
    writeFileSync(path, content) {
        for (const fs of this.fileSystems) {
            try {
                fs.writeFileSync(path, content);
            }
            catch (e) { }
        }
    }
}
exports.UnionFileSystem = UnionFileSystem;