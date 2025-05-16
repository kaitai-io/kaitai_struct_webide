import {defineStore} from "pinia";

export interface ParsedTreeStore {
}

export const useKsyEditorStore = defineStore("KsyEditorStore", {
    state: (): ParsedTreeStore => {
        return {
        };
    },

    actions: {
        setValue(editorId: string, content: string) {
        },
    }
});