import {defineStore} from "pinia";


export interface DockviewStore {
    titles: Record<string, string>
}

export interface AddTabEvent {
    title: string;
    content: string;
    language: string;
}

export const useDockviewStore = defineStore("DockviewStore", {
    state: (): DockviewStore => {
        return {
            titles: {}
        };
    },
    actions: {
        setTitle(tabId: string, value: string) {
            this.titles[tabId] = value
        },

        addTab(event: AddTabEvent) {
        },
    }
});