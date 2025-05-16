import {FileSystemDirectory, FileSystemFile, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";

export interface FileSystemItemPathInfo {
    nodeName: string;
    node: FileSystemItem;
    parentNode?: FileSystemDirectory;
    path: string;
}

export class FsItemHelper {


    public static createFileOrDirectoryFromPathInRoot = (root: FileSystemDirectory, filePath: string, createDirectoryMode: boolean = false) => {
        const pathParts = filePath.split("/");
        let currentNode: FileSystemDirectory = root;
        let fullPathAccumulated = "";
        for (let currentPathPartIndex = 0; currentPathPartIndex < pathParts.length; currentPathPartIndex++) {
            const currentPathPart = pathParts[currentPathPartIndex];
            fullPathAccumulated += (fullPathAccumulated ? "/" : "") + currentPathPart;

            const currentNodeContainsPathPartAsChild = currentPathPart in currentNode.children;
            if (!currentNodeContainsPathPartAsChild) {
                const isNotLastPart = currentPathPartIndex !== (pathParts.length - 1);
                const shouldCreateDirectory = createDirectoryMode || isNotLastPart;
                currentNode.children[currentPathPart] = shouldCreateDirectory
                    ? FsItemHelper.directoryOf(root.storeId, currentPathPart, {})
                    : FsItemHelper.fileOf(root.storeId, currentPathPart);
            }

            currentNode = currentNode.children[currentPathPart] as FileSystemDirectory;
        }
    };

    public static findParentDirectoryForPath = (root: FileSystemDirectory, filePathParts: string[]): FileSystemDirectory => {
        let parentNode = root;
        for (let i = 0; i < filePathParts.length - 1; i++) {
            const fnPart = filePathParts[i];
            const node = parentNode.children[fnPart];
            if (!node || node.type === ITEM_MODE_FILE) {
                const path = [...filePathParts].splice(0, i).join("/");
                throw new Error(`Error file system structure, found file in middle of the path(${filePathParts.join("/")})!: ${path} is a file!`);
            }
            parentNode = node;
        }
        return parentNode;
    };

    public static getInfoAboutPath(root: FileSystemDirectory, path: string): FileSystemItemPathInfo {
        if (path === "") return {
            nodeName: "",
            node: root,
            path: path,
        };
        const pathParts = path.split("/");
        const parentNode = FsItemHelper.findParentDirectoryForPath(root, pathParts);
        const nodeName = pathParts.pop();
        return {
            nodeName: nodeName,
            node: parentNode.children[nodeName],
            parentNode: parentNode,
            path: path
        };
    }

    public static directoryOf = (storeId: string, name: string, children: { [key: string]: FileSystemItem }): FileSystemDirectory => {
        return {
            storeId: storeId,
            type: ITEM_MODE_DIRECTORY,
            name: name,
            children: children
        };
    };
    public static fileOf = (storeId: string, name: string): FileSystemFile => {
        return {
            storeId: storeId,
            type: ITEM_MODE_FILE,
            name: name
        };
    };

}