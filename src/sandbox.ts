import { GithubClient } from './utils/GithubClient';
import { TestHelper } from './utils/TestHelper';
import { FsUri } from './utils/FsUri';
import { Repository } from './utils/GithubClient';
import { Entities } from './utils/GithubClient';
var queryParams: { access_token?: string } = { };
location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => queryParams[x[0]] = x[1]);

interface IFileSystem {
    read(path: string): Promise<ArrayBuffer>;
    write(path: string, data: ArrayBuffer): Promise<void>;
    delete(path: string): Promise<void>;
    list(path: string): Promise<IFsItem[]>;
}

interface IFsItem {
    uri: FsUri;
}

class GithubFsItem implements IFsItem {
    public repo: Repository;
    public uri: FsUri;

    constructor(public fs: GithubFileSystem, uri: string, public entity?: Entities.IContent) {
        this.uri = new FsUri(uri, 2);
        this.repo = this.fs.client.getRepo(this.uri.providerData[1], this.uri.providerData[0]);
    }

    read(): Promise<ArrayBuffer> {
        return this.repo.downloadFile(this.uri.path);
    }

    write(newContent: ArrayBuffer): Promise<void> {
        throw new Error("Not implemented");
    }

    delete(): Promise<void> {
        throw new Error("Not implemented");
    }

    list(): Promise<IFsItem[]> {
        return this.repo.getContents(this.uri.path).then(items => {
            console.log(items);
            return items.filter(item => item.type === 'file' || item.type === 'dir')
                .map(item => new GithubFsItem(this.fs, this.uri.uri + item.name + (item.type === 'dir' ? '/' : ''), item));
        });
    }
}

class GithubFileSystem implements IFileSystem {
    constructor(public client: GithubClient) { }

    getFsItem(uri: string) {
        return new GithubFsItem(this, uri);
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.getFsItem(uri).read();
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.getFsItem(uri).write(data);
    }

    delete(uri: string): Promise<void> {
        return this.getFsItem(uri).delete();
    }

    list(uri: string): Promise<IFsItem[]> {
        return this.getFsItem(uri).list();
    }
}

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);
//githubFs.list('github://koczkatamas/kaitai_struct_formats/archive/').then(items => console.log(items.map((x: GithubFsItem) => `${x.uri.uri}`)));
githubFs.read('github://koczkatamas/kaitai_struct_formats/archive/zip.ksy').then(result => console.log(result));

//githubClient.listRepos().then(repos => console.log(repos.map(repo => repo.name)));
//githubClient.getRepo('koczkatamas/kaitai_struct_formats').getContents('/archive').then(items => console.log(items.map(f => `${f.name} (${f.type}) => ${f.path}`)));
