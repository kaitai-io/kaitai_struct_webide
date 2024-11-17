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
        return this.storeId === other.storeId;
    }

    public clone() {
        return FileSystemPath.of(this.storeId, this.path);
    }

    public isTheSame(other: FileSystemPath) {
        return this.storeId === other.storeId &&
            this.path === other.path;
    }

    public isPartOf(other: FileSystemPath) {
        return this.storeId === other.storeId &&
            this.path.startsWith(other.path);
    }

    public isNestedIn(other: FileSystemPath) {
        if (this.storeId !== other.storeId) {
            return false;
        }
        const pathABCParts = this.path.split("/");
        const pathABCDEParts = other.path.split("/");
        if (pathABCDEParts.length < pathABCParts.length) {
            return false;
        }
        for (let i = 0; i < pathABCParts.length; ++i) {
            if (pathABCParts[i] !== pathABCDEParts[i]) return false;
        }
        return true;
    }

    public getLastPathElement() {
        const pathParts = this.path.split("/");
        return pathParts[pathParts.length - 1];
    }

    public append(pathPart: string) {
        if (!pathPart || pathPart.length === 0) return;
        if (this.path.length === 0) {
            this.path += pathPart;
        } else {
            this.path += `/${pathPart}`;
        }
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

    listAllFilesInPath(path: string): Promise<string[]>;

    move(oldPath: string, newPath: string): Promise<void>;
}
