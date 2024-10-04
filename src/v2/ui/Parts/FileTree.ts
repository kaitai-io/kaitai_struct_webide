import { IFileSystem } from "../../FileSystem/Common";
import { GithubClient } from "../../FileSystem/GithubClient";
import { GithubFileSystem } from "../../FileSystem/GithubFileSystem";
import { BrowserFileSystem, BrowserLegacyFileSystem } from "../../FileSystem/BrowserFileSystem";
import { RemoteFileSystem } from "../../FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "../../FileSystem/StaticFileSystem";
import { HttpFileSystem } from "../../FileSystem/HttpFileSystem";
import { FsUri } from "../../FileSystem/FsUri";
import { FsSelector } from "../../FileSystem/FsSelector";
import { TreeView } from "../Components/TreeView";
import * as Vue from "vue";
import Component from "../../../ui/Component";

import { ContextMenu } from "../Components/ContextMenu";
import "../Components/ContextMenu";
import { InputModal } from "../Components/InputModal";
import "../Components/InputModal";
import "../Components/TreeView";

import { ITreeNode } from "../Components/TreeView";
import { FileUtils } from "../../utils/FileUtils";
import { Conversion } from "../../utils/Conversion";
declare var Scrollbar: any;
declare var kaitaiFsFiles: string[];

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
//console.log(httpFs.fileUrls);
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
        if (this.isKsy)
            this.icon = "glyphicon-list-alt";
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

var browserStorage = addRootNode("browser", "glyphicon-cloud", "browser:///");
var nodeKaitaiIo = addRootNode("kaitai.io", "glyphicon-cloud", "https:///");
var fsData = new FsRootNode([
    nodeKaitaiIo,
    addRootNode("kaitai-io/formats", "fa fa-github", "github://kaitai-io/kaitai_struct_formats/"),
    browserStorage,
    addRootNode("browser (legacy)", "glyphicon-cloud", "browser_legacy:///"),
]);

nodeKaitaiIo.loadChildren().then(() => {
    nodeKaitaiIo.children[0].icon = "glyphicon-book";
    nodeKaitaiIo.children[1].icon = "glyphicon-cd";
    //console.log('set icons!', nodeKaitaiIo, nodeKaitaiIo.children[0].icon);
});

//setTimeout(() => fsData.children.push(addRootNode("browser", "glyphicon-cloud", "browser:///")), 5000);

@Component
export class FileTree extends Vue {
    fsTree: IFsTreeNode = null;
    selectedFsItem: FsTreeNode = null;
    defaultStorage: FsTreeNode = null;

    get ctxMenu() { return <ContextMenu>this.$refs["ctxMenu"]; }
    get fsTreeView() { return <TreeView<FsTreeNode>>this.$refs["fsTree"]; }
    get createKsyModal() { return <InputModal>this.$refs["createKsyModal"]; }
    get createFolderModal() { return <InputModal>this.$refs["createFolderModal"]; }

    get selectedUri() { return this.selectedFsItem.uri.uri; }
    get canCreateFile() { return this.selectedFsItem && this.selectedFsItem.canWrite && this.selectedFsItem.isFolder; }
    get canDownloadFile() { return this.selectedFsItem && !this.selectedFsItem.isFolder; }

    public init() {
        this.fsTree = fsData;
        this.defaultStorage = browserStorage;
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
        //console.log("fsItemSelected", arguments);
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
        let dest = this.selectedFsItem || this.defaultStorage;
        if (!dest.isFolder)
            dest = dest.parent;

        const resultUris = [];
        for(const fileName of Object.keys(files)) {
            const newProposedUri = dest.uri.addPath(fileName).uri;
            const newFinalUri = await this.writeFile(newProposedUri, files[fileName]);
            resultUris.push(newFinalUri);
        }

        await dest.loadChildren();

        if (resultUris.length === 1) {
            await this.selectItem(resultUris[0]);
            await this.openFile();
        }

        return resultUris;
    }

    public async findNextAvailableName(uri: string) {
        const uriObj = new FsUri(uri);
        const parentNames = (await fss.list(uriObj.parentUri.uri)).map(x => x.uri.name);
        for (var iTry = 1; iTry < 50; iTry++) {
            const newName = iTry === 1 ? uriObj.name : `${uriObj.nameWoExtension} (${iTry}).${uriObj.extension}`;
            if (!parentNames.some(x => x === newName))
                return uriObj.parentUri.addPath(newName).uri;
        }

        throw new Error(`Something went wrong. Could not find any available filename for uri "${uri}"!`);
    }

    public async writeFile(uri: string, content: ArrayBufferLike, renameOnConflict = true): Promise<string> {
        const isReadOnly = !fss.capabilities(uri).write;
        if (isReadOnly)
            uri = this.defaultStorage.uri.changePath(new FsUri(uri).path).uri;

        if (renameOnConflict)
            uri = await this.findNextAvailableName(uri);

        await fss.write(uri, content);
        await this.selectItem(uri);
        return uri;
    }

    public async getNodeForUri(uri: string, loadChildrenIfNeeded = true) {
        return await this.fsTreeView.searchNode(item => {
            return uri === item.uri.uri ? "match" :
                uri.startsWith(item.uri.uri) ? "children" : "nomatch";
        });
    }

    public async selectItem(uri: string) {
        const itemNode = await this.getNodeForUri(uri);
        this.fsTreeView.setSelected(itemNode);
    }

    public async createKsyFile(name: string) {
        if (name.endsWith(".kcy")) {
            await this.uploadFiles({ [name]: Conversion.strToUtf8Bytes("") });
        } else {
            var content = `meta:\n  id: ${name}\n  file-extension: ${name}\n`;
            await this.uploadFiles({ [`${name}.ksy`]: Conversion.strToUtf8Bytes(content) });
        }
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
        await this.uploadFiles(files);
    }

    public async deleteFile() {
        await this.selectedFsItem.fs.delete(this.selectedFsItem.uri.uri);
        await this.selectedFsItem.parent.loadChildren();
    }

    mounted() {
        var scrollbar = Scrollbar.init(this.fsTreeView.$el);
        this.fsTreeView.getParentBoundingRect = () => scrollbar.bounding;
        this.fsTreeView.scrollIntoView = (el: Element, alignToTop: boolean) => {
            scrollbar.update();
            scrollbar.scrollIntoView(el, { alignToTop: alignToTop, onlyScrollIfNeeded: true });
        };
        console.log("FileTree mounted", this.fsTreeView);
        //this.createFolderModal.show();
    }
}