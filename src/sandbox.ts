///<reference path="../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "./ui/Component";

import { GithubClient } from "./FileSystem/GithubClient";
import { GithubFileSystem } from "./FileSystem/GithubFileSystem";
import { LocalFileSystem } from "./FileSystem/LocalFileSystem";
import { RemoteFileSystem } from "./FileSystem/RemoteFileSystem";
import { StaticFileSystem } from "./FileSystem/StaticFileSystem";
import { IFileSystem } from "./FileSystem/Common";
import { FsUri } from "./FileSystem/FsUri";
import { FsSelector } from "./FileSystem/FsSelector";

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

    openSelected() {
        if (!this.selectedItem.open)
            this.selectedItem.toggle();
        else
            this.selectNextNode();
    }

    closeSelected() {
        if (this.selectedItem.open)
            this.selectedItem.toggle();
        else if (this.selectedItem.parent.parent)
            this.setSelected(this.selectedItem.parent);
    }

    selectNode(node: TreeViewItem<T>, dir: "prev" | "next") {
        if (dir === "next") {
            if (node.children && node.children.length > 0)
                this.setSelected(node.children[0]);
            else {
                while (node.parent) {
                    var children = node.parent.children;
                    var thisIdx = children.indexOf(node);

                    if (thisIdx + 1 < children.length) {
                        this.setSelected(children[thisIdx + 1]);
                        break;
                    } else
                        node = node.parent;
                }
            }
        } else if (dir === "prev") {
            if (node.parent) {
                var children = node.parent.children;
                var thisIdx = children.indexOf(node);

                if (thisIdx - 1 >= 0) {
                    var selChildren = children[thisIdx - 1];
                    while (selChildren.children && selChildren.children.length > 0)
                        selChildren = selChildren.children.last();
                    this.setSelected(selChildren);
                } else if(node.parent.parent)
                    this.setSelected(node.parent);
            }
        }
    }

    selectNextNode(fromNode?: TreeViewItem<T>) {
        this.selectNode(this.selectedItem, "next");
    }

    selectPrevNode() {
        this.selectNode(this.selectedItem, "prev");
    }

    scrollSelectedIntoView() {
        var target = this.selectedItem.$el;
        var rect = target.getBoundingClientRect();
        var parentRect = this.$el.getBoundingClientRect();

        if (rect.bottom > parentRect.bottom)
            target.scrollIntoView(false);
        else if (rect.top < parentRect.top)
            target.scrollIntoView();
    }

    setSelected(newSelected: TreeViewItem<T>) {
        if (this.selectedItem)
            this.selectedItem.selected = false;
        this.selectedItem = newSelected;
        this.selectedItem.selected = true;
        this.scrollSelectedIntoView();
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
    get parent() { return <TreeViewItem<T>>this.$parent; }

    toggle() {
        if (this.model.isFolder) {
            this.open = !this.open;
            if (this.open && !this.model.children) {
                this.childrenLoading = true;
                setTimeout(() => this.model.loadChildren().then(() => this.childrenLoading = false), 0);
            }
        }
    }

    select() {
        this.treeView.setSelected(this);
    }
}

class FsTreeNode implements IFsTreeNode {
    text: string;
    isFolder: boolean;
    children: IFsTreeNode[] = null;

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

var fsData = new FsTreeNode(fss, new FsUri("static:///"));
//var fsData = new FsTreeNode(fss, new FsUri("github://koczkatamas/kaitai_struct_formats/"));

var demo = new Vue({
    el: "#tree",
    data: { treeData: fsData }
});
window["demo"] = demo;
var treeView = <TreeView<IFsTreeNode>>demo.$refs["treeView"];
setTimeout(() => {
    treeView.children[1].toggle();
    treeView.children[6].toggle();
}, 500);
