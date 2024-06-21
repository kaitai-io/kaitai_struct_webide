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

    capabilities(uri: string) {
        return { write: true, delete: true };
    };

    async createFolder(uri: string): Promise<void> {
        await this.execute("PUT", uri);
    }

    async read(uri: string): Promise<ArrayBuffer> {
        return await this.execute<ArrayBuffer>("GET", uri, true);
    }

    async write(uri: string, data: ArrayBuffer): Promise<void> {
        await this.execute("PUT", uri, false, data);
    }

    async delete(uri: string): Promise<void> {
        await this.execute("DELETE", uri);
    }

    async list(uri: string): Promise<FsItem[]> {
        let response = await this.execute("GET", uri);
        return (<IListResponse>response).files.map(item => new FsItem(this.getFsUri(uri + item.fn + (item.isDir ? "/" : ""))));
    }
}
