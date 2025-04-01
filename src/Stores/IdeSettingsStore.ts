import {defineStore} from "pinia";
import {LocalStorageApi} from "../Utils/LocalStorageApi";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export interface IdeSettings {
    eagerMode: boolean;
    generateOnlyMainFile: boolean;
}

export const useIdeSettingsStore = defineStore("IDESettingsStore", {
    state: (): IdeSettings => {
        const settings = LocalStorageApi.getIdeSettings();
        return settings || {
            eagerMode: true,
            generateOnlyMainFile: false
        };
    },
    actions: {
        setEagerMode(eagerMode: boolean) {
            this.eagerMode = eagerMode;
            LocalStorageApi.storeIdeSettings(this);
        },
        setGenerateOnlyMainFile(generateOnlyMainFile: boolean) {
            this.generateOnlyMainFile = generateOnlyMainFile;
            LocalStorageApi.storeIdeSettings(this);
        },
    }
});