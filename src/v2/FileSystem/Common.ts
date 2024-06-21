import { FsUri } from "./FsUri";

export interface IFileSystem {
    scheme: string[];
    capabilities(uri: string): { write: boolean, delete: boolean };
    createFolder(uri: string): Promise<void>;
    read(uri: string): Promise<ArrayBufferLike>;
    write(uri: string, data: ArrayBufferLike): Promise<void>;
    delete(uri: string): Promise<void>;
    list(uri: string): Promise<IFsItem[]>;
}

export interface IFsItem {
    uri: FsUri;
}

export class FsItem implements IFsItem {
    constructor(public uri: FsUri) { }
}