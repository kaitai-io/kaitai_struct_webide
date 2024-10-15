import {IFsItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "./FileSystemsTypes";
import {ArrayUtils} from "../utils/Misc/ArrayUtils";
import {FsItemPathsCollector} from "../../Components/FileTree/FileSystemVisitors/FsItemPathsCollector";

export class IFsItemHelper {
    public static createFileOrDirectoryFromPathInRoot = (root: IFsItem, filePath: string, createDirectoryMode: boolean = false) => {
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

    public static deletePathAndReturnFilesToDelete = (root: IFsItem, filePath: string): string[] => {
        const isDeletingFromRoot = filePath.length === 0;

        if (isDeletingFromRoot) {
            const filesInRoot = FsItemPathsCollector.collectFiles(root);
            Object.keys(root.children || {}).forEach(key => delete root.children[key]);
            return filesInRoot;
        } else {
            const filePathParts = filePath.split("/");
            let nodeToDelete = IFsItemHelper.deleteNodeFromRoot(root, filePathParts);
            return FsItemPathsCollector.collectFiles(nodeToDelete);
        }
    };

    public static deleteNodeFromRoot = (root: IFsItem, filePathParts: string[]) => {
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

}