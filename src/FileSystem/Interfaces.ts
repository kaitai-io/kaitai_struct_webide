import { FsUri } from './FsUri';

export interface IFileSystem {
    read(path: string): Promise<ArrayBuffer>;
    write(path: string, data: ArrayBuffer): Promise<void>;
    delete(path: string): Promise<void>;
    list(path: string): Promise<IFsItem[]>;
}

export interface IFsItem {
    uri: FsUri;
}