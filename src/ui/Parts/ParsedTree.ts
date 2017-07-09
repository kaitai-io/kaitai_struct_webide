import * as Vue from "vue";
import Component from "./../Component";
import { ITreeNode } from "../Components/TreeView";
import { IKsyTypes, ObjectType, IExportedValue, IInstance } from "../../worker/WorkerShared";

export class ParsedTreeNode implements ITreeNode {
    children: ITreeNode[];
    get bytesPreview() {
        if (!(this.value.bytes instanceof Uint8Array)) return "";

        var text = "[";
        for (var i = 0; i < this.value.bytes.byteLength; i++) {
            if (i === 8) {
                text += ", ...";
                break;
            }
            text += (i === 0 ? "" : ", ") + this.value.bytes[i];
        }
        text += "]";

        return text;        
    }

    constructor(public name: string, public value: IExportedValue) {

    }

    get hasChildren() { return this.value.type === ObjectType.Object || this.value.type === ObjectType.Array; }

    loadChildren(): Promise<void> {
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
}