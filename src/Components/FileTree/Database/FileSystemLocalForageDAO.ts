import {FileSystemDirectory} from "../FileSystemsTypes";
import {FileSystemDAO} from "./FileSystemDAO";
import localforage from "localforage";

export class FileSystemLocalForageDAO implements FileSystemDAO {
    getFileSystemHierarchyRoot(rootKey: string): Promise<FileSystemDirectory> {
        return localforage.getItem<FileSystemDirectory>(rootKey);
    }

    saveFileSystemHierarchyRoot(rootKey: string, root: FileSystemDirectory): Promise<FileSystemDirectory> {
        return localforage.setItem(rootKey, root);
    }

    getFile(filePath: string): Promise<string | ArrayBuffer> {
        return localforage.getItem<string | ArrayBuffer>(filePath);
    }

    saveFile(filePath: string, fileContents: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        return localforage.setItem<string | ArrayBuffer>(filePath, fileContents);
    }

    deleteFile(filePath: string): Promise<void> {
        return localforage.removeItem(filePath);
    }

    clear(): Promise<void> {
        return localforage.clear();
    }
}

export const fileSystemLocalForageDAO = new FileSystemLocalForageDAO();