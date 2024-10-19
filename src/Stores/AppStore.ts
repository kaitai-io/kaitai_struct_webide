import {defineStore} from "pinia";

import {FILE_SYSTEM_TYPE_KAITAI} from "../Components/FileTree/FileSystems/KaitaiFileSystem";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";

export interface AppStore {
    selectedKsyInfo: FileSystemPath;
    selectedBinaryInfo: FileSystemPath;
}

const defaultKsyInfo: FileSystemPath = FileSystemPath.of(FILE_SYSTEM_TYPE_KAITAI, "formats/archive/zip.ksy");
const defaultBinaryInfo: FileSystemPath = FileSystemPath.of(FILE_SYSTEM_TYPE_KAITAI, "samples/sample1.zip");

export const useAppStore = defineStore("AppStore", {

    state: (): AppStore => {
        return JSON.parse(localStorage.getItem("AppStore")) || {
            selectedKsyInfo: defaultKsyInfo,
            selectedBinaryInfo: defaultBinaryInfo
        };
    },
    actions: {
        updateSelectedBinaryFile(info: FileSystemPath) {
            this.selectedBinaryInfo = info;
        },

        updateSelectedKsyFile(info: FileSystemPath) {
            this.selectedKsyInfo = info;
        },
    }
});