import {MenuOptions} from "@imengyu/vue3-context-menu";
import {HexViewerCtxActionDownloadSelection} from "./Actions/HexViewerCtxActionDownloadSelection";
import {HexViewerCtxActionExportToJson} from "./Actions/HexViewerCtxActionExportToJson";
import {HexViewerCtxActionJumpToSelection} from "./Actions/HexViewerCtxActionJumpToSelection";

export const prepareContextMenuOptions = (e: MouseEvent): MenuOptions => {
    return {
        x: e.x,
        y: e.y,
        customClass: "menu-trick",
        theme: "flat dark",
        clickCloseOnOutside: true,
        items: [
            HexViewerCtxActionDownloadSelection(),
            HexViewerCtxActionExportToJson(false),
            HexViewerCtxActionExportToJson(true),
            HexViewerCtxActionJumpToSelection(),
            HexViewerCtxActionJumpToSelection(true)
        ]
    };
};