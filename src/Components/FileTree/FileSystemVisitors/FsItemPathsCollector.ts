import {IFsItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../../../v1/FileSystems/FileSystemsTypes";

export class FsItemPathsCollector {
    public static collectFiles(fsItem: IFsItem): string[] {
        return new FsItemPathsCollector().collectFiles(fsItem);
    }

    private readonly collectedPaths: string[];

    private constructor() {
        this.collectedPaths = [];
    }

    private collectFiles(fsItem: IFsItem) {
        this.visitNode(fsItem);
        return this.collectedPaths;
    }

    private visitNode(fsItem: IFsItem) {
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