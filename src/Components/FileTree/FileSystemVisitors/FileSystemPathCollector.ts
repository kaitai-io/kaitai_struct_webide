import {FileSystemDirectory, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE, ITEM_MODE_ROOT} from "../FileSystemsTypes";


export class FileSystemPathCollector {
    public static collectPaths(root: FileSystemItem, pathToCollectFrom: string = "", returnRelativePaths: boolean = true): string[] {
        if (!root || root.type === ITEM_MODE_FILE) return [];
        const collectedPaths = new FileSystemPathCollector(pathToCollectFrom).collectFiles(root);
        return returnRelativePaths
            ? collectedPaths.map(collectedPath => FileSystemPathCollector.mapPathToRelativePath(pathToCollectFrom, collectedPath))
            : collectedPaths;
    }

    private static mapPathToRelativePath(basePath: string, fullPath: string) {
        let relativePath = fullPath.replace(basePath, "");
        return relativePath.startsWith("/")
            ? relativePath.substring(1)
            : relativePath;
    }

    private readonly collectedPaths: string[];
    private pathToCollectFrom: string;
    private currentPathParts: string[] = [];

    private constructor(pathToCollectFrom: string) {
        this.collectedPaths = [];
        this.pathToCollectFrom = pathToCollectFrom;
    }

    private collectFiles(fsItem: FileSystemItem) {
        this.visitNode(fsItem);
        return this.collectedPaths;
    }

    private pushCurrentPath() {
        if (this.expectedPathMatchesCurrentPath()) {
            this.collectedPaths.push(this.currentPathParts.join("/"));

        }
    }

    private addPathPart(name: string) {
        this.currentPathParts.push(name);
    }

    private expectedPathMatchesCurrentPath() {
        return this.currentPathParts.join("/").startsWith(this.pathToCollectFrom);
    }

    private removeLastPathPart() {
        this.currentPathParts.pop();
    }

    private visitDirectoryChildren(fsItem: FileSystemDirectory) {
        Object.values(fsItem.children || {}).forEach(node => this.visitNode(node));
    }

    private visitNode(fsItem: FileSystemItem) {
        switch (fsItem.type) {
            case ITEM_MODE_ROOT: {
                this.visitDirectoryChildren(fsItem);
                break;
            }
            case ITEM_MODE_FILE: {
                this.addPathPart(fsItem.name);
                this.pushCurrentPath();
                this.removeLastPathPart();
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                this.addPathPart(fsItem.name);
                const isFolderEmpty = Object.entries(fsItem.children || {}).length === 0;

                isFolderEmpty
                    ? this.pushCurrentPath()
                    : this.visitDirectoryChildren(fsItem);

                this.removeLastPathPart();
                break;
            }
        }
    }
}