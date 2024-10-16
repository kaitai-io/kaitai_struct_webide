import {FileSystemItem} from "../FileSystemsTypes";
import localforage from "localforage";

export class LocalForageForLocalStorageWrapper {
    public static getFsItem(ksyFsItemName: string): Promise<FileSystemItem> {
        return localforage.getItem<FileSystemItem>(ksyFsItemName);
    }

    public static saveFsItem(ksyFsItemName: string, fsItem: FileSystemItem): Promise<FileSystemItem> {
        return localforage.setItem(ksyFsItemName, fsItem);
    }

    public static getFile(fileName: string): Promise<string | ArrayBuffer> {
        return localforage.getItem<string | ArrayBuffer>(fileName);
    }

    public static saveFile(fileName: string, data: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        return localforage.setItem<string | ArrayBuffer>(fileName, data);
    }

    public static deleteFile(fileName: string): Promise<void> {
        return localforage.removeItem(fileName);
    }

    public static clear(): Promise<void> {
        return localforage.clear();
    }
}