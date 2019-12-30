"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class MemoryFileSystem extends file_system_1.FileSystem {
    readFile(path, encoding) {
        throw new Error('Method not implemented.');
    }
    readFileSync(path, encoding) {
        throw new Error('Method not implemented.');
    }
    exists(path) {
        throw new Error('Method not implemented.');
    }
    existsSync(path) {
        throw new Error('Method not implemented.');
    }
}
exports.MemoryFileSystem = MemoryFileSystem;
