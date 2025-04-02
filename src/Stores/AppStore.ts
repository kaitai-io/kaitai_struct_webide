import {defineStore} from "pinia";

import {FILE_SYSTEM_TYPE_KAITAI} from "../Components/FileTree/FileSystems/KaitaiFileSystem";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";

export interface AppStore {
    selectedKsyInfo: FileSystemPath;
    selectedBinaryInfo: FileSystemPath;
}

const defaultKsyInfo: FileSystemPath = FileSystemPath.of(FILE_SYSTEM_TYPE_KAITAI, "formats/archive/zip.ksy");
const defaultBinaryInfo: FileSystemPath = FileSystemPath.of(FILE_SYSTEM_TYPE_KAITAI, "samples/sample1.zip");

const storeAppStore = (store: AppStore): void => {
    const dataToStore = {
        selectedKsyInfo: store.selectedKsyInfo,
        selectedBinaryInfo: store.selectedBinaryInfo
    }
    localStorage.setItem("AppStore", JSON.stringify(dataToStore));
}

const loadFromStore = (): AppStore => {
    const dataFromLocalStorage = JSON.parse(localStorage.getItem("AppStore"));
    if(!dataFromLocalStorage) return;

    const ksyInfo = dataFromLocalStorage.selectedKsyInfo
    const binaryInfo = dataFromLocalStorage.selectedBinaryInfo
    return {
        selectedKsyInfo: FileSystemPath.of(ksyInfo.storeId, ksyInfo.path),
        selectedBinaryInfo: FileSystemPath.of(binaryInfo.storeId, binaryInfo.path)
    }
}

export const useAppStore = defineStore("AppStore", {

    state: (): AppStore => {
        return loadFromStore() || {
            selectedKsyInfo: defaultKsyInfo,
            selectedBinaryInfo: defaultBinaryInfo
        };
    },
    actions: {
        updateSelectedBinaryFile(info?: FileSystemPath) {
            this.selectedBinaryInfo = info || defaultBinaryInfo;
            storeAppStore(this);
        },

        updateSelectedKsyFile(info?: FileSystemPath) {
            this.selectedKsyInfo = info || defaultKsyInfo;
            storeAppStore(this);
        },
    }
});