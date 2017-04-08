import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFs';
import { IFileSystem, IFsItem } from './FileSystem/Interfaces';
import { FsUri } from './FileSystem/FsUri';
import { LocalFileSystem } from './FileSystem/LocalFs';

var queryParams: { access_token?: string } = {};
location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => queryParams[x[0]] = x[1]);

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);

function dataToArrayBuffer(str) {
    var len = str.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}

var localFs = new LocalFileSystem();
//localFs.write('local:///file.txt', dataToArrayBuffer("file content"));
//localFs.write('local:///folder/file.txt', dataToArrayBuffer("file content"));
localFs.list('local:///folder/').then(x => console.log(x));
localFs.read('local:///folder/file.txt').then(x => console.log(x));


//githubFs.list('github://koczkatamas/kaitai_struct_formats/archive/').then(items => console.log(items.map((x: GithubFsItem) => `${x.uri.uri}`)));
//githubFs.read('github://koczkatamas/kaitai_struct_formats/archive/zip.ksy').then(result => console.log(result));

//githubClient.listRepos().then(repos => console.log(repos.map(repo => repo.name)));
//githubClient.getRepo('koczkatamas/kaitai_struct_formats').getContents('/archive').then(items => console.log(items.map(f => `${f.name} (${f.type}) => ${f.path}`)));
