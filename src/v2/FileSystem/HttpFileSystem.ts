import { IFileSystem, FsItem } from "./Common";
import { FsUri } from "./FsUri";
import { WebHelper } from "../utils/WebHelper";

export class HttpFileSystem implements IFileSystem {
    scheme = ["http", "https"];

    constructor(public fileUrls: { [name: string]: string } = {}) { }

    capabilities(uri: string) {
        return { write: false, delete: false };
    };

    createFolder(uri: string): Promise<void> { throw new Error("Not implemented"); }
    write(uri: string, data: ArrayBuffer): Promise<void> { throw new Error("Not implemented"); }
    delete(uri: string): Promise<void> { throw new Error("Not implemented"); }

    list(uri: string): Promise<FsItem[]> {
        return Promise.resolve(FsUri.getChildUris(Object.keys(this.fileUrls), new FsUri(uri)).map(uri => new FsItem(uri)));
    }

    read(uri: string): Promise<ArrayBuffer> {
        return WebHelper.request("GET", this.fileUrls[new FsUri(uri).path], null, "arraybuffer");
    }
}