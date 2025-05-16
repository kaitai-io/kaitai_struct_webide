import {FileSystemDirectory, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE, ITEM_MODE_ROOT} from "../FileSystemsTypes";


export class FileSystemNodeFinder {
    public static findNode(root: FileSystemItem, path: string): FileSystemItem | undefined {
        if (!root) return undefined;
        return new FileSystemNodeFinder(path).findNode(root);
    }

    private foundNode: FileSystemItem;
    private currentPathParts: string[] = [];

    private constructor(path: string) {
        this.currentPathParts = path.length > 0
            ? path.split("/")
            : [];
    }

    private findNode(fsItem: FileSystemItem) {
        this.visitNode(fsItem);
        return this.foundNode;
    }

    private visitNextPathPart(fsItem: FileSystemDirectory) {
        if (this.currentPathParts.length === 0) return;
        const nextPathPart = this.currentPathParts.shift();
        const nextNode = fsItem.children[nextPathPart];
        this.visitNode(nextNode);
    }

    private visitNode(fsItem: FileSystemItem) {
        this.foundNode = fsItem;

        switch (fsItem.type) {
            case ITEM_MODE_ROOT: {
                this.visitNextPathPart(fsItem);
                break;
            }
            case ITEM_MODE_FILE: {
                this.currentPathParts.shift();
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                this.visitNextPathPart(fsItem);
                break;
            }
        }
    }
}