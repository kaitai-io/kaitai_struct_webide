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

var queryParams: { access_token?: string; secret?: string } = {};
location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => (<any>queryParams)[x[0]] = x[1]);

var fss = new FsSelector();
fss.addFs(new LocalFileSystem());

var remoteFs = new RemoteFileSystem();
remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
fss.addFs(remoteFs);

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);
fss.addFs(githubFs);

var staticFs = new StaticFileSystem();
kaitaiFsFiles.forEach(fn => staticFs.write("static://" + fn, new ArrayBuffer(0)));
fss.addFs(staticFs);

//['local:///folder/', 'remote://127.0.0.1:8001/default/folder/', 'github://koczkatamas/kaitai_struct_formats/archive/']
//    .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));

interface IFsTreeNode {
    text: string;
    isFolder: boolean;
    children: IFsTreeNode[];
    loadChildren(): Promise<void>;
}

@Component
class TreeView<T extends IFsTreeNode> extends Vue {
    model: T;
    selectedItem: TreeViewItem<T> = null;

    get children() { return <TreeViewItem<T>[]>this.$children; }

    created() {
        this.model.loadChildren();
    }

    setSelected(newSelected: TreeViewItem<T>) {
        if (this.selectedItem)
            this.selectedItem.selected = false;
        this.selectedItem = newSelected;
        this.selectedItem.selected = true;
    }
}

@Component
class TreeViewItem<T extends IFsTreeNode> extends Vue {
    model: T;
    open = false;
    selected = false;
    childrenLoading = false;

    get treeView() {
        var res: Vue = this;
        while (res) {
            if (res instanceof TreeView)
                return res;
            res = res.$parent;
        }
        return null;
    }

    get children() { return <TreeViewItem<T>[]>this.$children; }

    toggle() {
        if (this.model.isFolder) {
            this.open = !this.open;
            if (this.open && !this.model.children) {
                this.childrenLoading = true;
                this.model.loadChildren().then(() => this.childrenLoading = false);
            }
        }
        this.treeView.setSelected(this);
    }
}

class DummyFsTreeNode implements IFsTreeNode {
    public children: DummyFsTreeNode[] = [];

    get isFolder() { return this.children && this.children.length > 0; }

    constructor(public text: string) { }

    add(children: DummyFsTreeNode[]) {
        this.children.push(...children);
        return this;
    }

    loadChildren(): Promise<void> { return Promise.resolve(); }
}

class FsTreeNode implements IFsTreeNode {
    text: string;
    isFolder: boolean;
    children: IFsTreeNode[] = null;

    constructor(public fs: IFileSystem, public uri: FsUri) {
        this.text = uri.name;
        this.isFolder = uri.type === 'directory';
    }

    loadChildren(): Promise<void> {
        return Promise.delay(this.uri.name === '/' ? 0 : 500).then(() => this.fs.list(this.uri.uri)).then(children => {
            this.children = children.map(fsItem => new FsTreeNode(this.fs, fsItem.uri));
        });
    }
}

var dummyData = new DummyFsTreeNode('/').add([
    new DummyFsTreeNode('folder1').add([
        new DummyFsTreeNode('folder2').add([
            new DummyFsTreeNode('file1'),
            new DummyFsTreeNode('file2')
        ]),
        new DummyFsTreeNode('file1'),
        new DummyFsTreeNode('file2')
    ]),
    new DummyFsTreeNode('file1'),
    new DummyFsTreeNode('file2')
]);

var fsData = new FsTreeNode(fss, new FsUri('static:///'));

var demo = new Vue({
    el: '#tree',
    data: { treeData: fsData }
});
window['demo'] = demo;
var treeView = <TreeView<IFsTreeNode>>demo.$refs['treeView'];
setTimeout(() => {
    treeView.children[0].toggle();
    treeView.children[6].toggle();
}, 50);
