import {defineStore} from "pinia";
import {Ace} from "ace-builds";

export interface KsyEditorsInfo {
    mainKsyEditor?: Ace.Editor;
    debugCodeEditor?: Ace.Editor;
    releaseCodeEditor?: Ace.Editor;
}

export const useAceEditorStore = defineStore("AceEditorStore", {
    state: (): KsyEditorsInfo => {
        return {};
    },
    actions: {
        setKaitaiKsyEditor(newEditor: Ace.Editor) {
            this.mainKsyEditor = newEditor;
        },
        setDebugCodeEditor(newEditor: Ace.Editor) {
            this.debugCodeEditor = newEditor;
        },
        setReleaseCodeEditor(newEditor: Ace.Editor) {
            this.releaseCodeEditor = newEditor;
        }
    }
});