import {defineStore} from "pinia";


export interface AppStore {
    error: any;
}

export const useErrorStore = defineStore("ErrorStore", {
    state: (): AppStore => {
        return {
            error: undefined,
        };
    },
    actions: {
        setError(error: any) {
            this.error = error;
        },

        clearErrors() {
            this.error = undefined;
        },
    }
});