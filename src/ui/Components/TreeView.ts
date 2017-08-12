///<reference path="../../../lib/ts-types/vue.d.ts"/>
import * as Vue from "vue";
import Component from "../Component";
import UIHelper from "../UIHelper";
declare var Scrollbar: any;

export interface ITreeNode {
    $vm?: TreeViewItem<ITreeNode>;
    hasChildren: boolean;
    children: ITreeNode[];
    loadChildren(): Promise<void>;
}

Vue.config.keyCodes["pageup"] = 33;
Vue.config.keyCodes["pagedown"] = 34;

@Component({ props: { "wholeRow": { default: false } } })
export class TreeView<T extends ITreeNode> extends Vue {
    model: T;
    selectedItem: TreeViewItem<T> = null;
    wholeRow: boolean;

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
            this.selectNode("next");
    }

    closeSelected() {
        if (this.selectedItem.open)
            this.selectedItem.dblclick();
        else if (this.selectedItem.parent.parent)
            this.setSelected(this.selectedItem.parent);
    }

    selectRelativeNode(node: TreeViewItem<T>, dir: "prev" | "next") {
        if (dir === "next") {
            if (node.open && node.children && node.children.length > 0)
                this.setSelected(node.children[0]);
            else {
                while (node.parent) {
                    let children = node.parent.children;
                    let thisIdx = children.indexOf(node);

                    if (thisIdx + 1 < children.length) {
                        this.setSelected(children[thisIdx + 1]);
                        break;
                    } else
                        node = node.parent;
                }
            }
        } else if (dir === "prev") {
            if (node.parent) {
                let children = node.parent.children;
                let thisIdx = children.indexOf(node);

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

    getParentBoundingRect() {
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
        this.$emit("selected", this.selectedItem.model);
    }

    async searchNode(searchCallback: (item: T) => "match" | "children" | "nomatch", loadChildrenIfNeeded = true) {
        let currNode = <TreeViewItem<T>>null;
        let forceLoadChildren = false;
        while (true) {
            if (currNode && !currNode.open)
                await currNode.openNode();

            if (loadChildrenIfNeeded && currNode && (!currNode.children || currNode.children.length === 0 || forceLoadChildren))
                await currNode.model.loadChildren();

            let nextNode = null;
            for (const child of (currNode||this).children) {
                const matchResult = searchCallback(child.model);
                if(matchResult === "match")
                    return child;
                else if (matchResult === "children") {
                    nextNode = child;
                    forceLoadChildren = false;
                    break;
                }
            }

            if (nextNode !== null)
                currNode = nextNode;
            else if (!forceLoadChildren)
                forceLoadChildren = true;
            else
                return null;
        }
    }
}

@Component
export class TreeViewItem<T extends ITreeNode> extends Vue {
    model: T;
    open = false;
    selected = false;
    childrenLoading = false;
    loadingError: string = null;

    get treeView() { return UIHelper.findParent(this, TreeView); }
    get children() { return <TreeViewItem<T>[]>this.$children; }
    get parent() { return <TreeViewItem<T>>this.$parent; }

    created() {
        this.model.$vm = this;
        //console.log('model', this.model);
    }

    async openNode() {
        if (this.open || !this.model.hasChildren) return;

        this.childrenLoading = true;
        this.loadingError = null;

        try {
            if (!this.model.children)
                await this.model.loadChildren();
            this.open = true;
        } catch(e) {
            console.error(e);
            this.loadingError = `${e}`;
        }

        this.childrenLoading = false;
    }

    closeNode() {
        this.open = false;
    }

    async dblclick() {
        if (this.model.hasChildren) {
            if (this.open)
                this.closeNode();
            else
                await this.openNode();
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
