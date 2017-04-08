import { FsUri } from './FsUri';
import { IFileSystem, IFsItem } from './Interfaces';

interface IListResponse {
    files: [{ fn: string, isDir: boolean }];
}

class RemoteFsItem implements IFsItem {
    constructor(public uri: FsUri) { }
}

export class RemoteFileSystem implements IFileSystem {
    public mappings: { [path: string]: { secret: string } } = {};

    private getFsUri(uri: string) { return new FsUri(uri, 2); }

    request(method: string, url: string, headers?: { [name: string]: string }, responseType?: string, requestData?: Blob|ArrayBuffer) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            if (responseType)
                xhr.responseType = responseType;

            if(headers)
                for (var hdrName in headers)
                    xhr.setRequestHeader(hdrName, headers[hdrName]);

            xhr.onload = e => {
                if (200 <= xhr.status && xhr.status <= 299) {
                    var contentType = xhr.getResponseHeader('content-type');
                    if (contentType === 'application/json' && !responseType)
                        resolve(JSON.parse(xhr.response));
                    else
                        resolve(xhr.response);
                }
                else
                    reject(xhr.response);
            };

            xhr.onerror = e => reject(e);
            xhr.send(requestData);
        });
    }

    execute<T>(method: string, uri: string, binaryResponse: boolean = false, postData: ArrayBuffer = null): Promise<T> {
        var fsUri = this.getFsUri(uri);
        var host = fsUri.providerData[0];
        if (host.indexOf(':') === -1)
            host += '8001';
        var mapping = fsUri.providerData[1] || 'default';
        var mappingConfig = this.mappings[`${host}/${mapping}`];

        var url = `http://${host}/files/${mapping}${fsUri.path}`;
        return this.request(method, url, { 'Authorization': 'MappingSecret ' + mappingConfig.secret }, binaryResponse ? 'arraybuffer' : null, postData);
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.execute('GET', uri, true);
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.execute('PUT', uri, false, data).then(x => null);
    }

    delete(uri: string): Promise<void> {
        return this.execute('DELETE', uri).then(x => null);
    }

    list(uri: string): Promise<RemoteFsItem[]> {
        return this.execute('GET', uri).then(response => {
            return (<IListResponse>response).files.map(item => new RemoteFsItem(this.getFsUri(uri + item.fn + (item.isDir ? '/' : ''))));
        });
    }
}
