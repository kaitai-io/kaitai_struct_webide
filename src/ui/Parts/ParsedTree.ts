import * as Vue from "vue";
import Component from "./../Component";
import { ITreeNode } from "../Components/TreeView";

export class ParsedTreeNode implements ITreeNode {
    constructor(public text: string, public children: ParsedTreeNode[]) {

    }

    get hasChildren() { return this.children.length > 0; }

    loadChildren(): Promise<void> {
        return Promise.resolve();
    }
}

@Component
export class ParsedTree extends Vue {
    rootNode: ParsedTreeNode = null;
}