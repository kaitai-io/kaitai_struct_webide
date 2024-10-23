import {defineStore} from "pinia";
import {LocalStorageApi} from "../Utils/LocalStorageApi";

export interface IdeSettings {
    eagerMode: boolean;
    generateOnlyMainFile: boolean;
    removeCommonJsHeader: boolean;
}

export const useIdeSettingsStore = defineStore("IDESettingsStore", {
    state: (): IdeSettings => {
        const settings = LocalStorageApi.getIdeSettings();
        return settings || {
            eagerMode: true,
            generateOnlyMainFile: false,
            removeCommonJsHeader: true
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
        setRemoveCommonJsHeader(removeCommonJsHeader: boolean) {
            this.removeCommonJsHeader = removeCommonJsHeader;
            LocalStorageApi.storeIdeSettings(this);
        }
    }
});