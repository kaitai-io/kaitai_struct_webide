export interface IFileSystem {
    getRootNode(): Promise<any>;
    get(fn): Promise<string | ArrayBuffer>;
    put(fn, data): Promise<void>;
}

export interface IFsItem {
    fsType: string;
    type: 'file' | 'folder';
    fn?: string;
    children?: { [key: string]: IFsItem; };
}