///<reference path="../lib/ts-types/vue.d.ts"/>
import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFileSystem';
import { LocalFileSystem } from './FileSystem/LocalFileSystem';
import { RemoteFileSystem } from './FileSystem/RemoteFileSystem';
import { StaticFileSystem } from './FileSystem/StaticFileSystem';
import { IFileSystem, IFsItem, FsItem } from './FileSystem/Common';
import { FsUri } from './FileSystem/FsUri';
import { FsSelector } from './FileSystem/FsSelector';
import * as Vue from 'vue';
import Component from './ui/Component';
declare var kaitaiFsFiles: string[];

function fsTest() {
    var queryParams: { access_token?: string; secret?: string } = {};
    location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => (<any>queryParams)[x[0]] = x[1]);

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
}

var staticFs = new StaticFileSystem();
kaitaiFsFiles.forEach(fn => staticFs.write("static://" + fn, new ArrayBuffer(0)));

staticFs.list("static://formats/").then(x => console.log(x.map(y => y.uri.uri)));

class FsTreeHandler { }

class FsTreeNode {
    public open = false;
    public childrenLoading = true;
    public children: FsTreeNode[] = [];

    constructor(public handler: FsTreeHandler, public text: string) { }

    add(children: FsTreeNode[]) {
        this.children.push(...children);
        return this;
    }
}

@Component
class TreeViewItem extends Vue {
    model: FsTreeNode;

    get isFolder() {
        return this.model.children && this.model.children.length;
    }

    toggle() {
        console.log('toggle', this.model.text, this.model.open);
        if (this.isFolder)
            this.model.open = !this.model.open;
    }
}

@Component
class TreeView extends Vue {
    model: FsTreeNode;
}

var fsTreeHandler = new FsTreeHandler();
var data = new FsTreeNode(fsTreeHandler, '/').add([
    new FsTreeNode(fsTreeHandler, 'folder1').add([
        new FsTreeNode(fsTreeHandler, 'folder2').add([
            new FsTreeNode(fsTreeHandler, 'file1'),
            new FsTreeNode(fsTreeHandler, 'file2')
        ]),
        new FsTreeNode(fsTreeHandler, 'file1'),
        new FsTreeNode(fsTreeHandler, 'file2')
    ]),
    new FsTreeNode(fsTreeHandler, 'file1'),
    new FsTreeNode(fsTreeHandler, 'file2')
]);

var demo = new Vue({
    el: '#tree',
    data: { treeData: data }
});