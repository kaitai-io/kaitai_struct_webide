export class FileSystemFilesCollectorV0 {
    public static collectFileNames(fsItem: any): string[] {
        if (!fsItem) return [];
        return new FileSystemFilesCollectorV0().collectFiles(fsItem);
    }

    private readonly collectedPaths: string[];

    private constructor() {
        this.collectedPaths = [];
    }

    private collectFiles(fsItem: any) {
        this.visitNode(fsItem);
        return this.collectedPaths;
    }

    private visitNode(fsItem: any) {
        switch (fsItem.type) {
            case "file": {
                this.collectedPaths.push((fsItem as any)?.fn);
                break;
            }
            case "folder": {
                Object.entries(fsItem.children || {})
                    .forEach(([key, child]) => this.visitNode(child));
                break;
            }
        }
    }
}