import { IFileSystem } from "./../../FileSystem/Common";
import { GithubClient } from "./../../FileSystem/GithubClient";
import { GithubFileSystem } from "./../../FileSystem/GithubFileSystem";
import { BrowserFileSystem } from "./../../FileSystem/BrowserFileSystem";
import { RemoteFileSystem } from "./../../FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "./../../FileSystem/StaticFileSystem";
import { HttpFileSystem } from "../../FileSystem/HttpFileSystem";
import { FsUri } from "./../../FileSystem/FsUri";
import { FsSelector } from "./../../FileSystem/FsSelector";
import { TreeView, IFsTreeNode } from "./../Components/TreeView";
import * as Vue from "vue";
import { componentLoader } from "./../ComponentLoader";
import Component from "./../Component";
import { ContextMenu } from "./../Components/ContextMenu";
declare var Scrollbar: any;
declare var kaitaiFsFiles: string[];

for (var i = 0; i < 200; i++)
    kaitaiFsFiles.push(`formats/archive/test_${i}.ksy`);

var queryParams: { access_token?: string; secret?: string } = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => queryParams[x[0]] = x[1]);

var fss = new FsSelector();
fss.addFs(new BrowserFileSystem());

var remoteFs = new RemoteFileSystem();
remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
fss.addFs(remoteFs);

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);
fss.addFs(githubFs);

var staticFs = new StaticFileSystem();
kaitaiFsFiles.forEach(fn => staticFs.write("static://" + fn, new ArrayBuffer(0)));
fss.addFs(staticFs);

function getRelativeUrl(url: string) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
}

var httpFs = new HttpFileSystem(kaitaiFsFiles.reduce((obj, fn) => { obj[`/${fn}`] = getRelativeUrl(fn); return obj; }, {}));
console.log(httpFs.fileUrls);
fss.addFs(httpFs);

export class FsTreeNode implements IFsTreeNode {
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
    addRootNode("kaitai.io", "glyphicon-cloud", getRelativeUrl("formats/")),
    addRootNode("koczkatamas/formats", "fa fa-github", "github://koczkatamas/kaitai_struct_formats/"),
    addRootNode("browser", "glyphicon-cloud", "local:///"),
]);

@Component
export class FileTree extends Vue {
    fsTree: IFsTreeNode = null;
    contextMenuNode: FsTreeNode; // selectedFsItem can be something else (eg. by pressing down)

    get ctxMenu() { return <ContextMenu>this.$refs["ctxMenu"]; }
    get fsTreeView() { return <TreeView<FsTreeNode>>this.$refs["fsTree"]; }
    get selectedFsItem() { return this.fsTreeView.selectedItem.model; }
    get selectedUri() { return this.selectedFsItem.uri.uri; }

    public init() {
        this.fsTree = fsData;
        console.log(fsData.children);

        setTimeout(() => {
            this.fsTreeView.children[0].dblclick();
        }, 500);

    }

    public openFile() {
        fss.read(this.selectedUri).then(data => {
            this.$emit('open-file', this.selectedFsItem, data);
        });
    }

    public generateParser(lang: string, aceLangOrDebug?: any) {
        var aceLang = typeof aceLangOrDebug === "string" ? aceLangOrDebug : lang;
        var debug = typeof aceLangOrDebug === "boolean" ? aceLangOrDebug : false;

        fss.read(this.selectedUri).then(data => {
            this.$emit('generate-parser', lang, aceLang, debug, data);
        });
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

    updated() {
        var fsTreeScrollbar = Scrollbar.init(this.fsTreeView.$el);
        this.fsTreeView.scrollIntoView = (el, alignToTop) => fsTreeScrollbar.scrollIntoView(el, { alignToTop: alignToTop });
        console.log(this.fsTreeView);
    }
}