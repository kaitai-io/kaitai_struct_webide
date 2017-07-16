import * as Vue from "vue";
import Component from "./../Component";
import { TreeView, ITreeNode } from "../Components/TreeView";
import { IKsyTypes, ObjectType, IExportedValue, IInstance } from "../../worker/WorkerShared";

export class ParsedTreeNode implements ITreeNode {
    children: ITreeNode[];
    constructor(public name: string, public value: IExportedValue) { }

    get hasChildren() { return this.value.type === ObjectType.Object || this.value.type === ObjectType.Array; }

    get bytesPreview() {
        return `[${this.value.bytes.slice(0,8).join(", ")}${(this.value.bytes.length > 8 ? ", ..." : "")}]`;
    }

    get hexStrValue() {
        return (this.value.primitiveValue < 0 ? "-" : "") + "0x" +
            this.value.primitiveValue.toString(16);
    }

    loadChildren(): Promise<void> {
        if (this.children) return;

        if (this.value.type === ObjectType.Object)
            this.children = Object.keys(this.value.object.fields).map(x => new ParsedTreeNode(x, this.value.object.fields[x]));
        else if (this.value.type === ObjectType.Array)
            this.children = this.value.arrayItems.map((x,i) => new ParsedTreeNode(`${i}`, x));
        else
            this.children = [];
        return Promise.resolve();
    }
}

export class ParsedTreeRootNode implements ITreeNode {
    hasChildren: boolean = true;
    children: ITreeNode[];

    constructor(rootNode: ITreeNode) {
        this.children = [rootNode];
    }

    async loadChildren() { /* */ }
}

@Component
export class ParsedTree extends Vue {
    rootNode: ParsedTreeRootNode = null;

    get treeView() { return <TreeView<ITreeNode>>this.$refs["treeView"]; }

    async open(path: string) {
        return this.treeView.searchNode((item: ParsedTreeNode) => {
            const itemPath = item.value.path.join("/");
            return itemPath === path ? "match" : path.startsWith(itemPath) ? "children" : "nomatch";
        });
    }
}