import {MenuOptions} from "@imengyu/vue3-context-menu";
import {TreeNodeDisplay} from "../FileSystemVisitors/FileSystemFileTreeMapper";
import {FileTreeCtxActionGenerateParser} from "./Actions/FileTreeCtxActionGenerateParser";
import {FileTreeCtxActionClone} from "./Actions/FileTreeCtxActionClone";
import {FileTreeCtxActionDownload} from "./Actions/FileTreeCtxActionDownload";
import {FileTreeCtxActionOpenKsy} from "./Actions/FileTreeCtxActionOpenKsy";
import {FileTreeCtxActionDelete} from "./Actions/FileTreeCtxActionDelete";
import {FileTreeCtxActionOpenBinFile} from "./Actions/FileTreeCtxActionOpenBinFile";
import {FileTreeCtxActionOpenDirectory} from "./Actions/FileTreeCtxActionOpenDirectory";
import {FileTreeCtxActionCloseDirectory} from "./Actions/FileTreeCtxActionCloseDirectory";
import {FileTreeCtxActionCreateDirectory} from "./Actions/FileTreeCtxActionCreateDirectory";
import {FileTreeCtxActionCreateKsy} from "./Actions/FileTreeCtxActionCreateKsy";
import {FileTreeCtxActionRename} from "./Actions/FileTreeCtxActionRename";

export const prepareContextMenuOptions = (e: MouseEvent, item: TreeNodeDisplay): MenuOptions => {
    return {
        x: e.x,
        y: e.y,
        customClass: "menu-trick",
        theme: "flat dark",
        clickCloseOnOutside: true,
        items: [
            FileTreeCtxActionOpenKsy(item),
            FileTreeCtxActionOpenBinFile(item),
            FileTreeCtxActionOpenDirectory(item),
            FileTreeCtxActionCloseDirectory(item),
            FileTreeCtxActionCreateDirectory(item),
            FileTreeCtxActionCreateKsy(item),
            FileTreeCtxActionRename(item),
            FileTreeCtxActionClone(item),
            FileTreeCtxActionGenerateParser(item),
            FileTreeCtxActionDownload(item),
            FileTreeCtxActionDelete(item)
        ]
    };
};