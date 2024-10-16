import {FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";

export class FsItemPathsCollector {
    public static collectFiles(fsItem: FileSystemItem): string[] {
        return new FsItemPathsCollector().collectFiles(fsItem);
    }

    private readonly collectedPaths: string[];

    private constructor() {
        this.collectedPaths = [];
    }

    private collectFiles(fsItem: FileSystemItem) {
        this.visitNode(fsItem);
        return this.collectedPaths;
    }

    private visitNode(fsItem: FileSystemItem) {
        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                this.collectedPaths.push(fsItem.fn);
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                Object.entries(fsItem.children || {})
                    .forEach(([key, child]) => this.visitNode(child));
                break;
            }
        }
    }
}