import { Delayed } from "../utils";

export default class UIHelper {
    static findParent<T>(base: Vue, type: new () => T): T {
        var res: Vue = base;
        while (res) {
            if (res instanceof type)
                return <T>res;
            res = res.$parent;
        }
        return null;
    }
}

export class EditorChangeHandler {
    editDelay: Delayed;
    internalChange: boolean;

    constructor(public editor: monaco.editor.IStandaloneCodeEditor, delay: number, public changeCallback: (newContent: string, userChange: boolean) => void) {
        this.editDelay = new Delayed(delay);

        if (this.editor)
            this.editor.getModel().onDidChangeContent( () => this.editDelay.do(() =>
                this.changeCallback(this.editor.getValue(), !this.internalChange)));
    }

    setContent(newContent: string) {
        if (!this.editor) return;

        if (this.editor.getValue() !== newContent) {
            this.internalChange = true;
            this.editor.setValue(newContent);
            this.internalChange = false;
        }
    }

    getContent() {
        return this.editor ? this.editor.getValue() : "";
    }
}