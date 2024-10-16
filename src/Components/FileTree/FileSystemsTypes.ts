export const ITEM_MODE_FILE = "file";
export const ITEM_MODE_DIRECTORY = "folder";

export type FsItemMode = typeof ITEM_MODE_FILE | typeof ITEM_MODE_DIRECTORY;

export interface FileSystemItem {
    fsType: string;
    type: FsItemMode;
    fn?: string;
    children?: { [key: string]: FileSystemItem; };
}

export interface FileSystem {
    storeId: string;

    getRootNode(): FileSystemItem | undefined;

    get(filePath: string): Promise<string | ArrayBuffer>;

    put(filePath: string, data: string | ArrayBuffer): Promise<void>;

    createDirectory(filePath: string): Promise<void>;

    delete(filePath: string): Promise<void>;
}
