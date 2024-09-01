import {defineStore} from "pinia";

export interface FileLocationInfo {
    storeId: string;
    filePath: string;
}

export interface AppStore {
    selectedKsyInfo: FileLocationInfo;
    selectedBinaryInfo: FileLocationInfo;
}

const defaultKsyInfo: FileLocationInfo = {
    storeId: "kaitai",
    filePath: "formats/archive/zip.ksy"
};


const defaultBinaryInfo: FileLocationInfo = {
    storeId: "kaitai",
    filePath: "samples/sample1.zip"
};

export const useAppStore = defineStore("AppStore", {

    state: (): AppStore => {
        return JSON.parse(localStorage.getItem("AppStore")) || {
            selectedKsyInfo: defaultKsyInfo,
            selectedBinaryInfo: defaultBinaryInfo
        };
    },
    actions: {
        updateSelectedBinaryFile(info: FileLocationInfo) {
            this.selectedBinaryInfo = info;
        },

        updateSelectedKsyFile(info: FileLocationInfo) {
            this.selectedKsyInfo = info;
        },
    }
});