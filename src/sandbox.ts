import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFs';
import { IFileSystem, IFsItem } from './FileSystem/Interfaces';
import { FsUri } from './FileSystem/FsUri';
import { LocalFileSystem } from './FileSystem/LocalFs';
import { RemoteFileSystem } from './FileSystem/RemoteFs';
import { FsSelector } from './FileSystem/FsSelector';

var queryParams: { access_token?: string, secret?: string } = {};
location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => queryParams[x[0]] = x[1]);

function dataToArrayBuffer(str) {
    var len = str.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}

var fs = new FsSelector();
fs.addFs(new LocalFileSystem());

var remoteFs = new RemoteFileSystem();
remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
fs.addFs(remoteFs);

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);
fs.addFs(githubFs);

['local:///folder/', 'remote://127.0.0.1:8001/default/folder/', 'github://koczkatamas/kaitai_struct_formats/archive/']
    .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));