import {MenuOptions} from "@imengyu/vue3-context-menu";
import {TreeNodeDisplay} from "../FileSystemVisitors/FileSystemFileTreeMapper";
import {FileTreeCtxActionGenerateParser} from "./Actions/common/FileTreeCtxActionGenerateParser";
import {FileTreeCtxActionClone} from "./Actions/localStorage/FileTreeCtxActionClone";
import {FileTreeCtxActionDownload} from "./Actions/common/FileTreeCtxActionDownload";
import {FileTreeCtxActionOpenKsy} from "./Actions/common/FileTreeCtxActionOpenKsy";
import {FileTreeCtxActionDelete} from "./Actions/common/FileTreeCtxActionDelete";
import {FileTreeCtxActionOpenBinFile} from "./Actions/localStorage/FileTreeCtxActionOpenBinFile";
import {FileTreeCtxActionOpenDirectory} from "./Actions/common/FileTreeCtxActionOpenDirectory";
import {FileTreeCtxActionCloseDirectory} from "./Actions/common/FileTreeCtxActionCloseDirectory";
import {FileTreeCtxActionCreateDirectory} from "./Actions/localStorage/FileTreeCtxActionCreateDirectory";
import {FileTreeCtxActionCreateKsy} from "./Actions/localStorage/FileTreeCtxActionCreateKsy";
import {FileTreeCtxActionRename} from "./Actions/localStorage/FileTreeCtxActionRename";
import {FileTreeCtxActionOpenDistFile} from "./Actions/distStorage/FileTreeCtxActionOpenDistFile";
import {FILE_SYSTEM_TYPE_DIST} from "../FileSystems/LocalStorageFileSystem";
import {FileTreeCtxActionCopyToClipboard} from "./Actions/distStorage/FileTreeCtxActionCopyToClipboard";

const prepareDistContextActions = (item: TreeNodeDisplay) => {
    return [
        FileTreeCtxActionOpenDistFile(item),
        FileTreeCtxActionOpenDirectory(item),
        FileTreeCtxActionCloseDirectory(item),
        FileTreeCtxActionCopyToClipboard(item),
        FileTreeCtxActionDownload(item),
        FileTreeCtxActionDelete(item)
    ];
};

const prepareContentContextActions = (item: TreeNodeDisplay) => {
    return [
        FileTreeCtxActionOpenKsy(item),
        FileTreeCtxActionOpenBinFile(item),
        FileTreeCtxActionOpenDistFile(item),
        FileTreeCtxActionOpenDirectory(item),
        FileTreeCtxActionCloseDirectory(item),
        FileTreeCtxActionCreateDirectory(item),
        FileTreeCtxActionCreateKsy(item),
        FileTreeCtxActionRename(item),
        FileTreeCtxActionClone(item),
        FileTreeCtxActionGenerateParser(item),
        FileTreeCtxActionDownload(item),
        FileTreeCtxActionDelete(item)
    ];
};

const prepareActions = (item: TreeNodeDisplay) => {
    switch (item.storeId) {
        case FILE_SYSTEM_TYPE_DIST:
            return prepareDistContextActions(item);
        default:
            return prepareContentContextActions(item);
    }
};

export const prepareContextMenuOptions = (e: MouseEvent, item: TreeNodeDisplay): MenuOptions => {
    return {
        x: e.x,
        y: e.y,
        customClass: "menu-trick",
        theme: "flat dark",
        clickCloseOnOutside: true,
        items: prepareActions(item)
    };
};