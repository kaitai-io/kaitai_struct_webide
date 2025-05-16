import {defineStore} from "pinia";

export interface InitializeIDEStore {
    isInitialized: boolean;
    message: string;
}

export const useInitializeIDEStore = defineStore("InitializeIDEStore", {
    state: (): InitializeIDEStore => {
        return {
            isInitialized: false,
            message: "Preparing IDE..."
        };
    },

    actions: {
        initialize() {
            this.isInitialized = true;
        },
        setMessage(newMessage: string) {
            this.message = newMessage;
        },
    }
});