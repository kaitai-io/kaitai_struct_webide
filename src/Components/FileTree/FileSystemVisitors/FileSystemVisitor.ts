import {
    FILE_SYSTEM_TYPE_KAITAI,
    FILE_SYSTEM_TYPE_LOCAL,
    IFileSystem,
    IFsItem,
    ITEM_MODE_DIRECTORY,
    ITEM_MODE_FILE
} from "../../../v1/FileSystems/FileSystemsTypes";

export const OPEN_FOLDER = "OPEN_FOLDER";
export const CLOSED_FOLDER = "CLOSED_FOLDER";
export const EMPTY_FOLDER = "EMPTY_FOLDER";
export const BINARY_FILE = "BINARY_FILE";
export const KSY_FILE = "KSY_FILE";

export type NodeType = typeof EMPTY_FOLDER | typeof OPEN_FOLDER | typeof CLOSED_FOLDER | typeof BINARY_FILE | typeof KSY_FILE;

export interface TreeNodeDisplay {
    fullPath: string;
    type: NodeType;
    fileName: string;
    isOpen: boolean;
    storeId: typeof FILE_SYSTEM_TYPE_LOCAL | typeof FILE_SYSTEM_TYPE_KAITAI;
    depth: number;
}

export class FileSystemVisitor {
    private openPaths: string[];
    private currentPath: string[] = [];
    private visibleFsItemsNew: TreeNodeDisplay[] = [];

    public visit(fileSystem: IFileSystem, openPaths: string[]) {
        this.openPaths = openPaths;
        this.visitFileSystem(fileSystem);
        return this.visibleFsItemsNew;
    }

    private visitFileSystem(fileSystem: IFileSystem) {
        if (!fileSystem.getRootNode()) {
            this.visibleFsItemsNew = [];
            return;
        }
        this.visitNode(fileSystem.getRootNode());

    }

    private visitNode(fsItem: IFsItem) {
        this.currentPath.push(fsItem.fn);
        const newNode = this.mapToNewNode(fsItem);
        this.visibleFsItemsNew.push(newNode);

        if (fsItem.type === ITEM_MODE_DIRECTORY && newNode.isOpen) {
            Object.entries(fsItem.children || {})
                .forEach(([key, child]) => {
                    child.fn = key;
                    this.visitNode(child);
                });
        }
        this.currentPath.pop();
    }


    private mapToNewNode(fsItem: IFsItem): TreeNodeDisplay {
        const fullPath = this.currentPath.join("/");
        const isOpen = this.isDirectoryOpen(fullPath);
        return {
            type: this.getNodeType(isOpen, fsItem),
            storeId: fsItem.fsType,
            fullPath: fullPath,
            fileName: fsItem.fn,
            isOpen: isOpen,
            depth: this.currentPath.length - 1
        };
    }

    private getNodeType(isOpen: boolean, fsItem: IFsItem): NodeType {
        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                return fsItem.fn.endsWith(".ksy") ? KSY_FILE : BINARY_FILE;
            }
            case ITEM_MODE_DIRECTORY: {
                if (Object.keys(fsItem.children).length === 0) return EMPTY_FOLDER;
                else if (isOpen) return OPEN_FOLDER;
                else return CLOSED_FOLDER;
            }
        }
    }

    private isDirectoryOpen(path: string) {
        const tempPath = this.currentPath.join("/");
        return !!this.openPaths.find(openPath => openPath === tempPath);
    }
}