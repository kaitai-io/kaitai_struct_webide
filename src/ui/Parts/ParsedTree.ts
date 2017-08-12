import * as Vue from "vue";
import Component from "./../Component";
import { TreeView, ITreeNode } from "../Components/TreeView";
import { IKsyTypes, ObjectType, IExportedValue, IInstance } from "../../worker/WorkerShared";

export class ParsedTreeNode implements ITreeNode {
    children: ITreeNode[];
    constructor(public root: ParsedTreeRootNode, public name: string, public value: IExportedValue, public instance?: IInstance) {
        this.name = this.name || instance && instance.path.last();
    }

    get isUnloadedInstance() { return this.instance && !this.value; }

    get exceptionText() { return typeof this.value.exception === "string" ? this.value.exception : JSON.stringify(this.value.exception); }

    get hasChildren() { return this.isUnloadedInstance || this.value.type === ObjectType.Object || this.value.type === ObjectType.Array; }

    get bytesPreview() {
        return `[${this.value.bytes.slice(0,8).join(", ")}${(this.value.bytes.length > 8 ? ", ..." : "")}]`;
    }

    get hexStrValue() {
        return (this.value.primitiveValue < 0 ? "-" : "") + "0x" +
            this.value.primitiveValue.toString(16);
    }

    async loadChildren() {
        if (this.children) return;

        if (this.isUnloadedInstance) {
            console.log("Load instance", this);
            this.value = await this.root.loadInstance(this.instance.path);
            await this.loadChildren();
        } else if (this.value.type === ObjectType.Object) {
            this.children = Object.keys(this.value.object.fields).map(x => new ParsedTreeNode(this.root, x, this.value.object.fields[x]))
                .concat(Object.keys(this.value.object.instances).map(x => new ParsedTreeNode(this.root, x, null, this.value.object.instances[x])));
        } else if (this.value.type === ObjectType.Array) {
            this.children = this.value.arrayItems.map((x,i) => new ParsedTreeNode(this.root, `${i}`, x));
        } else {
            this.children = [];
        }
    }
}

export class ParsedTreeRootNode implements ITreeNode {
    hasChildren: boolean = true;
    children: ITreeNode[];

    constructor(rootNode: ParsedTreeNode) {
        rootNode.root = this;
        this.children = [rootNode];
    }

    async loadChildren() { /* */ }
    async loadInstance(path: string[]): Promise<IExportedValue> { return null; }
}

@Component
export class ParsedTree extends Vue {
    rootNode: ParsedTreeRootNode = null;

    get treeView() { return <TreeView<ITreeNode>>this.$refs["treeView"]; }

    async open(path: string) {
        return this.treeView.searchNode((item: ParsedTreeNode) => {
            const itemPath = item.value.path.join("/");
            return itemPath === path ? "match" : itemPath === "" || path.startsWith(itemPath + "/") ? "children" : "nomatch";
        });
    }
}