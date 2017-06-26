import { IFileSystem } from "./../../FileSystem/Common";
import { GithubClient } from "./../../FileSystem/GithubClient";
import { GithubFileSystem } from "./../../FileSystem/GithubFileSystem";
import { BrowserFileSystem, BrowserLegacyFileSystem } from "./../../FileSystem/BrowserFileSystem";
import { RemoteFileSystem } from "./../../FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "./../../FileSystem/StaticFileSystem";
import { HttpFileSystem } from "../../FileSystem/HttpFileSystem";
import { FsUri } from "./../../FileSystem/FsUri";
import { FsSelector } from "./../../FileSystem/FsSelector";
import { TreeView, IFsTreeNode } from "./../Components/TreeView";
import * as Vue from "vue";
import Component from "./../Component";

import { ContextMenu } from "./../Components/ContextMenu";
import "../Components/ContextMenu";
import { InputModal } from "../Components/InputModal";
import "../Components/InputModal";
import "../Components/TreeView";

import { saveFile, Convert } from "../../utils";
declare var Scrollbar: any;
declare var kaitaiFsFiles: string[];

for (var i = 0; i < 200; i++)
    kaitaiFsFiles.push(`formats/archive/test_${i}.ksy`);

var queryParams: { access_token?: string; secret?: string } = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => queryParams[x[0]] = x[1]);

var fss = new FsSelector();
fss.addFs(new BrowserFileSystem());
fss.addFs(new BrowserLegacyFileSystem());

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
    var a = document.createElement("a");
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

    get isKsy() { return this.uri.path.endsWith(".ksy"); }
    get capabilities() { return this.fs.capabilities(this.uri.uri); }
    get canWrite() { return this.capabilities.write; }
    get canDelete() { return this.uri.path !== "/" && this.capabilities.delete; }

    constructor(public parent: FsTreeNode, public uri: FsUri, public fs: IFileSystem = null) {
        this.fs = this.fs || parent.fs;
        this.text = uri.name;
        this.isFolder = uri.type === "directory";
    }

    loadChildren(): Promise<void> {
        return this.fs.list(this.uri.uri).then(children => {
            var childCache = (this.children || []).toDict(x => x.uri.name);

            this.children = children
                .filter(x => x.uri.uri !== this.uri.uri)
                .map(fsItem => new FsTreeNode(this, fsItem.uri))
                .sortBy(x => x.isFolder ? 0 : 1).thenBy(x => x.uri.path).sort();

            for (var item of this.children) {
                var old = childCache[item.uri.name];
                if (old)
                    item.children = item.children || old.children;
            }
        });
    }
}

class FsRootNode implements IFsTreeNode {
    canWrite = false;
    canDelete = false;
    text: string = "/";
    isFolder: boolean = true;

    constructor(public children: IFsTreeNode[] = []) { }
    loadChildren(): Promise<void> { return Promise.resolve(); }
}

function addRootNode(text: string, icon: string, uri: string) {
    var node = new FsTreeNode(null, new FsUri(uri), fss);
    node.text = text;
    node.icon = icon;
    return node;
}

var fsData = new FsRootNode([
    addRootNode("kaitai.io", "glyphicon-cloud", "https:///formats/"),
    addRootNode("kaitai-io/formats", "fa fa-github", "github://kaitai-io/kaitai_struct_formats/"),
    addRootNode("browser", "glyphicon-cloud", "browser:///"),
    addRootNode("browser (legacy)", "glyphicon-cloud", "browser_legacy:///"),
]);

//setTimeout(() => fsData.children.push(addRootNode("browser", "glyphicon-cloud", "browser:///")), 5000);

@Component
export class FileTree extends Vue {
    fsTree: IFsTreeNode = null;
    contextMenuNode: FsTreeNode; // selectedFsItem can be something else (eg. by pressing down)

    get ctxMenu() { return <ContextMenu>this.$refs["ctxMenu"]; }
    get fsTreeView() { return <TreeView<FsTreeNode>>this.$refs["fsTree"]; }
    get createKsyModal() { return <InputModal>this.$refs["createKsyModal"]; }
    get createFolderModal() { return <InputModal>this.$refs["createFolderModal"]; }

    get selectedFsItem() { return this.fsTreeView.selectedItem.model; }
    get selectedUri() { return this.selectedFsItem.uri.uri; }

    public init() {
        this.fsTree = fsData;
        console.log(fsData.children);

        setTimeout(() => {
            this.fsTreeView.children[0].dblclick();
        }, 500);

    }

    public openNode() {
        this.fsTreeView.selectedItem.dblclick();
    }

    public openFile() {
        fss.read(this.selectedUri).then(data => {
            this.$emit("open-file", this.selectedFsItem, data);
        });
    }

    public generateParser(lang: string, aceLangOrDebug?: any) {
        var aceLang = typeof aceLangOrDebug === "string" ? aceLangOrDebug : lang;
        var debug = typeof aceLangOrDebug === "boolean" ? aceLangOrDebug : false;

        fss.read(this.selectedUri).then(data => {
            this.$emit("generate-parser", lang, aceLang, debug, data);
        });
    }

    public showContextMenu(event: MouseEvent) {
        this.contextMenuNode = this.selectedFsItem;
        this.ctxMenu.open(event, this.contextMenuNode);
    }

    public createFolder(name: string) {
        var newUri = this.contextMenuNode.uri.addPath(`${name}/`).uri;
        this.contextMenuNode.fs.createFolder(newUri)
            .then(() => this.contextMenuNode.loadChildren());
    }

    public createKsyFile(name: string) {
        var newUri = this.contextMenuNode.uri.addPath(`${name}.ksy`).uri;
        var content = `meta:\n  id: ${name}\n  file-extension: ${name}\n`;
        this.contextMenuNode.fs.write(newUri, Convert.utf8StrToBytes(content).buffer)
            .then(() => this.contextMenuNode.loadChildren());
    }

    public cloneFile() {
        var newUri = this.contextMenuNode.uri.uri.replace(/\.(\w+)$/, `_${new Date().format("Ymd_His")}.$1`);
        console.log('cloneKsyFile', newUri);
        this.contextMenuNode.fs.read(this.contextMenuNode.uri.uri)
            .then(content => this.contextMenuNode.fs.write(newUri, content))
            .then(() => this.contextMenuNode.parent.loadChildren());
    }

    public downloadFile() {
        this.contextMenuNode.fs.read(this.contextMenuNode.uri.uri)
            .then(data => saveFile(data, this.contextMenuNode.uri.name));
    }

    public deleteFile() {
        this.contextMenuNode.fs.delete(this.contextMenuNode.uri.uri)
            .then(() => this.contextMenuNode.parent.loadChildren());
    }

    mounted() {
        var scrollbar = Scrollbar.init(this.$el);
        this.fsTreeView.getParentBoundingRect = () => scrollbar.bounding;
        this.fsTreeView.scrollIntoView = (el: Element, alignToTop: boolean) =>
            scrollbar.scrollIntoView(el, { alignToTop: alignToTop, onlyScrollIfNeeded: true });
        document.body.appendChild(this.ctxMenu.$el);
        console.log('FileTree mounted', this.fsTreeView);
        //this.createFolderModal.show();
    }
}