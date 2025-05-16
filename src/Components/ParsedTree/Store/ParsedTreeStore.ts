import {defineStore} from "pinia";

export interface ParsedTreeStore {
    openPaths: string[];
}

export const useParsedTreeStore = defineStore("ParsedTreeStore", {
    state: (): ParsedTreeStore => {
        return {
            openPaths: []
        };
    },

    actions: {
        openPath(pathToAdd: string) {
            this.openPaths = [...new Set([...this.openPaths, pathToAdd])];
        },
        closePath(pathToRemove: string) {
            this.openPaths = this.openPaths.filter((path: string) => path !== pathToRemove);
        },
        setOpenPaths(newPaths: string[]) {
            this.openPaths = newPaths
        },
    }
});