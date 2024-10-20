import {FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";
import {ArrayUtils} from "../../../Utils/ArrayUtils";
import {FileSystemFilesCollector} from "../FileSystemVisitors/FileSystemFilesCollector";

export interface FileSystemItemPathInfo {
    isRoot: boolean;
    nodeName: string;
    node: FileSystemItem;
    parentNode?: FileSystemItem;
    path: string;
}

export class FsItemHelper {
    public static createFileOrDirectoryFromPathInRoot = (root: FileSystemItem, filePath: string, createDirectoryMode: boolean = false) => {
        const pathParts = filePath.split("/");
        let currentNode = root;
        let fullPathAccumulated = "";
        for (let currentPathPartIndex = 0; currentPathPartIndex < pathParts.length; currentPathPartIndex++) {
            const currentPathPart = pathParts[currentPathPartIndex];
            fullPathAccumulated += (fullPathAccumulated ? "/" : "") + currentPathPart;

            const currentNodeContainsPathPartAsChild = currentPathPart in currentNode.children;
            if (!currentNodeContainsPathPartAsChild) {
                const isNotLastPart = currentPathPartIndex !== (pathParts.length - 1);
                const shouldCreateDirectory = createDirectoryMode || isNotLastPart;
                currentNode.children[currentPathPart] = shouldCreateDirectory
                    ? {fsType: root.fsType, type: ITEM_MODE_DIRECTORY, children: {}}
                    : {fsType: root.fsType, type: ITEM_MODE_FILE, fn: currentPathPart};
            }

            currentNode = currentNode.children[currentPathPart];
        }
    };

    public static deletePathAndReturnFilesToDelete = (root: FileSystemItem, filePath: string): string[] => {
        const isDeletingRoot = filePath.length === 0;

        if (isDeletingRoot) {
            const filesInRoot = FileSystemFilesCollector.collectFileNames(root);
            Object.keys(root.children || {}).forEach(key => delete root.children[key]);
            return filesInRoot;
        } else {
            const filePathParts = filePath.split("/");
            let nodeToDelete = FsItemHelper.deleteNodeFromRoot(root, filePathParts);
            return FileSystemFilesCollector.collectFileNames(nodeToDelete);
        }
    };

    public static deleteNodeFromRoot = (root: FileSystemItem, filePathParts: string[]) => {
        let currNode = root;
        for (let i = 0; i < filePathParts.length - 1; i++) {
            const fnPart = filePathParts[i];
            currNode = currNode.children[fnPart];
        }
        const lastPart = ArrayUtils.last(filePathParts);
        const nodeToDelete = currNode.children[lastPart];
        delete currNode.children[lastPart];
        return nodeToDelete;
    };

    public static findNodeInRoot = (root: FileSystemItem, filePathParts: string[]) => {
        let currNode = root;
        for (let i = 0; i < filePathParts.length; i++) {
            const fnPart = filePathParts[i];
            currNode = currNode.children[fnPart];
        }
        return currNode;
    };

    public static getInfoAboutPath(root: FileSystemItem, path: string): FileSystemItemPathInfo {
        if (path === "") return {
            nodeName: "",
            isRoot: true,
            node: root,
            path: path
        };
        const pathParts = path.split("/");
        const nodeName = pathParts[pathParts.length - 1];
        const parentFolder = [...pathParts];
        parentFolder.pop();
        const parentNode = FsItemHelper.findNodeInRoot(root, parentFolder);
        return {
            isRoot: false,
            nodeName: nodeName,
            node: parentNode.children[nodeName],
            parentNode: parentNode,
            path: path
        };
    }

}