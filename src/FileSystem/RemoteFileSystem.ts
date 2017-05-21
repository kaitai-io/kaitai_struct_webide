import { FsUri } from "./FsUri";
import { IFileSystem, FsItem } from "./Common";
import {WebHelper} from "../utils/WebHelper";

interface IListResponse {
    files: [{ fn: string, isDir: boolean }];
}

export class RemoteFileSystem implements IFileSystem {
    scheme = ["remote"];

    public mappings: { [path: string]: { secret: string } } = {};

    private getFsUri(uri: string) { return new FsUri(uri, 2); }

    request(method: string, url: string, headers?: { [name: string]: string }, responseType?: XMLHttpRequestResponseType, requestData?: Blob|ArrayBuffer) {
        return WebHelper.request(method, url, headers, responseType, requestData);
    }

    execute<T>(method: string, uri: string, binaryResponse: boolean = false, postData: ArrayBuffer = null): Promise<T> {
        var fsUri = this.getFsUri(uri);
        var host = fsUri.fsData[0];
        if (host.indexOf(":") === -1)
            host += "8001";
        var mapping = fsUri.fsData[1] || "default";
        var mappingConfig = this.mappings[`${host}/${mapping}`];

        var url = `http://${host}/files/${mapping}${fsUri.path}`;
        return this.request(method, url, { "Authorization": "MappingSecret " + mappingConfig.secret }, binaryResponse ? "arraybuffer" : null, postData);
    }

    createFolder(uri: string): Promise<void> {
        return this.execute("PUT", uri).then(x => null);
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.execute("GET", uri, true);
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.execute("PUT", uri, false, data).then(x => null);
    }

    delete(uri: string): Promise<void> {
        return this.execute("DELETE", uri).then(x => null);
    }

    list(uri: string): Promise<FsItem[]> {
        return this.execute("GET", uri).then(response => {
            return (<IListResponse>response).files.map(item => new FsItem(this.getFsUri(uri + item.fn + (item.isDir ? "/" : ""))));
        });
    }
}
