import { IFileSystem } from "./../../FileSystem/Common";
import { GithubClient } from "./../../FileSystem/GithubClient";
import { GithubFileSystem } from "./../../FileSystem/GithubFileSystem";
import { BrowserFileSystem, BrowserLegacyFileSystem } from "./../../FileSystem/BrowserFileSystem";
import { RemoteFileSystem } from "./../../FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "./../../FileSystem/StaticFileSystem";
import { HttpFileSystem } from "../../FileSystem/HttpFileSystem";
import { FsUri } from "./../../FileSystem/FsUri";
import { FsSelector } from "./../../FileSystem/FsSelector";
import { TreeView } from "./../Components/TreeView";
import * as Vue from "vue";
import Component from "./../Component";

import { ContextMenu } from "./../Components/ContextMenu";
import "../Components/ContextMenu";
import { InputModal } from "../Components/InputModal";
import "../Components/InputModal";
import "../Components/TreeView";
import dateFormat = require("dateformat");

import { saveFile, Convert } from "../../utils";
import { ITreeNode } from "../Components/TreeView";
import { FileUtils } from "../../utils/FileUtils";
import { Conversion } from "../../utils/Conversion";
declare var Scrollbar: any;
declare var kaitaiFsFiles: string[];

for (var i = 0; i < 200; i++)
    kaitaiFsFiles.push(`formats/archive/test_${i}.ksy`);

export interface IFsTreeNode extends ITreeNode {
    text: string;
    isFolder: boolean;
    canWrite: boolean;
    canDelete: boolean;
    children: IFsTreeNode[];
    loadChildren(): Promise<void>;
}

var queryParams: { access_token?: string; secret?: string } = {};
location.search.substr(1).split("&").map(x => x.split("=")).forEach(x => queryParams[x[0]] = x[1]);

export var fss = new FsSelector();
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
    get hasChildren() { return this.isFolder; }

    constructor(public parent: FsTreeNode, public uri: FsUri, public fs: IFileSystem = null) {
        this.fs = this.fs || parent.fs;
        this.text = uri.name;
        this.isFolder = uri.type === "directory";
    }

    async loadChildren(): Promise<void> {
        let children = await this.fs.list(this.uri.uri);
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
    }
}

class FsRootNode implements IFsTreeNode {
    canWrite = false;
    canDelete = false;
    text: string = "/";
    isFolder: boolean = true;

    constructor(public children: IFsTreeNode[] = []) { }
    loadChildren(): Promise<void> { return Promise.resolve(); }
    get hasChildren() { return true; }
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
    selectedFsItem: FsTreeNode = null;

    get ctxMenu() { return <ContextMenu>this.$refs["ctxMenu"]; }
    get fsTreeView() { return <TreeView<FsTreeNode>>this.$refs["fsTree"]; }
    get createKsyModal() { return <InputModal>this.$refs["createKsyModal"]; }
    get createFolderModal() { return <InputModal>this.$refs["createFolderModal"]; }

    get selectedUri() { return this.selectedFsItem.uri.uri; }
    get canCreateFile() { return this.selectedFsItem && this.selectedFsItem.canWrite && this.selectedFsItem.isFolder; }
    get canDownloadFile() { return this.selectedFsItem && !this.selectedFsItem.isFolder; }

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

    public async openFile() {
        this.$emit("open-file", this.selectedFsItem);
    }

    public fsItemSelected(item: FsTreeNode) {
        this.selectedFsItem = item;
        console.log("fsItemSelected", arguments);
    }

    public async generateParser(lang: string, aceLangOrDebug?: any) {
        var aceLang = typeof aceLangOrDebug === "string" ? aceLangOrDebug : lang;
        var debug = typeof aceLangOrDebug === "boolean" ? aceLangOrDebug : false;

        let ksyContent = Conversion.utf8BytesToStr(await fss.read(this.selectedUri));
        this.$emit("generate-parser", lang, aceLang, debug, ksyContent);
    }

    public showContextMenu(event: MouseEvent) {
        this.ctxMenu.open(event, this.selectedFsItem);
    }

    public async createFolder(name: string) {
        var newUri = this.selectedFsItem.uri.addPath(`${name}/`).uri;
        await this.selectedFsItem.fs.createFolder(newUri);
        await this.selectedFsItem.loadChildren();
    }

    public async uploadFiles(files: { [fileName: string]: ArrayBufferLike }) {
        for(let fileName in files) {
            var newUri = this.selectedFsItem.uri.addPath(fileName).uri;
            await this.selectedFsItem.fs.write(newUri, files[fileName]);
        }
        
        await this.selectedFsItem.loadChildren();
    }

    public async createKsyFile(name: string) {
        var content = `meta:\n  id: ${name}\n  file-extension: ${name}\n`;
        await this.uploadFiles({ [`${name}.ksy`]: Conversion.strToUtf8Bytes(content) });
    }

    public async cloneFile() {
        var newUri = this.selectedFsItem.uri.uri.replace(/\.(\w+)$/, `_${new Date().format("yyyymmdd_HHMMss")}.$1`);
        console.log("cloneKsyFile", newUri);
        let content = await this.selectedFsItem.fs.read(this.selectedFsItem.uri.uri);
        await this.selectedFsItem.fs.write(newUri, content);
        await this.selectedFsItem.parent.loadChildren();
    }

    public async downloadFile() {
        let data = await this.selectedFsItem.fs.read(this.selectedFsItem.uri.uri);
        await FileUtils.saveFile(this.selectedFsItem.uri.name, data);
    }

    public async uploadFile() {
        const files = await FileUtils.openFilesWithDialog();
        this.uploadFiles(files);
    }

    public async deleteFile() {
        await this.selectedFsItem.fs.delete(this.selectedFsItem.uri.uri);
        await this.selectedFsItem.parent.loadChildren();
    }

    mounted() {
        var scrollbar = Scrollbar.init(this.fsTreeView.$el);
        this.fsTreeView.getParentBoundingRect = () => scrollbar.bounding;
        this.fsTreeView.scrollIntoView = (el: Element, alignToTop: boolean) =>
            scrollbar.scrollIntoView(el, { alignToTop: alignToTop, onlyScrollIfNeeded: true });
        document.body.appendChild(this.ctxMenu.$el);
        console.log("FileTree mounted", this.fsTreeView);
        //this.createFolderModal.show();
    }
}