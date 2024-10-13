import {
    FILE_SYSTEM_TYPE_KAITAI,
    FILE_SYSTEM_TYPE_LOCAL,
    IFileSystem,
    IFsItem,
    ITEM_MODE_DIRECTORY,
    ITEM_MODE_FILE
} from "../../../v1/FileSystems/FileSystemsTypes";

export enum TreeNodeDisplayType {
    OPEN_FOLDER,
    CLOSED_FOLDER,
    EMPTY_FOLDER,
    BINARY_FILE,
    KSY_FILE
}

export interface TreeNodeDisplay {
    path: string;
    fullPath: string;
    type: TreeNodeDisplayType;
    fileName: string;
    storeId: typeof FILE_SYSTEM_TYPE_LOCAL | typeof FILE_SYSTEM_TYPE_KAITAI;
    depth: number;
}

interface TempFileSystemVisitorDirectory {
    treeNodeDisplay: TreeNodeDisplay;
    directories: TempFileSystemVisitorDirectory[];
    files: TreeNodeDisplay[];
}

export class FileSystemVisitor {
    public static collectTreeNodesFromFileSystem(fileSystem: IFileSystem, openPaths: string[]): TreeNodeDisplay[] {
        return new FileSystemVisitor().collectVisibleFileTreeItems(fileSystem, openPaths);
    }

    private openPaths: string[];
    private currentPathParts: string[] = [];
    private collectedPaths: TreeNodeDisplay[] = [];
    private currentDirectoryPathStack: TempFileSystemVisitorDirectory[] = [];
    private currentDirectory: TempFileSystemVisitorDirectory;
    private rootDirectory: TempFileSystemVisitorDirectory;

    private constructor() {
    }

    private collectVisibleFileTreeItems(fileSystem: IFileSystem, openPaths: string[]) {
        this.openPaths = openPaths;
        this.visitFileSystem(fileSystem);
        return this.collectedPaths;
    }

    private visitFileSystem(fileSystem: IFileSystem) {
        const rootNode = fileSystem.getRootNode();
        if (!rootNode) {
            return;
        }

        this.visitRootNode(rootNode);
        this.collectPathsFromDirectory(this.rootDirectory);
    }

    private visitRootNode(rootNode: IFsItem) {
        this.currentPathParts.push(rootNode.fn);
        const rootNodeDirectory = this.mapToTempTreeNodeDisplay(rootNode);
        this.rootDirectory = rootNodeDirectory;
        this.currentDirectory = rootNodeDirectory;

        if (rootNodeDirectory.treeNodeDisplay.type === TreeNodeDisplayType.OPEN_FOLDER) {
            this.visitChildrenNodes(rootNode)
        }

        this.currentPathParts.pop();
    }
    private visitChildrenNodes(fsItem: IFsItem) {
        Object.entries(fsItem.children || {})
            .forEach(([key, child]) => {
                child.fn = key;
                this.visitNode(child);
            });
    }

    private visitNode(fsItem: IFsItem) {
        this.currentPathParts.push(fsItem.fn);

        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                this.visitFileNode(fsItem);
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                this.visitDirectoryNode(fsItem);
                break;
            }
        }

        this.currentPathParts.pop();
    }

    private visitFileNode(fsItem: IFsItem) {
        const newNode = this.mapToTreeNodeDisplay(fsItem);
        this.currentDirectory.files.push(newNode);
    }

    private visitDirectoryNode(fsItem: IFsItem) {
        const newDirectory = this.mapToTempTreeNodeDisplay(fsItem);
        this.currentDirectory.directories.push(newDirectory);

        if (newDirectory.treeNodeDisplay.type !== TreeNodeDisplayType.OPEN_FOLDER) {
            return;
        }

        this.currentDirectoryPathStack.push(this.currentDirectory);
        this.currentDirectory = newDirectory;
        this.visitChildrenNodes(fsItem)

        this.currentDirectory = this.currentDirectoryPathStack.pop();
    }

    private collectPathsFromDirectory(tempDirectory: TempFileSystemVisitorDirectory) {
        this.collectedPaths.push(tempDirectory.treeNodeDisplay);
        tempDirectory.directories.sort((d1, d2) => d1.treeNodeDisplay.fileName.localeCompare(d2.treeNodeDisplay.fileName));
        tempDirectory.directories.forEach((dir) => this.collectPathsFromDirectory(dir));
        tempDirectory.files.sort((d1, d2) => d1.fileName.localeCompare(d2.fileName));
        this.collectedPaths.push(...tempDirectory.files);
    }

    private mapToTempTreeNodeDisplay(fsItem: IFsItem): TempFileSystemVisitorDirectory {
        const baseInfo = this.mapToTreeNodeDisplay(fsItem);
        return {
            treeNodeDisplay: baseInfo,
            directories: [],
            files: []
        };
    }

    private mapToTreeNodeDisplay(fsItem: IFsItem): TreeNodeDisplay {
        const pathWithoutCurrentItem = [...this.currentPathParts];
        pathWithoutCurrentItem.pop();
        const path = pathWithoutCurrentItem.join("/");
        const fullPath = this.currentPathParts.join("/");
        const isOpen = this.isDirectoryOpen(fullPath);
        return {
            type: this.getNodeType(isOpen, fsItem),
            storeId: fsItem.fsType,
            path: path,
            fullPath: fullPath,
            fileName: fsItem.fn,
            depth: this.currentPathParts.length - 1
        };
    }

    private getNodeType(isOpen: boolean, fsItem: IFsItem): TreeNodeDisplayType {
        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                return fsItem.fn.endsWith(".ksy") ? TreeNodeDisplayType.KSY_FILE : TreeNodeDisplayType.BINARY_FILE;
            }
            case ITEM_MODE_DIRECTORY: {
                if (Object.keys(fsItem.children).length === 0) return TreeNodeDisplayType.EMPTY_FOLDER;
                return isOpen ? TreeNodeDisplayType.OPEN_FOLDER : TreeNodeDisplayType.CLOSED_FOLDER;
            }
        }
    }

    private isDirectoryOpen(path: string) {
        return !!this.openPaths.find(openPath => openPath === path);
    }
}