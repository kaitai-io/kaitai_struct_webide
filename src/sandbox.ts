import { GithubClient } from "./FileSystem/GithubClient";
import { GithubFileSystem } from "./FileSystem/GithubFileSystem";
import { LocalFileSystem } from "./FileSystem/LocalFileSystem";
import { RemoteFileSystem } from "./FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "./FileSystem/StaticFileSystem";
import { IFileSystem } from "./FileSystem/Common";
import { FsUri } from "./FileSystem/FsUri";
import { FsSelector } from "./FileSystem/FsSelector";
import { TreeView, IFsTreeNode } from "./ui/Components/TreeView";
import * as Vue from "vue";
import { componentLoader } from "./ui/ComponentLoader";
import Component from "./ui/Component";
import * as View from "./ui/Components/TreeView";
declare var kaitaiFsFiles: string[];

var queryParams: { access_token?: string; secret?: string } = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => queryParams[x[0]] = x[1]);

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

//["local:///folder/", "remote://127.0.0.1:8001/default/folder/", "github://koczkatamas/kaitai_struct_formats/archive/"]
//    .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));

class FsTreeNode implements IFsTreeNode {
    text: string;
    isFolder: boolean;
    children: FsTreeNode[] = null;
    icon: string = null;

    constructor(public fs: IFileSystem, public uri: FsUri) {
        this.text = uri.name;
        this.isFolder = uri.type === "directory";
    }

    loadChildren(): Promise<void> {
        return this.fs.list(this.uri.uri).then(children => {
            this.children = children.map(fsItem => new FsTreeNode(this.fs, fsItem.uri));
        });
    }
}

class FsRootNode implements IFsTreeNode {
    text: string = "/";
    isFolder: boolean = true;

    constructor(public children: View.IFsTreeNode[] = []) { }
    loadChildren(): Promise<void> { return Promise.resolve(); }
}

function addRootNode(text: string, icon: string, uri: string) {
    var node = new FsTreeNode(fss, new FsUri(uri));
    node.text = text;
    node.icon = icon;
    return node;
}

var fsData = new FsRootNode([
    addRootNode("kaitai.io", "glyphicon-cloud", "static:///"),
    addRootNode("koczkatamas/formats", "fa fa-github", "github://koczkatamas/kaitai_struct_formats/"),
    addRootNode("browser", "glyphicon-cloud", "local:///"),
]);
//var fsData = new FsTreeNode(fss, new FsUri("github://koczkatamas/kaitai_struct_formats/"));

@Component
class App extends Vue {
    fsTree: IFsTreeNode = null;
    selectedUri: string = null;

    public openFile(file: FsTreeNode) {
        this.selectedUri = file.uri.uri;
        console.log('openFile', file);
    }
}

componentLoader.load(["TreeView"]).then(() => {
    var app = new App({ el: "#app" });
    app.fsTree = fsData;
    console.log(fsData.children);
    window["app"] = app;

    var treeView = <TreeView<IFsTreeNode>>app.$refs["treeView"];
    setTimeout(() => {
        treeView.children[0].dblclick();
        //treeView.children[0].children[3].dblclick();
        //treeView.children[6].dblclick();
    }, 500);
});