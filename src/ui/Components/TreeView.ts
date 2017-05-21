///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";

export interface IFsTreeNode {
    text: string;
    isFolder: boolean;
    children: IFsTreeNode[];
    loadChildren(): Promise<void>;
}

@Component
export class TreeView<T extends IFsTreeNode> extends Vue {
    model: T;
    selectedItem: TreeViewItem<T> = null;

    get children() { return <TreeViewItem<T>[]>this.$children; }

    created() {
        this.$watch("model", () => {
            if (this.model)
                this.model.loadChildren();
        });
    }

    openSelected() {
        if (!this.selectedItem.open)
            this.selectedItem.dblclick();
        else
            this.selectNextNode();
    }

    closeSelected() {
        if (this.selectedItem.open)
            this.selectedItem.dblclick();
        else if (this.selectedItem.parent.parent)
            this.setSelected(this.selectedItem.parent);
    }

    selectNode(node: TreeViewItem<T>, dir: "prev" | "next") {
        if (dir === "next") {
            if (node.open && node.children && node.children.length > 0)
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
                    while (selChildren.open && selChildren.children && selChildren.children.length > 0)
                        selChildren = selChildren.children.last();
                    this.setSelected(selChildren);
                } else if (node.parent.parent)
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
        var target = this.selectedItem.$el.children[0];
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
export class TreeViewItem<T extends IFsTreeNode> extends Vue {
    model: T;
    open = false;
    selected = false;
    childrenLoading = false;

    get icon() {
        return this.model["icon"] ? this.model["icon"] :
            this.model.isFolder ? (this.open ? "glyphicon-folder-open" : "glyphicon-folder-close") : "glyphicon-list-alt";
    };

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

    dblclick() {
        if (this.model.isFolder) {
            this.open = !this.open;
            if (this.open && !this.model.children) {
                this.childrenLoading = true;
                setTimeout(() => this.model.loadChildren().then(() => this.childrenLoading = false), 0);
            }
        } else {
            this.treeView.$emit("openfile", this.model);
        }
    }

    click() {
        this.treeView.setSelected(this);
    }
}
