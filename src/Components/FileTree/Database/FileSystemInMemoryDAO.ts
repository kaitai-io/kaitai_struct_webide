import {FileSystemDirectory} from "../FileSystemsTypes";
import {FileSystemDAO} from "./FileSystemDAO";

export class FileSystemInMemoryDAO implements FileSystemDAO {


    constructor(public roots: { [key: string]: FileSystemDirectory } = {},
                public files: { [key: string]: string | ArrayBuffer } = {}) {
    }

    getFileSystemHierarchyRoot(rootKey: string): Promise<FileSystemDirectory> {
        return Promise.resolve(this.roots[rootKey]);
    }

    saveFileSystemHierarchyRoot(rootKey: string, root: FileSystemDirectory): Promise<FileSystemDirectory> {
        this.roots[rootKey] = root;
        return Promise.resolve(this.roots[rootKey]);
    }

    getFile(filePath: string): Promise<string | ArrayBuffer> {
        return Promise.resolve(this.files[filePath]);
    }

    saveFile(filePath: string, fileContents: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        this.files[filePath] = fileContents;
        return Promise.resolve(this.files[filePath]);
    }

    deleteFile(filePath: string): Promise<void> {
        delete this.files[filePath];
        return Promise.resolve();
    }

    clear(): Promise<void> {
        this.roots = {};
        this.files = {};
        return Promise.resolve();
    }

    getFileNames(): string[] {
        return Object.keys(this.files);
    }

}