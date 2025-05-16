import {FileSystem, FileSystemDirectory, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE, ITEM_MODE_ROOT} from "../FileSystemsTypes";


export class FileSystemCommandLineTreeMapper {
    public static mapToCommandLineView(fileSystem: FileSystem): string {
        return new FileSystemCommandLineTreeMapper().map(fileSystem);
    }

    private buffer: string = "";
    private indents: string[] = [];

    private constructor() {
    }

    private map(fileSystem: FileSystem) {
        this.visitFileSystem(fileSystem);
        return this.buffer;
    }

    private visitFileSystem(fileSystem: FileSystem) {
        const rootNode = fileSystem.getRootNode();
        if (!rootNode) {
            return;
        }

        this.visitNode(rootNode, true);
    }


    private visitChildrenNodes(fsItem: FileSystemDirectory, isLast: boolean) {
        this.indents.push(isLast ? "   " : "|  ");

        const children = Object.values(fsItem.children || {});
        for (let i = 0; i < children.length; i++) {
            const isLast = children.length - 1 === i;
            this.visitNode(children[i], isLast);
        }
        this.indents.pop();
    }

    private visitNode(fsItem: FileSystemItem, isLast: boolean) {
        switch (fsItem.type) {
            case ITEM_MODE_FILE: {
                this.visitFileNode(fsItem, isLast);
                break;
            }
            case ITEM_MODE_ROOT: {
                this.visitRootNode(fsItem, isLast);
                this.visitChildrenNodes(fsItem, isLast);
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                this.visitDirectoryNode(fsItem, isLast);
                this.visitChildrenNodes(fsItem, isLast);

                break;
            }
        }
    }

    private formatIndent = () => {
        return this.indents.join("");
    };

    private formatTreeIndicator = (isLast: boolean) => {
        return isLast ? "└-" : "|-";
    };


    private visitFileNode(fsItem: FileSystemItem, isLast: boolean) {
        const nodeText = `${this.formatIndent()}${this.formatTreeIndicator(isLast)}📄 ${fsItem.name}`;
        this.buffer += `${nodeText}\n`;
    }

    private visitDirectoryNode(fsItem: FileSystemItem, isLast: boolean) {
        const nodeText = `${this.formatIndent()}${this.formatTreeIndicator(isLast)}📁 ${fsItem.name}`;
        this.buffer += `${nodeText}\n`;
    }

    private visitRootNode(fsItem: FileSystemItem, isLast: boolean) {
        const nodeText = `${this.formatIndent()}${this.formatTreeIndicator(isLast)}💾 ${fsItem.name}`;
        this.buffer += `${nodeText}\n`;
    }


}