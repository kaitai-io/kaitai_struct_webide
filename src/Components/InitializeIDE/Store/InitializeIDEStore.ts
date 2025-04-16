import {defineStore} from "pinia";

export interface InitializeIDEStore {
    isInitialized: boolean;
}

export const useInitializeIDEStore = defineStore("InitializeIDEStore", {
    state: (): InitializeIDEStore => {
        return {
            isInitialized: false
        };
    },

    actions: {
        initialize() {
            this.isInitialized = true;
        },
    }
});