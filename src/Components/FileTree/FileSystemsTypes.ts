export const ITEM_MODE_FILE = "file";
export const ITEM_MODE_DIRECTORY = "folder";

export type FsItemMode = typeof ITEM_MODE_FILE | typeof ITEM_MODE_DIRECTORY;

export interface FileSystemItem {
    fsType: string;
    type: FsItemMode;
    fn?: string;
    children?: { [key: string]: FileSystemItem; };
}

export class FileSystemPath {

    constructor(public storeId: string, public path: string) {
    }

    public static of(storeId: string, path: string) {
        return new FileSystemPath(storeId, path);
    }

    public static fromFullPathWithStore(fullPathWithStore: string) {
        const [storeId, path] = fullPathWithStore.split(":");
        return new FileSystemPath(storeId, path);
    }

    public isInTheSameStore(other: FileSystemPath) {
        return this.storeId === other.storeId
    }

    public isTheSame(other: FileSystemPath) {
        return this.storeId === other.storeId &&
            this.path === other.path;
    }

    public isPartOf(other: FileSystemPath) {
        return this.storeId === other.storeId &&
            this.path.startsWith(other.path);
    }

    public replacePathPart(oldFragment: FileSystemPath, newFragment: FileSystemPath): FileSystemPath {
        const newPath = this.path.replace(oldFragment.path, newFragment.path);
        return FileSystemPath.of(this.storeId, newPath);
    }
    public toString() {
        return `${this.storeId}:${this.path}`;
    }
}

export interface FileSystem {
    storeId: string;

    getRootNode(): FileSystemItem | undefined;

    get(filePath: string): Promise<string | ArrayBuffer>;

    put(filePath: string, data: string | ArrayBuffer): Promise<void>;

    createDirectory(filePath: string): Promise<void>;

    delete(filePath: string): Promise<void>;

    move(oldPath: string, newPath: string): Promise<void>;
}
