import {defineStore} from "pinia";


export interface AppStore {
    error: any;
    size: number;
}

export const useErrorStore = defineStore("ErrorStore", {
    state: (): AppStore => {
        return {
            error: undefined,
            size: 100,
        };
    },
    actions: {
        setErrorTabSize(newSize: number) {
            this.size = newSize;
        },
        setError(error: any) {
            this.error = error;
        },

        clearErrors() {
            this.error = undefined;
        },
    }
});