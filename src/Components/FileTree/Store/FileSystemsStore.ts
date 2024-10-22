import {defineStore} from "pinia";
import {FileSystem, FileSystemPath} from "../FileSystemsTypes";

export interface FileSystemsStore {
    fileSystems: FileSystem[];
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

const validateMoveInputs = (oldPath: FileSystemPath, newPath: FileSystemPath) => {
    const isTryingToMoveRoot = oldPath.path === "";
    if (isTryingToMoveRoot) {
        throw new Error(`[FileSystemsStore][move] Root cannot be moved!`);
    }
    if (oldPath.isTheSame(newPath)) {
        throw new Error(`[FileSystemsStore][move] Moving the same directory!`);
    }
    if (!oldPath.isInTheSameStore(newPath)) {
        throw new Error(`[FileSystemsStore][move] Changing paths between stores is not supported!`);
    }
    if (oldPath.isNestedIn(newPath)) {
        throw new Error(`[FileSystemsStore][move] Trying to nest part of a path in it self! ${newPath.path} in ${oldPath.path}`);
    }
};

export const useFileSystems = defineStore("FileSystemsStore", {
    state: (): FileSystemsStore => {
        return JSON.parse(localStorage.getItem("FileTree")) || {
            fileSystems: [],
            openPaths: [],
            selectedPath: ""
        };
    },
    getters: {
        listAllItemsInPath: (state) => {
            return async (path: FileSystemPath): Promise<string[]> => {
                const fileSystem: FileSystem = state.fileSystems.find((fs: FileSystem) => fs.storeId === path.storeId);
                return !!fileSystem
                    ? fileSystem.listAllFilesInPath(path.path)
                    : [];
            };
        }
    },
    actions: {
        addFileSystem(fileSystem: FileSystem) {
            this.fileSystems.push(fileSystem);
        },
        openPath(pathToAdd: FileSystemPath) {
            this.openPaths.push(pathToAdd.toString());
            serializeConfigToLocalStorage(this);
        },
        closePath(pathToRemove: FileSystemPath) {
            const pathToRemoveStr = pathToRemove.toString();
            this.openPaths = this.openPaths.filter((path: string) => path !== pathToRemoveStr);
            serializeConfigToLocalStorage(this);
        },
        selectPath(path: FileSystemPath) {
            this.selectedPath = path.toString();
            serializeConfigToLocalStorage(this);
        },
        async addFile(storeId: string, path: string, content: string | ArrayBuffer) {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            await fileSystem.put(path, content);
        },
        async createDirectory(storeId: string, path: string) {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            await fileSystem.createDirectory(path);
        },
        async getFile(storeId: string, filePath: string): Promise<string | ArrayBuffer> {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === storeId);
            return !!fileSystem
                ? await fileSystem.get(filePath)
                : "";
        },

        deletePath(path: FileSystemPath): void {
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === path.storeId);
            if (fileSystem) {
                fileSystem.delete(path.path);
            } else {
                console.error(`[FileSystemsStore][deletePath] Could not find file system! [${path.storeId}]`);
            }
        },

        async move(oldPath: FileSystemPath, newPath: FileSystemPath): Promise<void> {
            validateMoveInputs(oldPath, newPath);
            const fileSystem: FileSystem = this.fileSystems.find((fs: FileSystem) => fs.storeId === oldPath.storeId);
            if (fileSystem) {
                await fileSystem.move(oldPath.path, newPath.path);
                this.openPaths = this.openPaths.map((path: string) => {
                    const openPath = FileSystemPath.fromFullPathWithStore(path);
                    if (openPath.isPartOf(oldPath)) {
                        return openPath.replacePathPart(oldPath, newPath).toString();
                    }
                    return path;
                });
            } else {
                console.error(`[FileSystemsStore][deletePath] Could not find file system! [${oldPath.storeId}]`);
            }
        }
    }
});
