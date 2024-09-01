import {defineStore} from "pinia";
import {IFileSystem} from "../../../v1/FileSystems/FileSystemsTypes";

export interface FileSystemsStore {
    fileSystems: IFileSystem[];
    openPaths: string[];
    selectedPath: string;
}

const serializeConfigToLocalStorage = (store: FileSystemsStore) => {
    const config = JSON.stringify({
        fileSystems: [],
        selectedPath: store.selectedPath,
        openPaths: store.openPaths,
    });
    localStorage.setItem("FileTree", config);
};


export const useFileSystems = defineStore("FileSystemsStore", {
    state: (): FileSystemsStore => {
        return JSON.parse(localStorage.getItem("FileTree")) || {
            fileSystems: [],
            openPaths: [],
            selectedPath: ""
        };
    },
    actions: {
        addFileSystem(fileSystem: IFileSystem) {
            this.fileSystems.push(fileSystem);
        },
        openPath(pathToAdd: string) {
            this.openPaths.push(pathToAdd);
            serializeConfigToLocalStorage(this);
        },
        closePath(pathToRemove: string) {
            this.openPaths = this.openPaths.filter((path: string) => path !== pathToRemove);
            serializeConfigToLocalStorage(this);
        },
        selectPath(path: string) {
            this.selectedPath = path;
            serializeConfigToLocalStorage(this);
        },
    }
});
