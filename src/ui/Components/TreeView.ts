///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";
import UIHelper from "../UIHelper";
declare var Scrollbar: any;

export interface IFsTreeNode {
    text: string;
    isFolder: boolean;
    canWrite: boolean;
    canDelete: boolean;
    children: IFsTreeNode[];
    loadChildren(): Promise<void>;
}

Vue.config.keyCodes["pageup"] = 33;
Vue.config.keyCodes["pagedown"] = 34;

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

    mounted() {
        //if (Scrollbar) {
        //    var scrollbar = Scrollbar.init(this.$el);
        //    this.scrollIntoView = (el, alignToTop) => scrollbar.scrollIntoView(el, { alignToTop: alignToTop });
        //}
    }

    openSelected() {
        if (!this.selectedItem.open)
            this.selectedItem.dblclick();
        else
            this.selectNode("next");
        this.scrollSelectedIntoView();
    }

    closeSelected() {
        if (this.selectedItem.open)
            this.selectedItem.dblclick();
        else if (this.selectedItem.parent.parent)
            this.setSelected(this.selectedItem.parent);
        this.scrollSelectedIntoView();
    }

    selectRelativeNode(node: TreeViewItem<T>, dir: "prev" | "next") {
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

    selectNode(dir: "prev" | "next", pageJump = false) {
        console.log("selectNode", dir, pageJump);
        for(var i = 0; i < (pageJump ? 25 : 1); i++)
            this.selectRelativeNode(this.selectedItem, dir);
    }

    scrollIntoView(target: Element, alignToTop: boolean) {
        target.scrollIntoView(false);
    }

    getParentBoundingRect(){
        return this.$el.getBoundingClientRect();
    }

    scrollSelectedIntoView() {
        var target = this.selectedItem.$el.children[0];
        var rect = target.getBoundingClientRect();
        var parentRect = this.getParentBoundingRect();

        if (rect.bottom > parentRect.bottom)
            this.scrollIntoView(target, false);
        else if (rect.top < parentRect.top)
            this.scrollIntoView(target, true);
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
    loadingError: string = null;

    get icon() {
        return this.model["icon"] ? this.model["icon"] :
            this.model.isFolder ? (this.open ? "glyphicon-folder-open" : "glyphicon-folder-close") : "glyphicon-list-alt";
    };

    get treeView() { return UIHelper.findParent(this, TreeView); }

    get children() { return <TreeViewItem<T>[]>this.$children; }
    get parent() { return <TreeViewItem<T>>this.$parent; }

    dblclick() {
        if (this.model.isFolder) {
            this.open = !this.open;
            if (this.open && !this.model.children) {
                this.childrenLoading = true;
                this.loadingError = null;
                setTimeout(() => this.model.loadChildren().catch(x => {
                    console.error(x);
                    this.loadingError = `${x}`;
                }).then(() => this.childrenLoading = false), 0);
            }
        } else {
            this.treeView.$emit("item-dblclick", this.model);
        }
    }

    click() {
        this.treeView.setSelected(this);
    }

    contextmenu(event: MouseEvent) {
        this.click();
        this.treeView.$emit("item-contextmenu", event, this.model);
    }
}
