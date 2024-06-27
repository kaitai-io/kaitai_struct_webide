import {defineStore} from "pinia";
import {LocalStorageApi} from "../v1/utils/LocalStorageApi";

export interface IdeSettings {
    eagerMode: boolean;
}

export const useIdeSettingsStore = defineStore("IDESettingsStore", {
    state: (): IdeSettings => {
        const settings = LocalStorageApi.getIdeSettings();
        return settings || {
            eagerMode: false
        };
    },
    actions: {
        setEagerMode(eagerMode: boolean) {
            this.eagerMode = eagerMode;
            LocalStorageApi.storeIdeSettings(this);
        }
    }
});