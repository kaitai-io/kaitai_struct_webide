import {IFsItem} from "../FileSystems/FileSystemsTypes";
import * as localforage from "localforage";

export class LocalForageWrapper {
    public static getFsItem(ksyFsItemName: string): Promise<IFsItem> {
        return localforage.getItem<IFsItem>(ksyFsItemName);
    }

    public static saveFsItem(ksyFsItemName: string, fsItem: IFsItem): Promise<IFsItem> {
        return localforage.setItem(ksyFsItemName, fsItem);
    }

    public static getFile(fileName: string): Promise<string | ArrayBuffer> {
        return localforage.getItem<string | ArrayBuffer>(fileName);
    }

    public static saveFile(fileName: string, data: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        return localforage.setItem<string | ArrayBuffer>(fileName, data);
    }

}