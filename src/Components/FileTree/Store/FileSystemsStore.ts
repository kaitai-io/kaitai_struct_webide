import {defineStore} from "pinia";
import {IFileSystem} from "../../../v1/FileSystems/FileSystemsTypes";
import {toRaw} from "vue";

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
        async addFile(storeId: string, path: string, content: string | ArrayBuffer) {
            const fileSystem: IFileSystem = this.fileSystems.find((fs: IFileSystem) => fs.storeId === storeId);
            await fileSystem.put(path, content);
            fileSystem.save(toRaw(fileSystem.getRootNode()));
            serializeConfigToLocalStorage(this);
        },
        async getFile(storeId: string, filePath: string): Promise<string | ArrayBuffer> {
            const fileSystem = this.fileSystems.find((fs: IFileSystem) => fs.storeId === storeId);
            return !!fileSystem
                ? await fileSystem.get(filePath)
                : "";
        }
    }
});
