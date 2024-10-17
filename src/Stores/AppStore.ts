import {defineStore} from "pinia";

import {FILE_SYSTEM_TYPE_KAITAI} from "../Components/FileTree/FileSystems/KaitaiFileSystem";

export interface FileLocationInfo {
    storeId: string;
    filePath: string;
}

export interface AppStore {
    selectedKsyInfo: FileLocationInfo;
    selectedBinaryInfo: FileLocationInfo;
}

const defaultKsyInfo: FileLocationInfo = {
    storeId: FILE_SYSTEM_TYPE_KAITAI,
    filePath: "formats/archive/zip.ksy"
};


const defaultBinaryInfo: FileLocationInfo = {
    storeId: FILE_SYSTEM_TYPE_KAITAI,
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
            console.log(info)
            this.selectedKsyInfo = info;
        },
    }
});