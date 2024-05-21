import * as Vue from "vue";
import Component from "../../../ui/Component";
import { TreeView, ITreeNode } from "../Components/TreeView";
import { ObjectType, IExportedValue, IInstance } from "../../worker/WorkerShared";

export class LazyArrayNode implements ITreeNode {
    nodeType = "LazyArray";
    children: ITreeNode[];

    constructor(public arrayNode: ParsedTreeNode, public from: number, public to: number) { }

    get hasChildren() { return true; }

    static async generateChildren(arrayNode: ParsedTreeNode, from: number, to: number) {
        const oneLevelMax = 100;
        const length = to - from;

        let step = 1;
        while (step * oneLevelMax < length)
            step *= oneLevelMax;

        if (step === 1) {
            return await arrayNode.fetchLazyArray(from, to);
        } else {
            let children = [];
            for (let currFrom = from; currFrom < to; currFrom += step)
                children.push(new LazyArrayNode(arrayNode, currFrom, Math.min(currFrom + step - 1, to)));
            return children;
        }
    }

    async loadChildren() {
        this.children = await LazyArrayNode.generateChildren(this.arrayNode, this.from, this.to);
    }
}

export class ParsedTreeNode implements ITreeNode {
    children: ITreeNode[];
    constructor(public root: ParsedTreeRootNode, public name: string, public value: IExportedValue, public instance?: IInstance) {
        this.name = this.name || instance && instance.path.last();
    }

    get isUnloadedInstance() { return this.instance && !this.value; }

    get exceptionText() {
        return typeof this.value.exception === "string" ? this.value.exception :
            this.value.exception.message ? this.value.exception.message : JSON.stringify(this.value.exception);
    }

    get hasChildren() { return this.isUnloadedInstance || this.value.type === ObjectType.Object || this.value.type === ObjectType.Array; }

    get bytesPreview() {
        return `[${this.value.bytes.slice(0,8).join(", ")}${(this.value.bytes.length > 8 ? ", ..." : "")}]`;
    }

    get hexStrValue() {
        return (this.value.primitiveValue < 0 ? "-" : "") + "0x" +
            this.value.primitiveValue.toString(16);
    }

    async fetchLazyArray(from: number, to: number) {
        const array = await this.root.loadLazyArray(this.value.path, from, to);
        return array.map((x,i) => new ParsedTreeNode(this.root, `${from + i}`, x));
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
            if (this.value.isLazyArray) {
                this.children = await LazyArrayNode.generateChildren(this, 0, this.value.arrayLength - 1);
            } else
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
    async loadLazyArray(arrayPath: string[], from: number, to: number): Promise<IExportedValue[]> { return null; }
}

@Component
export class ParsedTree extends Vue {
    rootNode: ParsedTreeRootNode = null;

    get treeView() { return <TreeView<ITreeNode>>this.$refs["treeView"]; }

    async open(path: string) {
        return this.treeView.searchNode((item: ParsedTreeNode|LazyArrayNode) => {
            const arrayNode = <LazyArrayNode>item;
            const exportedNode = <ParsedTreeNode>item;
            if (arrayNode.arrayNode) {
                const arrayPath = arrayNode.arrayNode.value.path.join("/");
                if (path.startsWith(arrayPath + "/")) {
                    const arrayIdx = parseInt(path.substr(arrayPath.length + 1).split("/")[0]);
                    return arrayNode.from <= arrayIdx && arrayIdx <= arrayNode.to ? "children" : "nomatch";
                }
            } else {
                const itemPath = exportedNode.value.path.join("/");
                return itemPath === path ? "match" : itemPath === "" || path.startsWith(itemPath + "/") ? "children" : "nomatch";
            }
        });
    }
}