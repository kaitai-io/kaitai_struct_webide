export const FILE_SYSTEM_TYPE_LOCAL = "local";
export const FILE_SYSTEM_TYPE_KAITAI = "kaitai";
export const ITEM_MODE_FILE = "file";
export const ITEM_MODE_DIRECTORY = "folder";

export type FsItemMode = typeof ITEM_MODE_FILE | typeof ITEM_MODE_DIRECTORY;
export type FsItemType = typeof FILE_SYSTEM_TYPE_LOCAL | typeof FILE_SYSTEM_TYPE_KAITAI;

export interface IFsItem {
    fsType: FsItemType;
    type: FsItemMode;
    fn?: string;
    children?: { [key: string]: IFsItem; };
}

export interface IFsItemSummary {
    isLocal: boolean;
    isFolder: boolean;
    isKsy: boolean;
}

export interface IFileSystem {
    storeId: string;

    getRootNode(): IFsItem | undefined;

    save(root: IFsItem): void;

    get(fn: string): Promise<string | ArrayBuffer>;

    put(fn: string, data: string | ArrayBuffer): Promise<IFsItem>;
}
