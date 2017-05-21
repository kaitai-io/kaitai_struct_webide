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
import {ContextMenu} from "./ui/Components/ContextMenu";
//import Scrollbar from 'smooth-scrollbar';
declare var Scrollbar: any;

declare var kaitaiFsFiles: string[];
declare function require(deps: string[], callback: (obj: any[]) => void): void;

for (var i = 0; i < 200; i++)
    kaitaiFsFiles.push(`formats/archive/test_${i}.ksy`);

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

    constructor(public children: IFsTreeNode[] = []) { }
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
    contextMenuNode: FsTreeNode; // selectedFsItem can be something else (eg. by pressing down)

    get ctxMenu() { return <ContextMenu>this.$refs["ctxMenu"]; }
    get fsTreeView() { return <TreeView<FsTreeNode>>this.$refs["fsTree"]; }
    get selectedFsItem() { return this.fsTreeView.selectedItem.model; }

    public openFile() {
        console.log('openFile', this.selectedFsItem);
        this.selectedUri = this.selectedFsItem.uri.uri;
    }

    public showContextMenu(event: MouseEvent) {
        this.contextMenuNode = this.selectedFsItem;
        this.ctxMenu.open(event, this.contextMenuNode);
    }

    public createFolder() {
        console.log('createFolder');
    }

    public createKsyFile() {
        
    }

    public cloneKsyFile() {
        
    }

    public downloadFile() {
        
    }

    public deleteFile() {
        
    }

    public generateParser(lang: string) {
        console.log('generateParser', lang, this.contextMenuNode);
    }

    updated() {
        var fsTreeScrollbar = Scrollbar.init(this.fsTreeView.$el);
        this.fsTreeView.scrollIntoView = (el, alignToTop) => fsTreeScrollbar.scrollIntoView(el, { alignToTop: alignToTop });
        console.log(this.fsTreeView);
    }
}

componentLoader.load(["TreeView", "ContextMenu"]).then(() => {
    var app = new App({ el: "#app" });
    app.fsTree = fsData;
    console.log(fsData.children);
    window["app"] = app;

    setTimeout(() => {
        app.fsTreeView.children[0].dblclick();
        //$("#treeView").mCustomScrollbar("update");
        //treeView.children[0].children[3].dblclick();
        //treeView.children[6].dblclick();
    }, 500);
});