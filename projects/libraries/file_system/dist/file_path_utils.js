"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
//@exposed
class FilePath {
    constructor(path) {
        this.extractDataFromPath(path);
    }
    getFileExtensions() {
        return this.fileExtensions.slice();
    }
    setExtension(extension) {
        if (extension.startsWith('.')) {
            extension = extension.substring(1);
        }
        this.fileExtensions = extension.split('.');
        return this;
    }
    getExtensionString() {
        if (this.fileExtensions.length > 0) {
            return '.' + this.fileExtensions.join('.');
        }
        else {
            return '';
        }
    }
    getDirectory() {
        return this.directory;
    }
    setDirectory(path) {
        this.directory = path;
        return this;
    }
    setFileName(fileName) {
        this.fileName = fileName;
        return this;
    }
    getFileName() {
        return this.fileName;
    }
    getFullFileName() {
        return this.fileName + this.getExtensionString();
    }
    toString() {
        return path_1.join(this.directory, this.fileName + this.getExtensionString());
    }
    extractDataFromPath(path) {
        const data = path_1.parse(path);
        this.directory = data.dir;
        if (data.name.includes('.')) {
            this.fileName = data.name.substring(0, data.name.indexOf('.'));
        }
        else {
            this.fileName = data.name;
        }
        this.fileExtensions = path.split('.').slice(1);
    }
}
exports.FilePath = FilePath;
//# sourceMappingURL=file_path_utils.js.map