import {FileSystemDirectory} from "../FileSystemsTypes";

export interface FileSystemDAO {
    getFileSystemHierarchyRoot(rootKey: string): Promise<FileSystemDirectory>;

    saveFileSystemHierarchyRoot(rootKey: string, root: FileSystemDirectory): Promise<FileSystemDirectory>;

    getFile(filePath: string): Promise<string | ArrayBuffer>;

    saveFile(filePath: string, fileContents: string | ArrayBuffer): Promise<string | ArrayBuffer>;

    deleteFile(filePath: string): Promise<void>;

    clear(): Promise<void>;
}