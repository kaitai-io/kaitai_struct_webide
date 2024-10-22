import {FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";

export class FileSystemPathCollector {
    public static collectPaths(fsItem: FileSystemItem): string[] {
        if (fsItem === null) return [];
        return new FileSystemPathCollector().collectFiles(fsItem);
    }

    private readonly collectedPaths: string[];
    private currentPathParts: string[] = [];

    private constructor() {
        this.collectedPaths = [];
    }

    private collectFiles(fsItem: FileSystemItem) {
        this.visitRootNode(fsItem);
        return this.collectedPaths;
    }

    private pushCurrentPath() {
        this.collectedPaths.push(this.currentPathParts.join("/"));
    }

    private visitRootNode(fsItem: FileSystemItem) {
        if (fsItem.type === ITEM_MODE_FILE) {
            return;
        } else {
            this.visitChildren(fsItem);
        }
    }

    private visitChildren(fsItem: FileSystemItem) {
        const children = Object.entries(fsItem.children || {});

        children.forEach(([key, child]) => {
            this.visitNode(key, child);
        });
    }

    private visitNode(key: string, fsItem: FileSystemItem) {
        this.currentPathParts.push(key);

        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                this.pushCurrentPath();
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                const children = Object.entries(fsItem.children || {});
                if (children.length === 0) {
                    this.pushCurrentPath();
                } else {
                    this.visitChildren(fsItem);
                }
                break;
            }
        }

        this.currentPathParts.pop();

    }

}