import {defineStore} from "pinia";
import {LocalStorageApi} from "../Utils/LocalStorageApi";

export interface IdeSettings {
    eagerMode: boolean;
}

export const useIdeSettingsStore = defineStore("IDESettingsStore", {
    state: (): IdeSettings => {
        const settings = LocalStorageApi.getIdeSettings();
        return settings || {
            eagerMode: true,
        };
    },
    actions: {
        setEagerMode(eagerMode: boolean) {
            this.eagerMode = eagerMode;
            LocalStorageApi.storeIdeSettings(this);
        },
    }
});