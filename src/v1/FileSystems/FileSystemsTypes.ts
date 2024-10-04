import {KaitaiFileSystem} from "./KaitaiFileSystem";
import {LocalStorageFileSystem} from "./LocalStorageFileSystem";

export const FILE_SYSTEM_TYPE_LOCAL = "local";
export const FILE_SYSTEM_TYPE_KAITAI = "kaitai";
export const ITEM_MODE_FILE = "file";
export const ITEM_MODE_DIRECTORY = "folder";

export interface IFsItem {
    fsType: typeof FILE_SYSTEM_TYPE_LOCAL | typeof FILE_SYSTEM_TYPE_KAITAI;
    type: typeof ITEM_MODE_FILE | typeof ITEM_MODE_DIRECTORY;
    fn?: string;
    children?: { [key: string]: IFsItem; };
}

export interface IFsItemSummary {
    isLocal: boolean;
    isFolder: boolean;
    isKsy: boolean;
}

export interface IFileSystem {
    setRootNode(newRoot: IFsItem): Promise<IFsItem>;

    getRootNode(): Promise<IFsItem>;

    get(fn: string): Promise<string | ArrayBuffer>;

    put(fn: string, data: any): Promise<IFsItem>;
}

export interface IFileSystemManager {
    local: LocalStorageFileSystem;
    kaitai: KaitaiFileSystem;
}

export interface IJSTreeNodeHelper {
    id?: string;
    text: string;
    icon: string;
    state?: { opened: boolean; };
    children?: IJSTreeNodeHelper[];
    data?: IFsItem;
}